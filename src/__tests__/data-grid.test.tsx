import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DataGrid } from "#/components/data-grid";

afterEach(cleanup);

describe("DataGrid", () => {
	it("renders skill categories", () => {
		render(<DataGrid />);
		expect(screen.getByText("Frontend")).toBeDefined();
		expect(screen.getByText("Backend")).toBeDefined();
		expect(screen.getByText("Infra")).toBeDefined();
	});

	it("renders years of experience", () => {
		render(<DataGrid />);
		expect(screen.getByText("Experience")).toBeDefined();
	});
});
