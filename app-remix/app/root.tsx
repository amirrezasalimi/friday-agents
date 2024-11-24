import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { NextUIProvider } from "@nextui-org/react";
import "./shared/styles/markdown.css";
import "./shared/styles/globals.css";
import "./tailwind.css";
import BaseLayout from "./shared/components/base-layout";
import { ClientOnly } from "remix-utils/client-only";
import { useEffect } from "react";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "/fonts/GeistVF.woff",
    as: "font",
    type: "font/woff",
  },
  {
    rel: "stylesheet",
    href: "/fonts/GeistMonoVF.woff",
    as: "font",
    type: "font/woff",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof document === "undefined") return;

    import("react-scan").then(({ scan }) => {
      scan({
        includeChildren: true,
        log: true,
        report: true,
      });
    });
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans antialiased overflow-hidden h-[100dvh]">
        <NextUIProvider>
          <BaseLayout>
            <ClientOnly fallback={null}>{() => children}</ClientOnly>
          </BaseLayout>
        </NextUIProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
