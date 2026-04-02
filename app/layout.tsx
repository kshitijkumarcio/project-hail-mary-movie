import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/sections/navbar";
import { monaSans } from "@/providers/fonts-provider";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LenisProvider } from "@/components/providers/lenis-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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

import { ResponsiveGuard } from "@/components/responsive-guard";
import { ConvexClientProvider } from "@/providers/ClientConvexProvider";
import { GSAPProvider } from "@/providers/gsap-provider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "no-scrollbar",
        monaSans.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col no-scrollbar selection:text-white selection:bg-black"
      >
        <GSAPProvider>
          <LenisProvider>
            <ConvexClientProvider>
              <TooltipProvider>
                <ResponsiveGuard />
                <Navbar />
                {children}
                <Toaster />
              </TooltipProvider>
            </ConvexClientProvider>
          </LenisProvider>
        </GSAPProvider>
      </body>
    </html>
  );
}
