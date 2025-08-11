import "./globals.css";
import type { Metadata } from "next";
import { BRAND } from "@/config/shopConfig";

export const metadata: Metadata = {
  title: `${BRAND.name} — Shop`,
  description: "A young nursery with big dreams—whimsical, tropical houseplants from Tacoma, WA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
