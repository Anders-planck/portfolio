import type { ProjectResult } from "#/data/projects";

export function MetricGrid({ results }: { results: ProjectResult[] }) {
	return (
		<div className="bg-accent/[0.06] my-8 grid grid-cols-3 gap-px max-sm:grid-cols-1">
			{results.map((r) => (
				<div key={r.label} className="bg-surface p-6 text-center">
					<div className="display text-accent text-[32px]">{r.value}</div>
					<div className="label mt-1">{r.label}</div>
				</div>
			))}
		</div>
	);
}
