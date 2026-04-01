import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { monaSans } from "@/providers/fonts-provider";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Hail Mary | Movie Night",
  description:
    "Let's figure out the best date and time, that works for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("no-scrollbar", monaSans.variable, "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col no-scrollbar selection:text-white selection:bg-black">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
