import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "#/langs/en.json";

export const languages = [
	{ code: "en", label: "English", flag: "gb" },
	{ code: "fr", label: "Français", flag: "fr" },
	{ code: "it", label: "Italiano", flag: "it" },
	{ code: "de", label: "Deutsch", flag: "de" },
] as const;

export type LanguageCode = (typeof languages)[number]["code"];

export const languageStorageKey = "portfolio-language";
const languageCodes = languages.map((language) => language.code);
const namespaces = ["common", "home", "contact", "project"] as const;

type Namespace = (typeof namespaces)[number];
type LanguageResource = Record<Namespace, Record<string, unknown>>;

const languageResourceLoaders = import.meta.glob<LanguageResource>(
	["./langs/*.json", "!./langs/en.json"],
	{
		import: "default",
	},
);
const languageResourceCache = new Map<
	LanguageCode,
	Promise<LanguageResource>
>();

export function isLanguageCode(value: string | null): value is LanguageCode {
	return languageCodes.includes(value as LanguageCode);
}

function getInitialLanguage(): LanguageCode {
	if (typeof window === "undefined") return "en";

	try {
		const storedLanguage = window.localStorage.getItem(languageStorageKey);
		if (isLanguageCode(storedLanguage)) return storedLanguage;
	} catch {
		return "en";
	}

	const browserLanguage = window.navigator.language.slice(0, 2);
	return isLanguageCode(browserLanguage) ? browserLanguage : "en";
}

export const resources = {
	en,
} as const;

export function loadLanguageResource(
	language: LanguageCode,
): Promise<LanguageResource> {
	if (language === "en") return Promise.resolve(en as LanguageResource);

	const cachedResource = languageResourceCache.get(language);
	if (cachedResource) return cachedResource;

	const loader = languageResourceLoaders[`./langs/${language}.json`];
	if (!loader) return Promise.resolve(en as LanguageResource);

	const resourcePromise = loader();
	languageResourceCache.set(language, resourcePromise);
	return resourcePromise;
}

const lazyLanguageBackend = {
	type: "backend" as const,
	read(
		language: string,
		namespace: string,
		callback: (error: Error | null, resources: false | unknown) => void,
	) {
		const languageCode = isLanguageCode(language) ? language : "en";

		loadLanguageResource(languageCode)
			.then((resource) => {
				callback(null, resource[namespace as Namespace] ?? {});
			})
			.catch((error: unknown) => {
				callback(
					error instanceof Error ? error : new Error(String(error)),
					false,
				);
			});
	},
};

if (!i18n.isInitialized) {
	void i18n
		.use(lazyLanguageBackend)
		.use(initReactI18next)
		.init({
			defaultNS: "common",
			fallbackLng: "en",
			interpolation: {
				escapeValue: false,
			},
			lng: getInitialLanguage(),
			ns: namespaces,
			partialBundledLanguages: true,
			resources,
			supportedLngs: languageCodes,
		});
}

export default i18n;
