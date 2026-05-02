import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectRow } from "#/components/project-row";
import i18n from "#/i18n";
import { getLocalizedProjectBySlug } from "#/lib/project-content";

function renderWithRouter(ui: React.ReactElement) {
	const rootRoute = createRootRoute({ component: () => ui });
	const router = createRouter({
		routeTree: rootRoute,
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});
	return render(<RouterProvider router={router} />);
}

afterEach(async () => {
	cleanup();
	await i18n.changeLanguage("en");
});

describe("ProjectRow", () => {
	it("renders project title and impact", async () => {
		const project = await getLocalizedProjectBySlug("open-banking-ui", "en");
		if (!project) throw new Error("missing project fixture");

		renderWithRouter(<ProjectRow project={project} />);
		await waitFor(() => {
			expect(screen.getByText("Open Banking UI")).toBeDefined();
		});
		expect(screen.getByText(/50K\+/)).toBeDefined();
	});

	it("renders translated project content", async () => {
		await i18n.changeLanguage("fr");
		const project = await getLocalizedProjectBySlug("open-banking-ui", "fr");
		if (!project) throw new Error("missing project fixture");

		renderWithRouter(<ProjectRow project={project} />);

		await waitFor(() => {
			expect(screen.getByText("Interface Open Banking")).toBeDefined();
		});
		expect(
			screen.getByText(/Interface de paiement SEPA conforme PSD2/),
		).toBeDefined();
		expect(screen.queryByText("Open Banking UI")).toBeNull();
	});
});
