import { createServerFn } from "@tanstack/react-start";

export interface GitHubData {
	contributions: number;
	lastActive: string; // "today", "yesterday", "3 days ago", etc.
	topLanguages: string[];
	publicRepos: number;
}

export const GITHUB_FALLBACK: GitHubData = {
	contributions: 800,
	lastActive: "today",
	topLanguages: ["TypeScript", "PHP", "Kotlin"],
	publicRepos: 8,
};

function formatLastActive(dateStr: string): string {
	const pushed = new Date(dateStr);
	const now = new Date();
	const diffMs = now.getTime() - pushed.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffHours < 1) return "just now";
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays === 1) return "yesterday";
	if (diffDays < 7) return `${diffDays}d ago`;
	return `${Math.floor(diffDays / 7)}w ago`;
}

export const fetchGitHubData = createServerFn({ method: "GET" }).handler(
	async (): Promise<GitHubData> => {
		const token = process.env.GITHUB_TOKEN;
		const headers: Record<string, string> = {
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "portfolio-v2",
		};
		if (token) {
			headers.Authorization = `Bearer ${token}`;
		}

		try {
			// Fetch user profile + recent events in parallel
			const [userRes, eventsRes, reposRes] = await Promise.all([
				fetch("https://api.github.com/users/Anders-planck", { headers }),
				fetch("https://api.github.com/users/Anders-planck/events?per_page=1", {
					headers,
				}),
				fetch(
					"https://api.github.com/users/Anders-planck/repos?per_page=100&sort=pushed",
					{ headers },
				),
			]);

			if (!userRes.ok) return GITHUB_FALLBACK;

			const user = await userRes.json();

			// Last active from events
			let lastActive = "recently";
			if (eventsRes.ok) {
				const events = await eventsRes.json();
				if (events.length > 0) {
					lastActive = formatLastActive(events[0].created_at);
				}
			}

			// Top languages from repos
			const topLanguages: string[] = [];
			if (reposRes.ok) {
				const repos = await reposRes.json();
				const langCount: Record<string, number> = {};
				for (const repo of repos) {
					if (repo.language && !repo.fork) {
						langCount[repo.language] = (langCount[repo.language] || 0) + 1;
					}
				}
				const sorted = Object.entries(langCount)
					.sort((a, b) => b[1] - a[1])
					.slice(0, 3);
				for (const [lang] of sorted) {
					topLanguages.push(lang);
				}
			}

			// Contributions: estimate from public repos (exact count needs GraphQL)
			// Use public_repos * ~100 as rough estimate, or fetch contribution page
			const contributions = user.public_repos * 120;

			return {
				contributions,
				lastActive,
				topLanguages:
					topLanguages.length > 0 ? topLanguages : GITHUB_FALLBACK.topLanguages,
				publicRepos: user.public_repos,
			};
		} catch {
			return GITHUB_FALLBACK;
		}
	},
);
