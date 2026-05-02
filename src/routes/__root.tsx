import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { Footer } from "#/components/footer";
import { Nav } from "#/components/nav";
import { themeScript } from "#/components/theme-toggle";
import { siteConfig } from "#/data/site";
import "#/i18n";
import TanStackQueryProvider from "../integrations/tanstack-query/root-provider";

import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: siteConfig.title },
			{ name: "description", content: siteConfig.description },
			{ name: "author", content: siteConfig.name },
			{ property: "og:type", content: "website" },
			{ property: "og:title", content: siteConfig.title },
			{ property: "og:description", content: siteConfig.description },
			{ property: "og:url", content: siteConfig.url },
			{ property: "og:image", content: siteConfig.ogImage },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: siteConfig.title },
			{ name: "twitter:description", content: siteConfig.description },
			{ name: "twitter:image", content: siteConfig.ogImage },
		],
		links: [
			{ rel: "canonical", href: siteConfig.url },
			{ rel: "icon", href: "/favicon.ico" },
			{ rel: "apple-touch-icon", href: "/logo192.png" },
			{ rel: "stylesheet", href: appCss },
		],
		scripts: [
			{
				type: "application/ld+json",
				children: JSON.stringify({
					"@context": "https://schema.org",
					"@type": "Person",
					name: "Anders Planck",
					jobTitle: "Software Engineer",
					url: siteConfig.url,
					sameAs: [
						"https://github.com/Anders-planck",
						"https://linkedin.com/in/anders-planck-53184b1b4",
					],
					worksFor: {
						"@type": "Organization",
						name: "Madisoft",
					},
				}),
			},
		],
	}),
	component: RootLayout,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: inline theme script prevents FOUC */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function RootLayout() {
	return (
		<TanStackQueryProvider>
			<Nav />
			<Outlet />
			<Footer />
		</TanStackQueryProvider>
	);
}
