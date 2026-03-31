import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectRow } from "#/components/project-row";
import { projects } from "#/data/projects";

function renderWithRouter(ui: React.ReactElement) {
	const rootRoute = createRootRoute({ component: () => ui });
	const router = createRouter({
		routeTree: rootRoute,
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});
	return render(<RouterProvider router={router} />);
}

afterEach(cleanup);

describe("ProjectRow", () => {
	it("renders project title and impact", async () => {
		renderWithRouter(<ProjectRow project={projects[0]} />);
		await waitFor(() => {
			expect(screen.getByText("Open Banking UI")).toBeDefined();
		});
		expect(screen.getByText(/50K\+/)).toBeDefined();
	});
});
