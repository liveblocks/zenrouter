import { getPageImage, source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { gitConfig } from "@/lib/layout.shared";

export default async function Page(props: PageProps<"/docs/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        footer: (
          <p className="mt-4 pt-5 border-t border-fd-border text-fd-muted-foreground text-xs">
            <span>
              Made with
              <svg
                aria-label="love"
                className="pointer-events-none inline-block size-[19px] mx-1 text-fd-foreground"
                fill="currentColor"
                viewBox="0 0 19 19"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Heart</title>
                <path d="M7 2H4V3.5H2.5V5H1V9.5H2.5V11H4V12.5H5.5V14H7V15.6H8.5V17H10V15.6H11.5V14H13.0455V12.5H14.5V11H16V9.5H17.5V5H16V3.5H14.5V2H11.5V3.5H10V5H8.5V3.5H7V2ZM7 3.5V5H8.5V6.5H10V5H11.5V3.5H14.5V5H16V9.5H14.5V11H13.0455V12.5H11.5V14H10V15.6H8.5V14H7V12.5H5.5V11H4V9.5H2.5V5H4V3.5H7Z"></path>
              </svg>
              by{" "}
              <a
                className="font-medium text-fd-foreground underline underline-offset-2 decoration-dotted decoration-fd-foreground/20 hover:decoration-fd-foreground/60"
                href="https://liveblocks.io"
                rel="noreferrer"
                target="_blank"
              >
                Liveblocks
              </a>
            </span>
          </p>
        ),
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <LLMCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptions
          markdownUrl={`${page.url}.mdx`}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/${gitConfig.contentPath}/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<"/docs/[[...slug]]">
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    metadataBase: new URL(process.env.BASE_URL!),
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
    alternates: {
      canonical: page.url,
    },
  };
}
