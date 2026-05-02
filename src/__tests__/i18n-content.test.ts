import { describe, expect, it } from "vitest";
import i18n, { loadLanguageResource } from "#/i18n";

const languages = ["en", "fr", "it", "de"] as const;

describe("i18n content", () => {
	it("keeps UI translations in namespaces without project CMS content", async () => {
		for (const language of languages) {
			await i18n.changeLanguage(language);

			expect(i18n.t("nav.projects", { ns: "common" })).not.toBe("nav.projects");
			expect(i18n.t("selectedWork", { ns: "home" })).not.toBe("selectedWork");
			expect(i18n.t("impact", { ns: "project" })).not.toBe("impact");
			const resource = await loadLanguageResource(language);
			for (const namespace of Object.values(resource)) {
				expect(namespace).not.toHaveProperty("projects");
			}
		}
	});
});
