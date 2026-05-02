import type { TFunction } from "i18next";

export function tString(t: TFunction, key: string, fallback: string): string {
	const value = t(key, { defaultValue: fallback });
	return typeof value === "string" ? value : fallback;
}

export function tArray(
	t: TFunction,
	key: string,
	fallback: string[],
): string[] {
	const value = t(key, { defaultValue: fallback, returnObjects: true });
	if (!Array.isArray(value)) return fallback;

	const strings = value.filter(
		(item): item is string => typeof item === "string",
	);
	return strings.length === fallback.length ? strings : fallback;
}
