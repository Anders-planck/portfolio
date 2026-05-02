import { describe, expect, it } from "vitest";
import { projectsBackHref } from "#/routes/projects/$slug";

describe("ProjectDetail", () => {
	it("links back to the home projects section", async () => {
		expect(projectsBackHref).toBe("/#projects");
	});
});
