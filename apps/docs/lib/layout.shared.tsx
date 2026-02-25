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
      title: (
        <>
          <svg
            width={12}
            viewBox="0 0 68 83"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M36.378.084C41.49.47 47.388 6.63 47.388 12.17c0 2.014-2.435 5.283-9.83 6.546-5.899 1.007-11.797-.86-14.943-2.518-6.685-3.525-4.03-8.718-1.573-11.078C24.974 1.343 29.693-.42 36.378.084zM58.243 40.145C57.03 46.142 47.64 48 31.733 48 20.07 48 7.876 45.382 8.406 37.527 8.935 29.673 18.48 24 33.325 24c14.844 0 26.509 8.29 24.918 16.145zM66.941 66.13c-1.104-6.993-11.206-13.186-32.497-13.693C23.238 51.69-5.189 59.15.826 71.202 7.39 84.35 30.89 82.867 46.77 82.867c6.817 0 21.852-6.086 20.171-16.737z"
              fill="#000"
            />
          </svg>
          <span>Zen Router</span>
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
