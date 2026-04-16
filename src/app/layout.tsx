import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://energiapiloot.com"),
  title: {
    default: "Energiapiloot — Baltic energy decisions, simplified",
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
    title: "Energiapiloot — Baltic energy decisions, simplified",
    description:
      "Lepinguanalüüs, tarbimise insight, investeeringute simulatsioonid ja soovitused — premium UX, selged eeldused.",
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
