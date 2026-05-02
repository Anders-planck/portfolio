import { useTranslation } from "react-i18next";
import { social } from "#/data/cv-data";

export function Footer() {
	const year = new Date().getFullYear();
	const { t } = useTranslation("common");

	return (
		<footer className="page-wrap border-border border-t py-12">
			<div className="flex items-center justify-between max-sm:flex-col max-sm:gap-4 max-sm:text-center">
				<span className="text-fg-subtle text-[10px] tracking-[1px]">
					&copy; {year} Anders Planck
				</span>
				<div className="flex gap-6">
					<a
						href={social.github}
						target="_blank"
						rel="noopener noreferrer"
						className="text-fg-subtle hover:text-accent text-[10px] tracking-[1px] uppercase transition-colors"
					>
						GitHub
					</a>
					<a
						href={social.linkedin}
						target="_blank"
						rel="noopener noreferrer"
						className="text-fg-subtle hover:text-accent text-[10px] tracking-[1px] uppercase transition-colors"
					>
						LinkedIn
					</a>
					<a
						href={social.email}
						className="text-fg-subtle hover:text-accent text-[10px] tracking-[1px] uppercase transition-colors"
					>
						{t("footer.email")}
					</a>
				</div>
			</div>
		</footer>
	);
}
