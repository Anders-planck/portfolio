import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { calculateReadingTime } from "./reading-time";
import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import { cache } from "react";

function getRootProjectDirectory(locale: Locale) {
  return path.join(process.cwd(), "content", "projects", locale);
}

export type Project = {
    metadata: ProjectMetadata;
    content: string;
}

export type ProjectMetadata = {
    title?: string;
    summary?: string;
    image?: string;
    author?: string;
    publishedAt?: string;
    tags?: string[];
    slug?: string;
    readingTime?: string;
}

// Cache getProjectBySlug to prevent duplicate calls in the same request (generateMetadata + page component)
export const getProjectBySlug = cache(async (slug: string, locale: Locale = defaultLocale): Promise<Project | null> => {
    let filePath = path.join(getRootProjectDirectory(locale), `${slug}.mdx`);

    // Try requested locale first
    try {
        const fileContent = await fs.promises.readFile(filePath, { encoding: "utf-8" });
        const {data, content} = matter(fileContent);
        const readingTime = calculateReadingTime(content);

        return {
            metadata: {...data, slug, readingTime},
            content
        }
    } catch (error) {
        // Fallback to default locale if requested locale doesn't exist
        if (locale !== defaultLocale) {
            try {
                filePath = path.join(getRootProjectDirectory(defaultLocale), `${slug}.mdx`);
                const fileContent = await fs.promises.readFile(filePath, { encoding: "utf-8" });
                const {data, content} = matter(fileContent);
                const readingTime = calculateReadingTime(content);

                return {
                    metadata: {...data, slug, readingTime},
                    content
                }
            } catch (fallbackError) {
                console.error("Error reading project file (fallback also failed):", fallbackError);
                return null;
            }
        }

        console.error("Error reading project file:", error);
        return null;
    }
});

async function getProjectMetadataAsync(fileName: string, locale: Locale = defaultLocale): Promise<ProjectMetadata> {
    const slug = fileName.replace(/\.mdx?$/, '');
    const rootProjectDirectory = getRootProjectDirectory(locale);
    const filePath = path.join(rootProjectDirectory, fileName);

    // Use async file reading for better performance
    const fileContent = await fs.promises.readFile(filePath, { encoding: "utf-8" });
    const { data, content } = matter(fileContent);
    const readingTime = calculateReadingTime(content);

    return {
        ...data,
        slug,
        readingTime
    }
}

export const getProjects = cache(async (limit?: number, locale: Locale = defaultLocale): Promise<ProjectMetadata[]> => {
    const rootProjectDirectory = getRootProjectDirectory(locale);

    // Check if directory exists, if not use default locale
    if (!fs.existsSync(rootProjectDirectory)) {
        if (locale !== defaultLocale) {
            return getProjects(limit, defaultLocale);
        }
        return [];
    }

    const files = fs.readdirSync(rootProjectDirectory);

    // Parallel file reading with Promise.all for better performance
    const projects = await Promise.all(
        files
            .filter((fileName) => !fileName.startsWith('_')) // Exclude template files
            .map((fileName) => getProjectMetadataAsync(fileName, locale))
    );

    const sortedProjects = projects.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA; // Newest first
    });

    if (limit) {
        return sortedProjects.slice(0, limit);
    }

    return sortedProjects;
});

export function getProjectMetadata(fileName: string, locale: Locale = defaultLocale): ProjectMetadata {
    const slug = fileName.replace(/\.mdx?$/, '');
    const rootProjectDirectory = getRootProjectDirectory(locale);
    const filePath = path.join(rootProjectDirectory, fileName);
    const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
    const { data, content } = matter(fileContent); // Parse front matter and content
    const readingTime = calculateReadingTime(content);

    return {
        ...data,
        slug,
        readingTime
    }
}
