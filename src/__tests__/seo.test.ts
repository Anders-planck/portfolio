import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { projects } from "#/data/projects";
import { siteConfig } from "#/data/site";
import { Route as RootRoute } from "#/routes/__root";

describe("SEO", () => {
	it("exposes canonical and social metadata", async () => {
		const getHead = RootRoute.options.head as (ctx: unknown) => Promise<{
			links?: Array<Record<string, string>>;
			meta?: Array<Record<string, string>>;
		}>;
		const head = await getHead({});
		const meta = (head?.meta ?? []) as Array<Record<string, string>>;
		const links = (head?.links ?? []) as Array<Record<string, string>>;

		expect(
			links.some(
				(link) => link.rel === "canonical" && link.href === siteConfig.url,
			),
		).toBe(true);
		expect(
			meta.some(
				(item) =>
					item.property === "og:title" && item.content === siteConfig.title,
			),
		).toBe(true);
		expect(
			meta.some(
				(item) =>
					item.property === "og:image" && item.content === siteConfig.ogImage,
			),
		).toBe(true);
		expect(
			meta.some(
				(item) =>
					item.name === "twitter:card" &&
					item.content === "summary_large_image",
			),
		).toBe(true);
	});

	it("publishes sitemap entries for home and project pages", () => {
		const sitemapPath = join(process.cwd(), "public", "sitemap.xml");
		expect(existsSync(sitemapPath)).toBe(true);

		const sitemap = readFileSync(sitemapPath, "utf8");

		expect(sitemap).toContain(`<loc>${siteConfig.url}/</loc>`);
		for (const project of projects) {
			expect(sitemap).toContain(
				`<loc>${siteConfig.url}/projects/${project.slug}</loc>`,
			);
		}
	});

	it("exposes sitemap location in robots.txt", () => {
		const robots = readFileSync(
			join(process.cwd(), "public", "robots.txt"),
			"utf8",
		);

		expect(robots).toContain(`Sitemap: ${siteConfig.url}/sitemap.xml`);
	});
});
