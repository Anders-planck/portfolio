export const CAREER_START = new Date("2023-01-01");

export function getYearsOfExperience(): number {
	return Math.floor(
		(Date.now() - CAREER_START.getTime()) / (365.25 * 86400000),
	);
}

export interface SkillCategory {
	label: string;
	items: string[];
	accent?: string;
}

export const skillCategories: SkillCategory[] = [
	{
		label: "Frontend",
		accent: "React",
		items: ["React", "React Native", "TypeScript", "TanStack"],
	},
	{
		label: "Backend",
		accent: "PHP / Symfony",
		items: ["PHP / Symfony", "Laravel", "Node / Bun", "Elysia.js"],
	},
	{
		label: "Infra",
		accent: "CI/CD",
		items: ["PostgreSQL", "Docker / AWS", "CI/CD"],
	},
];

export interface WorkExperience {
	company: string;
	role: string;
	startDate: string;
	endDate: string | null;
	location: string;
	description: string;
}

export const workExperience: WorkExperience[] = [
	{
		company: "Madisoft",
		role: "Software Engineer",
		startDate: "2026-03-02",
		endDate: null,
		location: "Ferrara, Italy",
		description: "Building scalable education technology solutions.",
	},
	{
		company: "A-Cube S.R.L.",
		role: "Full Stack Developer",
		startDate: "2023-01-01",
		endDate: "2026-02-28",
		location: "Ferrara, Italy",
		description:
			"Full-stack development across 9+ major projects. Led frontend architecture with React/TypeScript and backend services with PHP/Symfony. Built enterprise SDKs, Stripe integrations, and open-source React Native modules.",
	},
];

export interface Education {
	degree: string;
	institution: string;
	startDate: string;
	endDate: string;
	completed: boolean;
}

export const education: Education[] = [
	{
		degree: "M.Sc. Computer Engineering & Automation",
		institution: "Universit\u00E0 degli Studi di Ferrara",
		startDate: "2023-09-01",
		endDate: "2025-12-01",
		completed: true,
	},
	{
		degree: "B.Sc. Computer Science & Electronics",
		institution: "Universit\u00E0 degli Studi di Ferrara",
		startDate: "2020-09-01",
		endDate: "2023-06-01",
		completed: true,
	},
];

export const bio = {
	headline: "I build systems that scale.",
	description:
		"Software engineer specializing in TypeScript, React ecosystems, PHP/Symfony backends, and mobile with React Native. Currently at Madisoft, Ferrara.",
	about: [
		"Software engineer based in Ferrara, Italy. I build production systems that handle real traffic and solve real problems \u2014 from PSD2-compliant banking interfaces to mobile security modules used in enterprise apps.",
		"My stack spans both sides: React and React Native on the front, PHP/Symfony and Node/Bun on the back, PostgreSQL underneath, Docker and AWS around it. I care about architecture that lasts, not code that impresses on a whiteboard.",
		"Master\u2019s in Computer Engineering from Universit\u00E0 degli Studi di Ferrara. French native, fluent in Italian and English.",
	],
};

export const social = {
	github: "https://github.com/Anders-planck",
	linkedin: "https://linkedin.com/in/anders-planck-53184b1b4",
	email: "mailto:anders@anders-games.com",
};
