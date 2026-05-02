import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { MetricGrid } from "#/components/metric-grid";
import { siteConfig } from "#/data/site";
import { isLanguageCode } from "#/i18n";
import { fetchProjectBySlug, fetchProjects } from "#/lib/projects-api";

const mediaToneClass = {
	banking: "border-sky-400/20 bg-sky-400/[0.06] text-sky-200",
	stripe: "border-violet-400/20 bg-violet-400/[0.06] text-violet-200",
	native: "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200",
	learning: "border-amber-400/20 bg-amber-400/[0.06] text-amber-200",
	documents: "border-rose-400/20 bg-rose-400/[0.06] text-rose-200",
} as const;

export const projectsBackHref = "/#projects";

export const Route = createFileRoute("/projects/$slug")({
	component: ProjectDetail,
	loader: async ({ params }) => {
		const [project, projects] = await Promise.all([
			fetchProjectBySlug({ data: { language: "en", slug: params.slug } }),
			fetchProjects({ data: { language: "en" } }),
		]);
		if (!project) throw notFound();
		return {
			project,
			projects,
			slug: params.slug,
		};
	},
	head: ({ loaderData }) => ({
		links: loaderData
			? [
					{
						rel: "canonical",
						href: `${siteConfig.url}/projects/${loaderData.slug}`,
					},
				]
			: [],
		meta: [
			{
				title: loaderData
					? `${loaderData.project.title} — Anders Planck`
					: "Project — Anders Planck",
			},
			{
				name: "description",
				content: loaderData?.project.summary ?? siteConfig.description,
			},
			{
				property: "og:title",
				content: loaderData
					? `${loaderData.project.title} — Anders Planck`
					: siteConfig.title,
			},
			{
				property: "og:description",
				content: loaderData?.project.summary ?? siteConfig.description,
			},
			{
				property: "og:type",
				content: "article",
			},
			{
				property: "og:image",
				content: siteConfig.ogImage,
			},
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
		],
	}),
});

