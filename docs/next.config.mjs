import { createMDX } from "fumadocs-mdx/next";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL environment variable is not set");
}

const withMDX = createMDX();
const __dirname = dirname(fileURLToPath(import.meta.url));
// Turbopack refuses to read files outside `root`. In a pnpm monorepo, our
// declared deps are symlinked into docs/node_modules but their actual files
// live in <monorepo-root>/node_modules/.pnpm — so root must include that dir.
// (Import resolution is still scoped by docs/package.json via tsconfig's
// moduleResolution: "bundler" — this doesn't allow phantom imports.)
const workspaceRoot = resolve(__dirname, "..");

/** @type {import('next').NextConfig} */
const config = {
  turbopack: {
    root: workspaceRoot,
  },
  outputFileTracingRoot: workspaceRoot,
  serverExternalPackages: ["@takumi-rs/image-response"],

  reactStrictMode: true,
  redirects: async () => [
    {
      source: "/",
      destination: "/docs",
      permanent: true,
    },
  ],
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
};

export default withMDX(config);
