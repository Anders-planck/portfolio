import deFlag from "flag-icons/flags/4x3/de.svg?url";
import frFlag from "flag-icons/flags/4x3/fr.svg?url";
import gbFlag from "flag-icons/flags/4x3/gb.svg?url";
import itFlag from "flag-icons/flags/4x3/it.svg?url";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	isLanguageCode,
	type LanguageCode,
	languageStorageKey,
	languages,
} from "#/i18n";

const flagIconByCode: Record<LanguageCode, string> = {
	de: deFlag,
	en: gbFlag,
	fr: frFlag,
	it: itFlag,
};

export function LanguageSwitcher({
	onChange,
}: {
	onChange?: (language: LanguageCode) => void;
}) {
	const { i18n, t } = useTranslation("common");
	const [open, setOpen] = useState(false);
	const currentLanguage = i18n.resolvedLanguage ?? i18n.language ?? null;
	const language = isLanguageCode(currentLanguage) ? currentLanguage : "en";
	const [selectedLanguage, setSelectedLanguage] =
		useState<LanguageCode>(language);
	const activeLanguage =
		languages.find((item) => item.code === selectedLanguage) ?? languages[0];

	useEffect(() => {
		setSelectedLanguage(language);
	}, [language]);

	useEffect(() => {
		document.documentElement.lang = selectedLanguage;

		try {
			window.localStorage.setItem(languageStorageKey, selectedLanguage);
		} catch {
			// Storage can be unavailable in strict privacy contexts.
		}
	}, [selectedLanguage]);

	function handleSelect(nextLanguage: LanguageCode) {
		setSelectedLanguage(nextLanguage);
		void i18n.changeLanguage(nextLanguage);
		setOpen(false);
		onChange?.(nextLanguage);
	}

	return (
		<div className="relative">
			<button
				type="button"
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-label={t("language.select")}
				onClick={() => setOpen((value) => !value)}
				className="border-border hover:border-accent/30 hover:bg-accent/[0.04] flex h-8 items-center gap-2 border px-2 text-[10px] tracking-[1px] transition-colors"
				title={t(`language.${activeLanguage.code}`)}
			>
				<img
					src={flagIconByCode[activeLanguage.code]}
					alt=""
					aria-hidden="true"
					className="h-3 w-4 object-cover"
				/>
				<span>{activeLanguage.code.toUpperCase()}</span>
			</button>

			{open && (
				<div
					aria-label={t("language.select")}
					aria-orientation="vertical"
					className="bg-bg border-border absolute top-full right-0 z-30 mt-2 flex min-w-28 flex-col border p-1 shadow-lg"
					role="listbox"
				>
					{languages.map((item) => (
						<button
							type="button"
							key={item.code}
							aria-label={t(`language.${item.code}`)}
							aria-selected={selectedLanguage === item.code}
							onClick={() => handleSelect(item.code)}
							className="hover:bg-accent/[0.06] aria-selected:bg-accent/[0.12] flex items-center gap-2 px-2 py-1.5 text-left text-[10px] tracking-[1px] uppercase transition-colors"
							role="option"
							title={t(`language.${item.code}`)}
						>
							<img
								src={flagIconByCode[item.code]}
								alt=""
								aria-hidden="true"
								className="h-3 w-4 object-cover"
							/>
							<span>{item.code}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
