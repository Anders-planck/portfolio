import { createServerFn } from "@tanstack/react-start";
import {
	getLocalizedProjectBySlug,
	getLocalizedProjects,
} from "#/lib/project-content";

interface ProjectsInput {
	language?: string | null;
}

interface ProjectInput extends ProjectsInput {
	slug: string;
}

function parseProjectsInput(input: unknown): ProjectsInput {
	if (!input || typeof input !== "object") return {};
	const language = (input as ProjectsInput).language;
	return typeof language === "string" ? { language } : {};
}

function parseProjectInput(input: unknown): ProjectInput {
	if (!input || typeof input !== "object") return { slug: "" };
	const candidate = input as Partial<ProjectInput>;
	return {
		language:
			typeof candidate.language === "string" ? candidate.language : null,
		slug: typeof candidate.slug === "string" ? candidate.slug : "",
	};
}

export const fetchProjects = createServerFn({ method: "GET" })
	.inputValidator(parseProjectsInput)
	.handler(async ({ data }) => getLocalizedProjects(data.language));

export const fetchProjectBySlug = createServerFn({ method: "GET" })
	.inputValidator(parseProjectInput)
	.handler(
		async ({ data }) =>
			(await getLocalizedProjectBySlug(data.slug, data.language)) ?? null,
	);
