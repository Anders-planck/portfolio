import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Footer } from "#/components/footer";

afterEach(cleanup);

describe("Footer", () => {
	it("renders copyright with current year", () => {
		render(<Footer />);
		const year = new Date().getFullYear();
		expect(screen.getByText(new RegExp(`${year}`))).toBeDefined();
	});

	it("renders social links", () => {
		render(<Footer />);
		expect(screen.getByText("GitHub")).toBeDefined();
		expect(screen.getByText("LinkedIn")).toBeDefined();
		expect(screen.getByText("Email")).toBeDefined();
	});
});
