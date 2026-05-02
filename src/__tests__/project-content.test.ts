import { describe, expect, it } from "vitest";
import {
	getLocalizedProjectBySlug,
	getLocalizedProjects,
} from "#/lib/project-content";

describe("project content CMS", () => {
	it("returns localized project data for the requested language", async () => {
		const projects = await getLocalizedProjects("fr");

		expect(projects).toHaveLength(5);
		expect(projects[0]).toMatchObject({
			slug: "open-banking-ui",
			title: "Interface Open Banking",
			impact:
				"50K+ transactions traitées au premier trimestre. Temps d’onboarding réduit de 60%.",
		});
		expect(projects[0].solution).toHaveLength(5);
		expect(projects[0].results[0].label).toBe("Transactions T1");
	});

	it("falls back to English for unsupported languages", async () => {
		const project = await getLocalizedProjectBySlug("open-banking-ui", "es");

		expect(project?.title).toBe("Open Banking UI");
		expect(project?.summary).toContain("PSD2-compliant");
	});

	it("returns undefined for unknown project slugs", async () => {
		await expect(
			getLocalizedProjectBySlug("missing", "de"),
		).resolves.toBeUndefined();
	});
});
