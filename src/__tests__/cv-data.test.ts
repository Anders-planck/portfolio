import { describe, expect, it } from "vitest";
import { CAREER_START, getYearsOfExperience } from "#/data/cv-data";

describe("cv-data", () => {
	it("calculates years of experience from career start", () => {
		const years = getYearsOfExperience();
		const expected = Math.floor(
			(Date.now() - CAREER_START.getTime()) / (365.25 * 86400000),
		);
		expect(years).toBe(expected);
		expect(years).toBeGreaterThanOrEqual(3);
	});
});
