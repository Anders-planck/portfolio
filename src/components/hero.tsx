import { useTranslation } from "react-i18next";
import { siteConfig } from "#/data/site";

export function Hero() {
	const { t } = useTranslation("home");

	return (
		<div className="pt-20 max-md:pt-12 max-sm:pt-8">
			<h1 className="display mb-6 text-[56px] leading-[1.08] font-normal max-md:text-[44px] max-sm:text-[36px]">
				{t("hero.headline.before")}
				<em className="text-accent italic">{t("hero.headline.emphasis")}</em>
			</h1>
			<p className="text-fg-muted max-w-[420px] text-sm leading-[1.8] font-light">
				{t("hero.description")}
			</p>
			<div className="mt-8 flex gap-3 max-sm:flex-col">
				<a
					href="#projects"
					className="border-accent text-accent hover:bg-accent/10 inline-flex items-center justify-center border px-7 py-3 text-[11px] font-medium tracking-[2px] uppercase transition-colors"
				>
					{t("hero.projects")}
				</a>
				<a
					href={siteConfig.cvUrl}
					download
					className="border-fg/12 text-fg-muted hover:border-fg/25 hover:text-fg inline-flex items-center justify-center border px-7 py-3 text-[11px] tracking-[2px] uppercase transition-colors"
				>
					{t("hero.cv")}
				</a>
			</div>
		</div>
	);
}
