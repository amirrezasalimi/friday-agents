import type { Metadata } from "next";
import localFont from "next/font/local";

import '@/shared/styles/markdown.css';
import "@/shared/styles/globals.css";
import BaseLayout from "@/shared/components/base-layout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 300 400 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Friday Agents"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden h-[100dvh]`}
      >
        <BaseLayout>{children}</BaseLayout>
      </body>
    </html>
  );
}
