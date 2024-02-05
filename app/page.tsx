import CScreen from "@/src/CScreen";
import Script from "next/script";
import { metadata } from "./layout";
import styles from "@/src/styles";

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
      <a
        href="https://interbolt.ck.page/8e222f4c7a"
        style={{
          textDecoration: "none",
          position: "relative",
          zIndex: 1000,
          cursor: "pointer",
          width: "100%",
          lineHeight: "1.8",
          textAlign: "center",
          boxSizing: "border-box",
          justifyContent: "center",
          padding: 10,
          fontSize: 14,
          fontFamily: "monospace",
          fontWeight: "bold",
          color: "white",
          background: styles.colors.chartBackgroundFrom,
        }}
      >
        Like this demo? Subscribe for more &#8594;
      </a>
      <CScreen />
    </>
  );
}
