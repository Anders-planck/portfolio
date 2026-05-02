import {
	type Project,
	type ProjectMetadata,
	type ProjectResult,
	projects,
} from "#/data/projects";

interface ProjectContent {
	title: string;
	summary: string;
	role: string;
	company: string;
	impact: string;
	challenge: string;
	solution: string[];
	results: Array<Pick<ProjectResult, "label">>;
	learnings: string;
	media: {
		label: string;
		detail: string;
	};
}

export type ProjectContentBySlug = Record<string, ProjectContent>;

const projectContentLoaders = {
	de: () => import("#/content/projects/de.json"),
	en: () => import("#/content/projects/en.json"),
	fr: () => import("#/content/projects/fr.json"),
	it: () => import("#/content/projects/it.json"),
} as const;

type ProjectContentLanguage = keyof typeof projectContentLoaders;
const fallbackLanguage = "en";

export function resolveProjectLanguage(
	language: string | null | undefined,
): ProjectContentLanguage {
	return language && language in projectContentLoaders
		? (language as ProjectContentLanguage)
		: fallbackLanguage;
}

async function loadProjectContent(
	language: string | null | undefined,
): Promise<ProjectContentBySlug> {
	const resolvedLanguage = resolveProjectLanguage(language);
	const module = await projectContentLoaders[resolvedLanguage]();
	return module.default as ProjectContentBySlug;
}

function mergeProject(
	metadata: ProjectMetadata,
	content: ProjectContent,
	fallback: ProjectContent,
): Project {
	return {
		...metadata,
		challenge: content.challenge ?? fallback.challenge,
		company: content.company ?? fallback.company,
		impact: content.impact ?? fallback.impact,
		learnings: content.learnings ?? fallback.learnings,
		media: {
			tone: metadata.media.tone,
			detail: content.media?.detail ?? fallback.media.detail,
			label: content.media?.label ?? fallback.media.label,
		},
		results: metadata.results.map((result, index) => ({
			value: result.value,
			label:
				content.results[index]?.label ??
				fallback.results[index]?.label ??
				result.value,
		})),
		role: content.role ?? fallback.role,
		solution: content.solution ?? fallback.solution,
		summary: content.summary ?? fallback.summary,
		title: content.title ?? fallback.title,
	};
}

export function mergeLocalizedProjects(
	localizedContent: ProjectContentBySlug,
	fallbackContent: ProjectContentBySlug,
): Project[] {
	return projects.map((metadata) => {
		const fallback = fallbackContent[metadata.slug];
		const content = localizedContent[metadata.slug] ?? fallback;
		return mergeProject(metadata, content, fallback);
	});
}

export async function getLocalizedProjects(
	language: string | null | undefined,
): Promise<Project[]> {
	const [localizedContent, fallbackContent] = await Promise.all([
		loadProjectContent(language),
		loadProjectContent(fallbackLanguage),
	]);
	return mergeLocalizedProjects(localizedContent, fallbackContent);
}

export async function getLocalizedProjectBySlug(
	slug: string,
	language: string | null | undefined,
): Promise<Project | undefined> {
	const localizedProjects = await getLocalizedProjects(language);
	return localizedProjects.find((project) => project.slug === slug);
}
