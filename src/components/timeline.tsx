interface TimelineItem {
	title: string;
	subtitle: string;
	period: string;
	description?: string;
	isCurrent: boolean;
}

export function Timeline({
	items,
	label,
}: {
	items: TimelineItem[];
	label: string;
}) {
	return (
		<div>
			<div className="label mb-5">{label}</div>
			<div className="before:bg-accent/[0.12] relative pl-6 before:absolute before:top-2 before:bottom-2 before:left-0 before:w-px before:content-['']">
				{items.map((item) => (
					<div key={item.title} className="relative mb-7 pl-5 last:mb-0">
						<div
							className={`border-accent absolute top-2 -left-6 h-[7px] w-[7px] rounded-full border ${item.isCurrent ? "bg-accent" : "bg-bg"}`}
						/>
						<div className="display text-fg text-lg">{item.title}</div>
						<div className="text-accent mb-1 text-xs">{item.subtitle}</div>
						<div className="text-fg-subtle text-[10px] tracking-[1px] uppercase">
							{item.period}
						</div>
						{item.description && (
							<div className="mt-2 text-[11px] leading-[1.7] text-[#666]">
								{item.description}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
