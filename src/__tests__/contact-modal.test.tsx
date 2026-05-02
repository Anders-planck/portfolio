import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ContactModal } from "#/components/contact-modal";

beforeAll(() => {
	HTMLDialogElement.prototype.showModal = function showModal() {
		this.open = true;
	};
	HTMLDialogElement.prototype.close = function close() {
		this.open = false;
	};
});

afterEach(cleanup);

describe("ContactModal", () => {
	it("renders as a named dialog", () => {
		render(<ContactModal open={true} onClose={() => {}} />);

		expect(
			screen.getByRole("dialog", { name: /contact options/i }),
		).toBeTruthy();
	});

	it("closes from the close button", () => {
		const onClose = vi.fn();
		render(<ContactModal open={true} onClose={onClose} />);

		fireEvent.click(screen.getByRole("button", { name: /close/i }));

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
