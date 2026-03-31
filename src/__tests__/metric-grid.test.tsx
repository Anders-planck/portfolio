import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MetricGrid } from "#/components/metric-grid";

afterEach(cleanup);

describe("MetricGrid", () => {
	it("renders all results", () => {
		const results = [
			{ value: "50K+", label: "Transactions" },
			{ value: "-60%", label: "Onboarding" },
		];
		render(<MetricGrid results={results} />);
		expect(screen.getByText("50K+")).toBeDefined();
		expect(screen.getByText("-60%")).toBeDefined();
		expect(screen.getByText("Transactions")).toBeDefined();
	});
});
