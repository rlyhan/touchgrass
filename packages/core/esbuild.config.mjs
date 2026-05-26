import { build } from "esbuild"

// Bundle the API into a single ESM file. Workspace packages (@touchgrass/*)
// are inlined so the runtime doesn't transpile .ts at boot; third-party
// node_modules stay external and resolve normally at runtime.
await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: true,
  logLevel: "info",
  plugins: [
    {
      name: "externalize-third-party",
      setup(pluginBuild) {
        pluginBuild.onResolve({ filter: /.*/ }, (args) => {
          if (args.kind === "entry-point") return null
          if (args.path.startsWith(".") || args.path.startsWith("/")) return null
          if (args.path.startsWith("@touchgrass/")) return null
          return { path: args.path, external: true }
        })
      },
    },
  ],
})
