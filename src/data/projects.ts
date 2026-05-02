export interface ProjectResult {
	value: string;
	label: string;
}

export type ProjectMediaTone =
	| "banking"
	| "stripe"
	| "native"
	| "learning"
	| "documents";

export interface ProjectMedia {
	label: string;
	detail: string;
	tone: ProjectMediaTone;
}

export interface Project {
	slug: string;
	title: string;
	summary: string;
	tags: string[];
	role: string;
	company: string;
	year: string;
	impact: string;
	challenge: string;
	solution: string[];
	results: ProjectResult[];
	learnings: string;
	media: ProjectMedia;
	github?: string;
	live?: string;
}

export interface ProjectMetadata {
	slug: string;
	tags: string[];
	year: string;
	results: Array<Pick<ProjectResult, "value">>;
	media: Pick<ProjectMedia, "tone">;
	github?: string;
	live?: string;
}

export const projectCount = 5;

export const projects: ProjectMetadata[] = [
	{
		slug: "open-banking-ui",
		tags: ["React", "TypeScript", "Vite", "React Intl", "PDF.js"],
		year: "2024",
		results: [{ value: "50K+" }, { value: "-60%" }, { value: "99.7%" }],
		media: { tone: "banking" },
	},
	{
		slug: "stripe-app-extension",
		tags: ["React", "TypeScript", "Stripe API", "Context API"],
		year: "2024",
		results: [{ value: "85%" }, { value: "3" }, { value: "173" }],
		media: { tone: "stripe" },
	},
	{
		slug: "expo-mutual-tls",
		tags: ["React Native", "Expo", "Swift", "Kotlin", "TypeScript"],
		year: "2025",
		results: [{ value: "2" }, { value: "100%" }, { value: "OSS" }],
		media: { tone: "native" },
	},
	{
		slug: "wortschatz",
		tags: ["Expo", "React Native", "Gemini AI", "FSRS", "TypeScript"],
		year: "2026",
		results: [{ value: "FSRS" }, { value: "Gemini" }, { value: "Offline" }],
		media: { tone: "learning" },
		github: "https://github.com/Anders-planck/wortschatz",
	},
	{
		slug: "parseur",
		tags: ["Next.js", "TypeScript", "OpenAI", "Claude", "Prisma", "PostgreSQL"],
		year: "2025",
		results: [{ value: "2" }, { value: "Auto" }, { value: "Live" }],
		media: { tone: "documents" },
		github: "https://github.com/Anders-planck/parseur",
		live: "https://parseur.vercel.app",
	},
];

export function getProjectBySlug(slug: string): ProjectMetadata | undefined {
	return projects.find((project) => project.slug === slug);
}

export function getFeaturedProjects(): ProjectMetadata[] {
	return projects.slice(0, 3);
}
