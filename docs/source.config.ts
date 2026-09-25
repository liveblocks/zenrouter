import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";
import { shikiTokenClassTransformer } from "./lib/shiki-token-classes";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      engine: "oniguruma",
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      includeExplanation: "scopeName",
      // With includeExplanation, Shiki tokenizes every line twice and assumes
      // both passes agree. If the time limit cuts one pass short (e.g. on a
      // slow build machine), it crashes on the missing tokens. Code blocks are
      // highlighted at build time only, so disable the limit.
      tokenizeTimeLimit: 0,
      transformers: [
        ...(rehypeCodeDefaultOptions.transformers ?? []),
        shikiTokenClassTransformer(),
      ],
    },
  },
});
