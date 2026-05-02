import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

function splitVendorChunk(id: string): string | undefined {
	const normalizedId = id.replaceAll("\\", "/");

	if (!normalizedId.includes("/node_modules/")) return undefined;
	if (
		normalizedId.includes("/node_modules/react-dom/") ||
		normalizedId.includes("/node_modules/react/") ||
		normalizedId.includes("/node_modules/scheduler/") ||
		normalizedId.includes("/node_modules/lucide-react/")
	) {
		return "vendor-react";
	}
	if (normalizedId.includes("/node_modules/@tanstack/"))
		return "vendor-tanstack";
	if (
		normalizedId.includes("/node_modules/i18next/") ||
		normalizedId.includes("/node_modules/react-i18next/")
	) {
		return "vendor-i18n";
	}

	return "vendor";
}

const config = defineConfig(({ mode }) => ({
	build: {
		assetsInlineLimit: 0,
		cssCodeSplit: true,
		cssMinify: "lightningcss",
		minify: "esbuild",
		modulePreload: {
			polyfill: false,
		},
		rollupOptions: {
			output: {
				manualChunks: splitVendorChunk,
			},
		},
		sourcemap: false,
		target: "esnext",
	},
	plugins: [
		mode === "development" ? devtools() : null,
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart(),
		nitro({ preset: "vercel" }),
		viteReact(),
	].filter(Boolean) as PluginOption[],
}));

export default config;
