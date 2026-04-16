import { Landing } from "@/components/marketing/landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Energiapiloot — Energiaotsused, selgelt",
  description:
    "Energiapiloot aitab kodudel ja väikeettevõtetel võrrelda elektrilepinguid, mõista tarbimist, simuleerida investeeringuid ja saada soovitusi.",
  openGraph: {
    title: "Energiapiloot — Energiaotsused, selgelt",
    description:
      "Lepingu analüüs, tarbimise ülevaade, investeeringute simulatsioon ja soovitused — selge loogika, ausad eeldused.",
    url: "/",
  },
  twitter: {
    title: "Energiapiloot — Energiaotsused, selgelt",
    description:
      "Lepingud, tarbimine ja investeeringud ühes mudelis. Soovitused koos mõjuhinnangu ja põhjendusega.",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Energiapiloot",
        url: "https://energiapiloot.com",
        logo: "https://energiapiloot.com/icon.png",
        sameAs: [],
      },
      {
        "@type": "WebSite",
        name: "Energiapiloot",
        url: "https://energiapiloot.com",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://energiapiloot.com/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Energiapiloot",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
          category: "Free",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD must be injected as raw string
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing />
    </>
  );
}

