const siteUrl = "https://anders-games.com";

export const siteConfig = {
	name: "Anders Planck",
	title: "Anders Planck — Software Engineer",
	description:
		"Software engineer specializing in TypeScript, React, PHP/Symfony, and React Native. Building production systems that scale.",
	url: siteUrl,
	ogImage: `${siteUrl}/images/avatar.png`,
	nav: [
		{ labelKey: "nav.projects", href: "#projects" },
		{ labelKey: "nav.about", href: "#about" },
	],
	cvUrl: "/cv.pdf",
};
