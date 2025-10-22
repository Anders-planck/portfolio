import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { calculateReadingTime } from "./reading-time";
import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";

function getRootPostDirectory(locale: Locale) {
  return path.join(process.cwd(), "content", "posts", locale);
}

export type Post = {
    metadata: PostMetadata;
    content: string;
}

export type PostMetadata = {
    title?: string;
    summary?: string;
    image?: string;
    author?: string;
    publishedAt?: string;
    tags?: string[];
    slug?: string;
    readingTime?: string;
}

export async function getPostBySlug(slug: string, locale: Locale = defaultLocale): Promise<Post | null> {
    let filePath = path.join(getRootPostDirectory(locale), `${slug}.mdx`);

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
                filePath = path.join(getRootPostDirectory(defaultLocale), `${slug}.mdx`);
                const fileContent = await fs.promises.readFile(filePath, { encoding: "utf-8" });
                const {data, content} = matter(fileContent);
                const readingTime = calculateReadingTime(content);

                return {
                    metadata: {...data, slug, readingTime},
                    content
                }
            } catch (fallbackError) {
                console.error("Error reading post file (fallback also failed):", fallbackError);
                return null;
            }
        }

        console.error("Error reading post file:", error);
        return null;
    }
}

async function getPostMetadataAsync(fileName: string, locale: Locale = defaultLocale): Promise<PostMetadata> {
    const slug = fileName.replace(/\.mdx?$/, '');
    const rootPostDirectory = getRootPostDirectory(locale);
    const filePath = path.join(rootPostDirectory, fileName);

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

export async function getPosts(limit?: number, locale: Locale = defaultLocale): Promise<PostMetadata[]> {
    const rootPostDirectory = getRootPostDirectory(locale);

    // Check if directory exists, if not use default locale
    if (!fs.existsSync(rootPostDirectory)) {
        if (locale !== defaultLocale) {
            return getPosts(limit, defaultLocale);
        }
        return [];
    }

    const files = fs.readdirSync(rootPostDirectory);

    // Parallel file reading with Promise.all for better performance
    const posts = await Promise.all(
        files
            .filter((fileName) => !fileName.startsWith('_')) // Exclude template files
            .map((fileName) => getPostMetadataAsync(fileName, locale))
    );

    const sortedPosts = posts.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA; // Newest first
    });

    if (limit) {
        return sortedPosts.slice(0, limit);
    }

    return sortedPosts;
}

export function getPostMetadata(fileName: string, locale: Locale = defaultLocale): PostMetadata {
    const slug = fileName.replace(/\.mdx?$/, '');
    const rootPostDirectory = getRootPostDirectory(locale);
    const filePath = path.join(rootPostDirectory, fileName);
    const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
    const { data, content } = matter(fileContent); // Parse front matter and content
    const readingTime = calculateReadingTime(content);

    return {
        ...data,
        slug,
        readingTime
    }
}