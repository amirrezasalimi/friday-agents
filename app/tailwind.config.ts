import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  plugins: [nextui({
    defaultTheme: "dark"
  })],
} satisfies Config;
