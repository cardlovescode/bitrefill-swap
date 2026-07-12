import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "@/lib/wagmi";
import { Providers } from "./providers";
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
  title: "Bitrefill Swap - Convert Crypto to Gift Cards Instantly",
  description: "Swap any cryptocurrency for Bitrefill gift cards on Base network. Connect your wallet, choose a token, and receive your gift card code in seconds. Fast, secure, and non-custodial.",
  openGraph: {
    title: "Bitrefill Swap - Convert Crypto to Gift Cards Instantly",
    description: "Swap any cryptocurrency for Bitrefill gift cards on Base network. Fast, secure, and non-custodial.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Bitrefill Swap",
    description: "Convert any crypto to gift cards instantly on Base",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const initialState = cookieToInitialState(
    config,
    headersList.get("cookie")
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
    >
      <body className="min-h-screen flex flex-col">
        <Providers initialState={initialState}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
