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
      url: "/docs",
      title: (
        <>
          <svg
            width={12}
            viewBox="0 0 68 83"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M36.378.084C41.49.47 47.388 6.63 47.388 12.17c0 2.014-2.435 5.283-9.83 6.546-5.899 1.007-11.797-.86-14.943-2.518-6.685-3.525-4.03-8.718-1.573-11.078C24.974 1.343 29.693-.42 36.378.084zM58.243 40.145C57.03 46.142 47.64 48 31.733 48 20.07 48 7.876 45.382 8.406 37.527 8.935 29.673 18.48 24 33.325 24c14.844 0 26.509 8.29 24.918 16.145zM66.941 66.13c-1.104-6.993-11.206-13.186-32.497-13.693C23.238 51.69-5.189 59.15.826 71.202 7.39 84.35 30.89 82.867 46.77 82.867c6.817 0 21.852-6.086 20.171-16.737z" />
          </svg>
          <span>Zen Router</span>
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    // links: [
    //   {
    //     type: "icon",
    //     url: "https://liveblocks.io",
    //     icon: (
    //       <svg
    //         width={86}
    //         height={86}
    //         viewBox="0 0 86 86"
    //         fill="currentColor"
    //         xmlns="http://www.w3.org/2000/svg"
    //       >
    //         <path
    //           fillRule="evenodd"
    //           clipRule="evenodd"
    //           d="M57.684 20H.79l16.857 16.82v23.127L57.684 20zM28.632 66h56.894L68.67 49.18V26.053L28.632 66z"
    //         />
    //       </svg>
    //     ),
    //     text: "Liveblocks",
    //     label: "Created by Liveblocks",
    //     external: true,
    //   },
    //   {
    //     type: "icon",
    //     url: "https://www.npmjs.com/package/@liveblocks/zenrouter",
    //     icon: (
    //       <svg
    //         xmlns="http://www.w3.org/2000/svg"
    //         width="1em"
    //         height="1em"
    //         viewBox="0 0 24 24"
    //         fill="currentColor"
    //       >
    //         <path d="M3 3v18h18V3H3m3 3h12v12h-3V9h-3v9H6V6z" />
    //       </svg>
    //     ),
    //     text: "npm",
    //     label: "View on npm",
    //     external: true,
    //   },
    //   {
    //     type: "icon",
    //     url: "https://www.npmjs.com/package/@liveblocks/zenrouter",
    //     icon: (
    //       <svg
    //         width={71}
    //         height={55}
    //         viewBox="0 0 71 55"
    //         fill="currentColor"
    //         xmlns="http://www.w3.org/2000/svg"
    //       >
    //         <g clipPath="url(#clip0)">
    //           <path d="M60.105 4.898A58.55 58.55 0 0045.653.415a.22.22 0 00-.233.11 40.784 40.784 0 00-1.8 3.697c-5.456-.817-10.886-.817-16.23 0-.485-1.164-1.201-2.587-1.828-3.697a.228.228 0 00-.233-.11 58.386 58.386 0 00-14.451 4.483.207.207 0 00-.095.082C1.578 18.73-.944 32.144.293 45.39a.244.244 0 00.093.167c6.073 4.46 11.955 7.167 17.729 8.962a.23.23 0 00.249-.082 42.08 42.08 0 003.627-5.9.225.225 0 00-.123-.312 38.772 38.772 0 01-5.539-2.64.228.228 0 01-.022-.378c.372-.279.744-.569 1.1-.862a.22.22 0 01.23-.03c11.619 5.304 24.198 5.304 35.68 0a.219.219 0 01.233.027c.356.293.728.586 1.103.865a.228.228 0 01-.02.378 36.384 36.384 0 01-5.54 2.637.227.227 0 00-.121.315 47.249 47.249 0 003.624 5.897.225.225 0 00.249.084c5.801-1.794 11.684-4.502 17.757-8.961a.228.228 0 00.092-.164c1.48-15.315-2.48-28.618-10.497-40.412a.18.18 0 00-.093-.084zm-36.38 32.427c-3.497 0-6.38-3.211-6.38-7.156 0-3.944 2.827-7.156 6.38-7.156 3.583 0 6.438 3.24 6.382 7.156 0 3.945-2.827 7.156-6.381 7.156zm23.593 0c-3.498 0-6.38-3.211-6.38-7.156 0-3.944 2.826-7.156 6.38-7.156 3.582 0 6.437 3.24 6.38 7.156 0 3.945-2.798 7.156-6.38 7.156z" />
    //         </g>
    //         <defs>
    //           <clipPath id="clip0">
    //             <path fill="currentColor" d="M0 0H71V55H0z" />
    //           </clipPath>
    //         </defs>
    //       </svg>
    //     ),
    //     text: "npm",
    //     label: "View on npm",
    //     external: true,
    //   },
    // ],
  };
}
