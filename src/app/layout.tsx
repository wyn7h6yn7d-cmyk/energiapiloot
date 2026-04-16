import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { getSiteUrl } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Energiapiloot — energiaotsused selgelt",
    template: "%s — Energiapiloot",
  },
  description:
    "Energiapiloot aitab kodudel ja väikeettevõtetel mõista tarbimist, võrrelda elektrilepinguid, simuleerida säästu ja teha investeeringuotsuseid kindlalt.",
  applicationName: "Energiapiloot",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Energiapiloot",
    title: "Energiapiloot — energiaotsused selgelt",
    description:
      "Lepingu võrdlus, tarbimise ülevaade, investeeringute simulatsioon ja prioriseeritud soovitused — selge loogika, ausad eeldused.",
    locale: "et_EE",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Energiapiloot",
    description:
      "Energiaotsused, selgelt ja auditeeritavalt — lepingud, tarbimine ja investeeringud ühes mudelis.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="et"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-[oklch(0.83_0.14_205_/_0.28)] selection:text-foreground dark:selection:bg-[oklch(0.83_0.14_205_/_0.38)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
