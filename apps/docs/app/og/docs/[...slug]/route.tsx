import { getPageImage, source } from "@/lib/source";
import { notFound } from "next/navigation";
import { ImageResponse } from "@takumi-rs/image-response";
import { generate as DefaultImage } from "fumadocs-ui/og/takumi";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/og/docs/[...slug]">
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const { title } = page.data;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#fdfcfd",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "#1a1523",
      }}
    >
      <svg
        style={{
          position: "absolute",
          top: 0,
          right: -210,
          bottom: -120,
          opacity: 0.15,
        }}
        width="50"
        height="50"
        viewBox="0 0 100 100"
        fill="none"
      >
        <path
          d="M53.0581 5.08631C58.2934 5.48067 64.3341 11.7904 64.3341 17.4631C64.3341 19.5259 61.8402 22.874 54.2662 24.1672C48.2255 25.1986 42.1848 23.2875 38.963 21.5887C32.1169 17.9788 34.8359 12.6599 37.3522 10.2433C41.3793 6.37556 46.2119 4.57061 53.0581 5.08631Z"
          fill="black"
        />
        <path
          d="M75.4506 46.1138C74.2072 52.2535 64.591 54.1578 48.3016 54.1578C36.3561 54.1578 23.8676 51.4764 24.4105 43.4324C24.9535 35.3884 34.7271 29.5789 49.9305 29.5789C65.134 29.5789 77.0795 38.0698 75.4506 46.1138Z"
          fill="black"
        />
        <path
          d="M84.3583 72.7254C83.228 65.5637 72.8821 59.2209 51.0773 58.7015C39.6011 57.9372 10.4882 65.5763 16.6487 77.9194C23.3693 91.3845 47.4362 89.8656 63.7011 89.8656C70.6818 89.8656 86.0797 83.6328 84.3583 72.7254Z"
          fill="black"
        />
      </svg>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          padding: "64px",
          position: "relative",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "40px",
            textWrap: "pretty",
          }}
        >
          <span
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              fontWeight: 400,
              lineHeight: 1.4,
              maxWidth: "95%",
              letterSpacing: "-0.01em",
              lineClamp: 2,
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            Documentation
          </span>
          <span
            style={{
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.04em",
              color: "#1a1523",
              marginLeft: -4,
            }}
          >
            {title}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginLeft: -12,
            marginBottom: -4,
          }}
        >
          <svg
            width={44}
            height={44}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M53.0581 5.08631C58.2934 5.48067 64.3341 11.7904 64.3341 17.4631C64.3341 19.5259 61.8402 22.874 54.2662 24.1672C48.2255 25.1986 42.1848 23.2875 38.963 21.5887C32.1169 17.9788 34.8359 12.6599 37.3522 10.2433C41.3793 6.37556 46.2119 4.57061 53.0581 5.08631Z"
              fill="black"
            />
            <path
              d="M75.4506 46.1138C74.2072 52.2535 64.591 54.1578 48.3016 54.1578C36.3561 54.1578 23.8676 51.4764 24.4105 43.4324C24.9535 35.3884 34.7271 29.5789 49.9305 29.5789C65.134 29.5789 77.0795 38.0698 75.4506 46.1138Z"
              fill="black"
            />
            <path
              d="M84.3583 72.7254C83.228 65.5637 72.8821 59.2209 51.0773 58.7015C39.6011 57.9372 10.4882 65.5763 16.6487 77.9194C23.3693 91.3845 47.4362 89.8656 63.7011 89.8656C70.6818 89.8656 86.0797 83.6328 84.3583 72.7254Z"
              fill="black"
            />
          </svg>

          <span
            style={{
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#1a1523",
              opacity: 0.9,
            }}
          >
            Zen Router
          </span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      format: "webp",
    }
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
}
