import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Timeline } from "#/components/timeline";

afterEach(cleanup);

describe("Timeline", () => {
	it("renders label and items", () => {
		const items = [
			{
				title: "Software Engineer",
				subtitle: "Madisoft",
				period: "Mar 2026 — Present",
				isCurrent: true,
			},
			{
				title: "Full Stack Developer",
				subtitle: "A-Cube S.R.L.",
				period: "Jan 2023 — Feb 2026",
				description: "Built 9+ projects",
				isCurrent: false,
			},
		];
		render(<Timeline label="Experience" items={items} />);
		expect(screen.getByText("Experience")).toBeDefined();
		expect(screen.getByText("Software Engineer")).toBeDefined();
		expect(screen.getByText("Madisoft")).toBeDefined();
		expect(screen.getByText("Built 9+ projects")).toBeDefined();
	});
});
