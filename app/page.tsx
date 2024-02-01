import CScreen from "@/src/CScreen";
import Script from "next/script";
import { metadata } from "./layout";

const schemaOrg = {
  "@context": `https://schema.org`,
  "@type": `BlogPosting`,
  headline: metadata.title,
  description: metadata.description,
  author: [
    {
      "@type": `Person`,
      name: `Colin Campbell`,
      image: `/images/member-colin-campbell.webp`,
      description: `InterBolt Founder`,
    },
  ],
  creator: [
    {
      "@type": `Organization`,
      name: `InterBolt`,
      email: `cc13.engineering@gmail.com`,
    },
  ],
  image: `/images/banner.png`,
  datePublished: `2024-02-01T00:00:00.000Z`,
  dateModified: `2024-01-30T12:32:50.119Z`,
};

export default function Home() {
  return (
    <>
      <Script
        strategy="beforeInteractive"
        type="application/ld+json"
      >{`${JSON.stringify(schemaOrg)}`}</Script>
      <CScreen />
    </>
  );
}
