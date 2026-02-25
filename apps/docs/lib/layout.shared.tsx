import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const gitConfig = {
  user: "liveblocks",
  repo: "zenrouter",
  branch: "main",
  contentPath: "apps/docs/content/docs",
};

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Zen Router",
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
