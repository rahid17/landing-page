import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KTalk - Premium Organic Mehendi | Buy Online in Bangladesh",
  description:
    "KTalk offers 100% organic, chemical-free mehendi made from pure henna leaves. Safe for skin, long-lasting color. Order online with cash on delivery across Bangladesh.",
  openGraph: {
    title: "KTalk - Premium Organic Mehendi | Buy Online in Bangladesh",
    description:
      "100% organic, chemical-free mehendi made from pure henna leaves. Safe for skin, long-lasting color. Order now!",
    type: "website",
    siteName: "KTalk",
  },
  twitter: {
    card: "summary_large_image",
    title: "KTalk - Premium Organic Mehendi",
    description:
      "100% organic mehendi. Natural, safe, and long-lasting color for your special occasions.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
