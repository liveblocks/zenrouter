import { createMDX } from "fumadocs-mdx/next";
import { fileURLToPath } from "url";
import { dirname } from "path";

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL environment variable is not set");
}

const withMDX = createMDX();
const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
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
