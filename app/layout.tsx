import type { Metadata } from "next";
import { Nunito_Sans, Oswald } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const nunito = Nunito_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "5 proti 5",
  description:
    "Pohodová rodinná súťaž v štýle Family Feud. Moderátor odhaľuje odpovede, hráči hádajú pri televízore.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sk"
      suppressHydrationWarning
      className={`${nunito.variable} ${oswald.variable} dark h-full antialiased`}
    >
      <body className="game-root min-h-full flex flex-col font-sans">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
