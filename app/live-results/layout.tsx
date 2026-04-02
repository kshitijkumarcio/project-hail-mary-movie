import React from "react";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";

export default function LiveResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dull-white">
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}
