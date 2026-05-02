import { describe, expect, it } from "vitest";
import {
	getFeaturedProjects,
	getProjectBySlug,
	projects,
} from "#/data/projects";

describe("projects", () => {
	it("has exactly 5 projects", () => {
		expect(projects).toHaveLength(5);
	});

	it("each project has required fields", () => {
		for (const p of projects) {
			expect(p.slug).toBeTruthy();
			expect(p.tags.length).toBeGreaterThan(0);
			expect(p.results.length).toBeGreaterThan(0);
			expect(p.media).toMatchObject({
				tone: expect.any(String),
			});
			expect("title" in p).toBe(false);
			expect(p.results[0]).toMatchObject({ value: expect.any(String) });
		}
	});

	it("getProjectBySlug returns correct project", () => {
		const p = getProjectBySlug("open-banking-ui");
		expect(p?.slug).toBe("open-banking-ui");
		expect(p?.tags).toContain("React");
	});

	it("getProjectBySlug returns undefined for unknown slug", () => {
		expect(getProjectBySlug("nope")).toBeUndefined();
	});

	it("getFeaturedProjects returns first 3", () => {
		expect(getFeaturedProjects()).toHaveLength(3);
	});
});
