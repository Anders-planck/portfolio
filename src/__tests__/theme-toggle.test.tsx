import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "#/components/theme-toggle";

describe("ThemeToggle", () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.className = "";
		Object.defineProperty(window, "matchMedia", {
			configurable: true,
			value: vi.fn().mockReturnValue({ matches: false }),
		});
	});

	afterEach(cleanup);

	it("persists the selected theme and updates the document class", () => {
		render(<ThemeToggle />);

		const toggle = screen.getByRole("button", {
			name: /theme: dark. click to change/i,
		});

		fireEvent.click(toggle);

		expect(localStorage.getItem("theme")).toBe("light");
		expect(document.documentElement.classList.contains("dark")).toBe(false);
		expect(
			screen.getByRole("button", { name: /theme: light. click to change/i }),
		).toBeTruthy();
	});
});
