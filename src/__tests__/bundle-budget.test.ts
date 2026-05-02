import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const clientAssetDirs = [
	".vercel/output/static/assets",
	"dist/client/assets",
	".output/public/assets",
];

interface ClientChunk {
	bytes: number;
	file: string;
	source: string;
	text: string;
}

function readClientChunks(): ClientChunk[] {
	return clientAssetDirs.flatMap((assetDir) => {
		const absoluteDir = join(process.cwd(), assetDir);
		if (!existsSync(absoluteDir)) return [];

		return readdirSync(absoluteDir)
			.filter((file) => file.endsWith(".js"))
			.map((file) => {
				const text = readFileSync(join(absoluteDir, file), "utf8");
				return {
					bytes: Buffer.byteLength(text),
					file,
					source: assetDir,
					text,
				};
			});
	});
}

function readMainChunks(): ClientChunk[] {
	return readClientChunks().filter((chunk) => chunk.file.startsWith("main-"));
}

function readChunkImports(chunk: ClientChunk): string[] {
	return Array.from(
		chunk.text.matchAll(
			/import(?:[\s\S]*?)from"\.\/([^"]+\.js)"|import\("\.\/([^"]+\.js)"\)/g,
		),
		(match) => match[1] ?? match[2],
	);
}

describe("bundle budget", () => {
	it("keeps localized project CMS content out of the main client chunk", () => {
		const mainChunks = readMainChunks();
		if (mainChunks.length === 0) return;

		for (const chunk of mainChunks) {
			expect(chunk.text, `${chunk.source}/${chunk.file}`).not.toContain(
				"Interface Open Banking",
			);
			expect(chunk.text, `${chunk.source}/${chunk.file}`).not.toContain(
				"parseur.vercel.app",
			);
			expect(chunk.text, `${chunk.source}/${chunk.file}`).not.toContain(
				"Wortschatz",
			);
			expect(chunk.text, `${chunk.source}/${chunk.file}`).not.toContain(
				"Projets sélectionnés",
			);
			expect(chunk.text, `${chunk.source}/${chunk.file}`).not.toContain(
				"Progetti selezionati",
			);
			expect(chunk.text, `${chunk.source}/${chunk.file}`).not.toContain(
				"Ausgewählte Arbeiten",
			);
		}
	});

	it("keeps project CMS data out of client route chunks", () => {
		const clientBundle = readClientChunks()
			.map((chunk) => chunk.text)
			.join("\n");

		expect(clientBundle).not.toContain("parseur.vercel.app");
		expect(clientBundle).not.toContain("Interface Open Banking");
		expect(clientBundle).not.toContain("50K+ transactions traitées");
	});

	it("keeps the first-party main chunk split from vendor code", () => {
		const mainChunks = readMainChunks();
		if (mainChunks.length === 0) return;

		for (const chunk of mainChunks) {
			expect(chunk.bytes / 1024, `${chunk.source}/${chunk.file}`).toBeLessThan(
				240,
			);
		}
	});

	it("keeps imported flag SVG assets out of the main JavaScript chunk", () => {
		const mainChunks = readMainChunks();
		if (mainChunks.length === 0) return;

		for (const chunk of mainChunks) {
			expect(chunk.text, `${chunk.source}/${chunk.file}`).not.toContain(
				"data:image/svg+xml",
			);
		}
	});

	it("keeps the React vendor chunk self-contained", () => {
		const reactChunks = readClientChunks().filter((chunk) =>
			chunk.file.startsWith("vendor-react-"),
		);
		if (reactChunks.length === 0) return;

		for (const chunk of reactChunks) {
			expect(
				readChunkImports(chunk),
				`${chunk.source}/${chunk.file}`,
			).toHaveLength(0);
		}
	});
});
