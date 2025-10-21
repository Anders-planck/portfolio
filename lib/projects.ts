import path from "path";
import fs from "fs";
import matter from "gray-matter";

const rootPostDirectory =  path.join(process.cwd(), "content", "projects");

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
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
    const filePath = path.join(rootPostDirectory, `${slug}.mdx`);
    try {
        const fileContent = await fs.readFileSync(filePath, { encoding: "utf-8" });
        
        const {data, content} = matter(fileContent); // Parse front matter and content

        return {
            metadata: {...data, slug},
            content
        }
    } catch (error) {
        console.error("Error reading post file:", error);
        return null;
    }
}

export async function getProjects(limit?: number): Promise<ProjectMetadata[]> {
    const files = await fs.readdirSync(rootPostDirectory);
    const projects = files
        .filter((fileName) => !fileName.startsWith('_')) // Exclude template files
        .map((fileName) => getProjectMetadata(fileName))
        .sort((a, b) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA; // Newest first
        });
    
    if (limit) {
        return projects.slice(0, limit);
    }

    return projects;
}

export function getProjectMetadata(fileName: string): ProjectMetadata {
    const slug = fileName.replace(/\.mdx?$/, '');
    const filePath = path.join(rootPostDirectory, fileName);
    const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
    const { data } = matter(fileContent); // Parse front matter

    return {
        ...data,
        slug
    }
}