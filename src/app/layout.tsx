import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://orbit-beta-indol.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "Orbit — What did you build?",
    template: "%s | Orbit",
  },
  description:
    "A social platform for builders to showcase creations, gain recognition, and establish credibility. Share your projects with the builder community.",
  keywords: [
    "developer portfolio",
    "builders community",
    "project showcase",
    "indie hackers",
    "open source portfolio",
    "developer social network",
  ],
  authors: [{ name: "Orbit" }],
  openGraph: {
    title: "Orbit — What did you build?",
    description:
      "A social platform for builders to showcase creations, gain recognition, and establish credibility.",
    url: baseUrl,
    siteName: "Orbit",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit — What did you build?",
    description:
      "Share your projects with the builder community and discover what others are building.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "mhSXaf_sidCu296FH7VuTTXJReTBdzv-dHKSLW4pyXc",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
