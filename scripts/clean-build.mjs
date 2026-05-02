import { rmSync } from "node:fs";
import { resolve } from "node:path";

for (const outputDir of [".vercel/output", ".output", "dist"]) {
	rmSync(resolve(outputDir), { force: true, recursive: true });
}
