import { $ } from "bun";
import dts from "bun-plugin-dts";

const outdir = "./dist";

const client = await Bun.build({
    entrypoints: ["./src/client/index.ts"],
    outdir: `${outdir}/client`,
    target: "browser",
    format: "esm",
    minify: {
        whitespace: true,
        syntax: true,
        identifiers: false,
    },
    sourcemap: "external",
    plugins: [dts()],
});

if (!client.success) {
    console.error("client build failed");
    for (const log of client.logs) console.error(log);
    process.exit(1);
}

await $`bun build ./src/run.ts \
    --compile \
    --minify \
    --sourcemap=external \
    --outfile ${outdir}/civil2-db`.throws(true);

console.log("build complete");
