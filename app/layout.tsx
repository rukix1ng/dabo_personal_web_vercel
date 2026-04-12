import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { getSiteUrl, getSiteUrlObject } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: getSiteUrlObject(),
  title: {
    default: "Industry-Academia Exchange Platform for Semiconductor Equipment Materials",
    template: "%s",
  },
  description:
    "Industry-academia exchange platform for semiconductor equipment materials under the NIMS and Lam Research collaborative project.",
  keywords: [
    "semiconductor equipment materials",
    "industry-academia exchange",
    "NIMS",
    "Lam Research",
    "research papers",
    "publications",
  ],
  authors: [{ name: "Semiconductor Equipment Materials Industry-Academia Exchange Platform" }],
  creator: "Semiconductor Equipment Materials Industry-Academia Exchange Platform",
  publisher: "Semiconductor Equipment Materials Industry-Academia Exchange Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: undefined,
  twitter: undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value ?? "en";

  const baseUrl = getSiteUrl();

  // WebSite structured data
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Semiconductor Equipment Materials Industry-Academia Exchange Platform",
    description: "Industry-academia exchange platform for semiconductor equipment materials under the NIMS and Lam Research collaborative project.",
    url: baseUrl,
    inLanguage: ["en", "zh", "ja"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
