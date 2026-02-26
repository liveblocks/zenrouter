import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Metadata } from "next";
import { TITLE_DESCRIPTION } from "./docs/[[...slug]]/page";

const inter = Inter({
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: TITLE_DESCRIPTION,
  description:
    "An opinionated HTTP router with typed path params, built-in body validation, and a clean auth model. Compatible with Cloudflare Workers, Node.js, Bun, Deno, and other modern JavaScript runtimes. Built by Liveblocks.",
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.className} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <meta name="apple-mobile-web-app-title" content="Zen Router" />
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
