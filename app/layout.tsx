import type { Metadata, Viewport } from "next";

import "./index.css";

export const metadata: Metadata = {
  title: "An interactive clustering visualization of a semantic cache",
  description:
    "A visualization that uses recharts and the t-SNE to visualize semantic clusters of cached queries and the effect of a similarity threshold on the cache hit rate as well as the cache quality.",
};

export const viewport: Viewport = {
  themeColor: "#2a2546",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="flex flex-col min-h-[100vh] w-full max-w-[100vw] bg-gradient-to-b from-white to-gray-200">
        {children}
      </body>
    </html>
  );
}
