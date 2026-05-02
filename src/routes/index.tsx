import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ContactModal } from "#/components/contact-modal";
import { DataGrid } from "#/components/data-grid";
import { Hero } from "#/components/hero";
import { ProjectRow } from "#/components/project-row";
import { Timeline } from "#/components/timeline";
import { bio, education, social, workExperience } from "#/data/cv-data";
import { siteConfig } from "#/data/site";
import { isLanguageCode } from "#/i18n";
import { fetchGitHubData, GITHUB_FALLBACK } from "#/lib/github";
import { tArray, tString } from "#/lib/i18n-helpers";
import { fetchProjects } from "#/lib/projects-api";

export const Route = createFileRoute("/")({
	component: Home,
	loader: () => fetchProjects({ data: { language: "en" } }),
});

function formatPeriod(
	start: string,
	end: string | null,
	locale: string,
	presentLabel: string,
): string {
	const fmt = (d: string) => {
		const date = new Date(d);
		return date.toLocaleDateString(locale, {
			month: "short",
			year: "numeric",
		});
	};
	return `${fmt(start)} — ${end ? fmt(end) : presentLabel}`;
}

function Home() {
	const initialProjects = Route.useLoaderData();
	const [contactOpen, setContactOpen] = useState(false);
	const { i18n, t } = useTranslation(["home", "common"]);
	const currentLanguage = i18n.resolvedLanguage ?? i18n.language;
	const language = isLanguageCode(currentLanguage) ? currentLanguage : "en";
	const about = tArray(t, "bio.about", bio.about);
	const { data: projects = initialProjects } = useQuery({
		queryKey: ["projects", language],
		queryFn: () => fetchProjects({ data: { language } }),
		initialData: language === "en" ? initialProjects : undefined,
		placeholderData: (previousData) => previousData ?? initialProjects,
		staleTime: 60 * 60 * 1000,
	});
	const { data: github } = useQuery({
		queryKey: ["github"],
		queryFn: () => fetchGitHubData(),
		initialData: GITHUB_FALLBACK,
		staleTime: 60 * 60 * 1000,
	});

	return (
		<main className="page-wrap">
			{/* ===== HERO ===== */}
			<section className="hero-grid">
				<Hero />
				<DataGrid github={github} />
			</section>

			{/* ===== PROJECTS ===== */}
			<section id="projects" className="border-border mt-16 border-t pt-9">
				<div className="label mb-5 tracking-[3px]">{t("selectedWork")}</div>
				<div>
					{projects.map((p) => (
						<ProjectRow key={p.slug} project={p} />
					))}
				</div>
			</section>

			{/* ===== ABOUT ===== */}
			<section id="about" className="border-border mt-16 border-t pt-9 pb-16">
				<div className="label mb-8 tracking-[3px]">{t("about")}</div>

				<div className="mb-12 grid grid-cols-[1fr_1.4fr] gap-10 max-md:grid-cols-1">
					<div className="border-accent/10 relative aspect-square w-full overflow-hidden border max-md:max-w-[240px]">
						<picture>
							<source srcSet="/images/avatar.webp" type="image/webp" />
							<img
								src="/images/avatar.png"
								alt="Anders Planck"
								className="h-full w-full object-cover"
								width={1024}
								height={1024}
							/>
						</picture>
					</div>
					<div>
						<h2 className="display mb-4 text-4xl font-normal max-sm:text-3xl">
							Anders <em className="text-accent italic">Planck</em>
						</h2>
						{about.map((p) => (
							<p
								key={p.slice(0, 20)}
								className="text-fg-muted mb-4 text-[13px] leading-[1.9] font-light"
							>
								{p}
							</p>
						))}
						<div className="mt-5 flex gap-5">
							<a
								href={social.github}
								target="_blank"
								rel="noopener noreferrer"
								className="text-accent border-accent/30 border-b pb-0.5 text-[10px] tracking-[1px] uppercase"
							>
								GitHub
							</a>
							<a
								href={social.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								className="text-accent border-accent/30 border-b pb-0.5 text-[10px] tracking-[1px] uppercase"
							>
								LinkedIn
							</a>
							<a
								href={social.email}
								className="text-accent border-accent/30 border-b pb-0.5 text-[10px] tracking-[1px] uppercase"
							>
								{t("footer.email", { ns: "common" })}
							</a>
						</div>
					</div>
				</div>

				<div className="mb-12">
					<Timeline
						label={t("experience")}
						items={workExperience.map((w, index) => ({
							title: tString(t, `work.${index}.role`, w.role),
							subtitle: w.company,
							period: formatPeriod(
								w.startDate,
								w.endDate,
								i18n.language,
								t("time.present", { ns: "common" }),
							),
							description: tString(
								t,
								`work.${index}.description`,
								w.description,
							),
							isCurrent: w.endDate === null,
						}))}
					/>
				</div>

				<Timeline
					label={t("education")}
					items={education.map((e, index) => ({
						title: tString(t, `educationItems.${index}.degree`, e.degree),
						subtitle: tString(
							t,
							`educationItems.${index}.institution`,
							e.institution,
						),
						period: formatPeriod(
							e.startDate,
							e.endDate,
							i18n.language,
							t("time.present", { ns: "common" }),
						),
						isCurrent: !e.completed,
					}))}
				/>
			</section>

			{/* ===== CTA ===== */}
			<section className="border-border mt-16 border-t pt-16 pb-20 text-center">
				<h2 className="display mb-4 text-3xl font-normal max-sm:text-2xl">
					{t("cta.before")}
					<em className="text-accent italic">{t("cta.emphasis")}</em>
				</h2>
				<p className="text-fg-muted mx-auto mb-8 max-w-[480px] text-sm font-light">
					{t("cta.description")}
				</p>
				<div className="flex justify-center gap-3 max-sm:flex-col max-sm:items-center">
					<button
						type="button"
						onClick={() => setContactOpen(true)}
						className="border-accent text-accent hover:bg-accent/10 inline-flex cursor-pointer items-center justify-center border px-7 py-3 text-[11px] font-medium tracking-[2px] uppercase transition-colors"
					>
						{t("cta.contact")}
					</button>
					<a
						href={siteConfig.cvUrl}
						download
						className="border-fg/12 text-fg-muted hover:border-fg/25 hover:text-fg inline-flex items-center justify-center border px-7 py-3 text-[11px] tracking-[2px] uppercase transition-colors"
					>
						{t("hero.cv")}
					</a>
				</div>
			</section>

			<ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
		</main>
	);
}
