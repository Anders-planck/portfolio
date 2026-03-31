import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MetricGrid } from "#/components/metric-grid";
import { getProjectBySlug, projects } from "#/data/projects";

export const Route = createFileRoute("/projects/$slug")({
	component: ProjectDetail,
	loader: ({ params }) => {
		const project = getProjectBySlug(params.slug);
		if (!project) throw notFound();
		return project;
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData
					? `${loaderData.title} — Anders Planck`
					: "Project — Anders Planck",
			},
		],
	}),
});

function ProjectDetail() {
	const project = Route.useLoaderData();

	const currentIndex = projects.findIndex((p) => p.slug === project.slug);
	const nextProject = projects[currentIndex + 1];
	const prevProject = projects[currentIndex - 1];

	return (
		<main className="page-wrap py-16 max-sm:py-10">
			{/* Back link */}
			<Link
				to="/projects"
				className="text-fg-subtle hover:text-fg-muted mb-6 inline-flex items-center gap-1.5 text-[10px] tracking-[1px] uppercase transition-colors"
			>
				&larr; Back to projects
			</Link>

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
					<div className="label mb-2">Role</div>
					<div className="display text-base">{project.role}</div>
				</div>
				<div className="bg-surface p-5">
					<div className="label mb-2">Company</div>
					<div className="display text-base">{project.company}</div>
				</div>
				<div className="bg-surface p-5">
					<div className="label mb-2">Year</div>
					<div className="display text-base">{project.year}</div>
				</div>
			</div>

			{/* Content */}
			<div className="mt-12 max-w-[680px]">
				<h2 className="display mb-4 text-2xl font-normal">The Challenge</h2>
				<p className="text-fg-muted text-[13px] leading-[1.9] font-light">
					{project.challenge}
				</p>

				<h2 className="display border-accent/[0.06] mt-10 mb-4 border-t pt-6 text-2xl font-normal">
					The Solution
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
					Results
				</h2>
				<MetricGrid results={project.results} />

				<h2 className="display border-accent/[0.06] mt-10 mb-4 border-t pt-6 text-2xl font-normal">
					Learnings
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
						View on GitHub &rarr;
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
