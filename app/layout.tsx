import type { Metadata, Viewport } from "next";

import "./index.css";

export const metadata: Metadata = {
  title: "An interactive cluster visualization of a semantic cache",
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
      <body className="flex flex-col min-h-[100vh] w-full max-w-[100vw] bg-gradient-to-b from-white to-gray-200">
        {children}
      </body>
    </html>
  );
}
