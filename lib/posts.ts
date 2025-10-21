import path from "path";
import fs from "fs";
import matter from "gray-matter";

const rootPostDirectory =  path.join(process.cwd(), "content", "posts");

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
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
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

export async function getPosts(limit?: number): Promise<PostMetadata[]> {
    const files = await fs.readdirSync(rootPostDirectory);

    const posts = files.map((fileName) => getPostMetadata(fileName))
    .sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA; // Newest first
    });
    
    if (limit) {
        return posts.slice(0, limit);
    }

    return posts;
}

export function getPostMetadata(fileName: string): PostMetadata {
    const slug = fileName.replace(/\.mdx?$/, '');
    const filePath = path.join(rootPostDirectory, fileName);
    const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
    const { data } = matter(fileContent); // Parse front matter

    return {
        ...data,
        slug
    }
}