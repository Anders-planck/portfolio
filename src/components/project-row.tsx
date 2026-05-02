import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import type { Project } from "#/data/projects";

export function ProjectRow({ project }: { project: Project }) {
	const { t } = useTranslation("project");

	return (
		<Link
			to="/projects/$slug"
			params={{ slug: project.slug }}
			className="bg-accent/[0.06] group mb-px grid grid-cols-2 gap-px max-md:grid-cols-1"
		>
			<div className="bg-surface group-hover:bg-accent/[0.03] p-8 transition-colors">
				<div className="display text-fg mb-2 text-2xl">{project.title}</div>
				<div className="text-xs leading-[1.7] text-[#666]">
					{project.summary}
				</div>
				<div className="text-accent mt-2 text-[9px] tracking-[1px] uppercase">
					{project.tags.join(" · ")}
				</div>
			</div>
			<div className="bg-surface group-hover:bg-accent/[0.03] flex flex-col justify-between p-8 transition-colors">
				<div className="text-fg-muted text-[11px] leading-[1.6]">
					<strong className="text-fg">{t("impact")}:</strong> {project.impact}
				</div>
				<div className="display text-accent mt-3 text-right text-lg">→</div>
			</div>
		</Link>
	);
}