function ProjectDetail() {
	const loaderData = Route.useLoaderData();
	const { i18n, t } = useTranslation("project");
	const currentLanguage = i18n.resolvedLanguage ?? i18n.language;
	const language = isLanguageCode(currentLanguage) ? currentLanguage : "en";
	const { data: project = loaderData.project } = useQuery({
		queryKey: ["project", loaderData.slug, language],
		queryFn: () =>
			fetchProjectBySlug({ data: { language, slug: loaderData.slug } }),
		initialData: language === "en" ? loaderData.project : undefined,
		placeholderData: (previousData) => previousData ?? loaderData.project,
		staleTime: 60 * 60 * 1000,
	});
	const { data: projects = loaderData.projects } = useQuery({
		queryKey: ["projects", language],
		queryFn: () => fetchProjects({ data: { language } }),
		initialData: language === "en" ? loaderData.projects : undefined,
		placeholderData: (previousData) => previousData ?? loaderData.projects,
		staleTime: 60 * 60 * 1000,
	});
	const currentIndex = projects.findIndex((p) => p.slug === project?.slug);
	const nextProject = projects[currentIndex + 1];
	const prevProject = projects[currentIndex - 1];

	if (!project) throw notFound();

	return (
		<main className="page-wrap py-16 max-sm:py-10">
			{/* Back link */}
			<a
				href={projectsBackHref}
				className="text-fg-subtle hover:text-fg-muted mb-6 inline-flex items-center gap-1.5 text-[10px] tracking-[1px] uppercase transition-colors"
			>
				&larr; {t("back")}
			</a>

			{/* Header */}
			<h1 className="display mb-3 text-[40px] font-normal max-sm:text-[32px]">
				{project.title}
			</h1>
			<p className="text-fg-muted max-w-[640px] text-sm leading-[1.8] font-light">
				{project.summary}
			</p>

			{/* Tags */}
			<div className="mt-4 flex flex-wrap gap-2">
				{project.tags.map((tag) => (
					<span
						key={tag}
						className="border-accent/15 text-accent border px-3.5 py-1.5 text-[9px] tracking-[1px] uppercase"
					>
						{tag}
					</span>
				))}
			</div>

			{/* Meta grid */}
			<div className="bg-accent/[0.06] mt-10 grid grid-cols-3 gap-px max-sm:grid-cols-1">
				<div className="bg-surface p-5">
					<div className="label mb-2">{t("role")}</div>
					<div className="display text-base">{project.role}</div>
				</div>
				<div className="bg-surface p-5">
					<div className="label mb-2">{t("company")}</div>
					<div className="display text-base">{project.company}</div>
				</div>
				<div className="bg-surface p-5">
					<div className="label mb-2">{t("year")}</div>
					<div className="display text-base">{project.year}</div>
				</div>
			</div>

			<section
				aria-label={`${project.title} ${t("visual")}`}
				className={`mt-10 border p-6 ${mediaToneClass[project.media.tone]}`}
			>
				<div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
					<div>
						<div className="label mb-4">{t("visual")}</div>
						<div className="display text-2xl font-normal">
							{project.media.label}
						</div>
						<p className="text-fg-muted mt-3 max-w-[520px] text-xs leading-[1.8]">
							{project.media.detail}
						</p>
					</div>
					<div className="border-current/20 grid grid-cols-3 gap-2 border p-3">
						{project.results.map((result) => (
							<div key={result.label} className="bg-bg/60 p-3">
								<div className="display text-lg">{result.value}</div>
								<div className="text-fg-subtle mt-1 text-[9px] uppercase">
									{result.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Content */}
			<div className="mt-12 max-w-[680px]">
				<h2 className="display mb-4 text-2xl font-normal">{t("challenge")}</h2>
				<p className="text-fg-muted text-[13px] leading-[1.9] font-light">
					{project.challenge}
				</p>

				<h2 className="display border-accent/[0.06] mt-10 mb-4 border-t pt-6 text-2xl font-normal">
					{t("solution")}
				</h2>
				<ul className="space-y-2">
					{project.solution.map((item) => (
						<li
							key={item}
							className="text-fg-muted before:bg-accent relative pl-4 text-xs leading-[1.8] before:absolute before:top-[9px] before:left-0 before:h-[5px] before:w-[5px] before:rounded-full before:content-['']"
						>
							{item}
						</li>
					))}
				</ul>

				<h2 className="display border-accent/[0.06] mt-10 mb-4 border-t pt-6 text-2xl font-normal">
					{t("results")}
				</h2>
				<MetricGrid results={project.results} />

				<h2 className="display border-accent/[0.06] mt-10 mb-4 border-t pt-6 text-2xl font-normal">
					{t("learnings")}
				</h2>
				<p className="text-fg-muted text-[13px] leading-[1.9] font-light">
					{project.learnings}
				</p>

				{project.github && (
					<a
						href={project.github}
						target="_blank"
						rel="noopener noreferrer"
						className="text-accent border-accent/30 hover:border-accent mt-8 inline-flex items-center gap-2 border-b pb-0.5 text-[10px] tracking-[1px] uppercase transition-colors"
					>
						{t("github")} &rarr;
					</a>
				)}
			</div>

			{/* Prev/Next */}
			<div className="border-border mt-16 flex justify-between border-t pt-8">
				{prevProject ? (
					<Link
						to="/projects/$slug"
						params={{ slug: prevProject.slug }}
						className="text-fg-subtle hover:text-accent text-[10px] tracking-[1px] uppercase transition-colors"
					>
						&larr; {prevProject.title}
					</Link>
				) : (
					<span />
				)}
				{nextProject ? (
					<Link
						to="/projects/$slug"
						params={{ slug: nextProject.slug }}
						className="text-fg-subtle hover:text-accent text-[10px] tracking-[1px] uppercase transition-colors"
					>
						{nextProject.title} &rarr;
					</Link>
				) : (
					<span />
				)}
			</div>
		</main>
	);
}
