import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../components/Web3Provider";
import WalletTracker from "../components/WalletTracker";
import ErrorBoundary from "../components/ErrorBoundary";
import SoundManager from "../components/SoundManager";
import BackgroundMusic from "../components/BackgroundMusic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YieldShop - Shop & Earn DeFi Yield",
  description: "Shop online and earn DeFi yield instantly on Mantle Network.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <Web3Provider>
            <SoundManager />
            <WalletTracker />
            <BackgroundMusic />
            {children}
          </Web3Provider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
