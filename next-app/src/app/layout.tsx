import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotWidget from "@/components/ChatbotWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ToolShare — India's Peer-to-Peer Equipment & Tool Rental Marketplace",
  description:
    "Rent professional power tools, ladders, saws, pressure washers, and garden equipment from trusted neighbors. Built with Next.js, Tailwind CSS, and MongoDB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#F5F2ED] text-[#1A242B] font-sans antialiased selection:bg-brand selection:text-white">
        <Navbar />
        <main className="min-h-[calc(100vh-200px)]">{children}</main>
        <Footer />
        <ChatbotWidget />
      </body>
    </html>
  );
}
