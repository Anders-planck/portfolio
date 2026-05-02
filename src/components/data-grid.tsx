import { useTranslation } from "react-i18next";
import { getYearsOfExperience, skillCategories } from "#/data/cv-data";
import { projectCount } from "#/data/projects";
import type { GitHubData } from "#/lib/github";

export function DataGrid({ github }: { github?: GitHubData }) {
	const { t } = useTranslation("home");
	const years = getYearsOfExperience();

	return (
		<div className="bg-border grid grid-cols-2 gap-px self-start">
			{skillCategories.map((cat) => (
				<div key={cat.label} className="bg-surface p-5">
					<div className="label mb-2.5">{cat.label}</div>
					{cat.items.map((item) => (
						<div
							key={item}
							className={`display text-[15px] leading-[1.6] ${item === cat.accent ? "text-accent" : "text-fg"}`}
						>
							{item}
						</div>
					))}
				</div>
			))}

			{/* Experience */}
			<div className="bg-surface p-5">
				<div className="label mb-2.5">{t("data.experience")}</div>
				<div className="display text-4xl leading-none">{years}+</div>
				<div className="text-fg-subtle mt-1 text-[10px]">
					{t("data.yearsProjects", { count: projectCount })}
				</div>
			</div>

			{/* GitHub — live data */}
			<div className="bg-surface p-5">
				<div className="label mb-2.5">{t("data.github")}</div>
				{github ? (
					<>
						<div className="display text-fg text-[15px] leading-[1.6]">
							<span className="text-accent">{github.contributions}+</span>{" "}
							{t("data.contributions")}
						</div>
						<div className="display text-fg text-[15px] leading-[1.6]">
							{t("data.active")}{" "}
							<span className="text-accent">{github.lastActive}</span>
						</div>
						<div className="text-fg-subtle mt-1.5 text-[10px]">
							{github.topLanguages.join(" · ")}
						</div>
					</>
				) : (
					<div className="text-fg-subtle text-[10px]">{t("data.loading")}</div>
				)}
			</div>
		</div>
	);
}
