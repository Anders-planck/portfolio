import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitcher } from "#/components/language-switcher";
import i18n from "#/i18n";

describe("LanguageSwitcher", () => {
	beforeEach(async () => {
		localStorage.clear();
		document.documentElement.lang = "en";
		await i18n.changeLanguage("en");
	});

	afterEach(cleanup);

	it("renders supported languages with flag icon classes", () => {
		render(<LanguageSwitcher />);

		fireEvent.click(screen.getByRole("button", { name: /select language/i }));

		expect(screen.getByRole("listbox").getAttribute("aria-orientation")).toBe(
			"vertical",
		);
		expect(screen.getByRole("option", { name: /english/i })).toBeTruthy();
		expect(screen.getByRole("option", { name: /français/i })).toBeTruthy();
		expect(screen.getByRole("option", { name: /italiano/i })).toBeTruthy();
		expect(screen.getByRole("option", { name: /deutsch/i })).toBeTruthy();
		expect(screen.getByRole("listbox").querySelectorAll("img")).toHaveLength(4);
	});

	it("persists the selected language and updates document lang", () => {
		const onChange = vi.fn();
		render(<LanguageSwitcher onChange={onChange} />);
		const selectButton = screen.getByRole("button", {
			name: /select language/i,
		});

		fireEvent.click(selectButton);
		fireEvent.click(screen.getByRole("option", { name: /français/i }));

		expect(localStorage.getItem("portfolio-language")).toBe("fr");
		expect(document.documentElement.lang).toBe("fr");
		expect(onChange).toHaveBeenCalledWith("fr");
		expect(selectButton.textContent).toContain("FR");
		expect(screen.queryByRole("listbox")).toBeNull();

		fireEvent.click(selectButton);
		expect(
			screen
				.getByRole("option", { name: /français/i })
				.getAttribute("aria-selected"),
		).toBe("true");
	});
});
