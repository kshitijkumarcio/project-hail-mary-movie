"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 pointer-events-none z-999 h-svh w-screen">
      <nav className="absolute pointer-events-auto bottom-5.5 h-20 left-1/2 -translate-x-1/2 flex items-center rounded-[8px] justify-center">
        <div className="flex bg-black/40 p-1.5 rounded-[8px] justify-center items-center gap-1.5 backdrop-blur-md">
          <Link
            href="/home"
            prefetch={true}
            className={cn(
              "h-8 px-4 flex justify-center items-center rounded-[4px] transition-all",
              pathname === "/home" || pathname === "/"
                ? "bg-black/80"
                : "hover:bg-black/20",
            )}
          >
            <p
              className={cn(
                "text-white text-[14px] font-medium transition-opacity",
              )}
            >
              Home
            </p>
          </Link>
          <Link
            href="/live-results"
            prefetch={true}
            className={cn(
              "h-8 px-4 flex justify-center items-center rounded-[4px] transition-all",
              pathname === "/live-results"
                ? "bg-black/80"
                : "hover:bg-black/20",
            )}
          >
            <p
              className={cn(
                "text-white text-[14px] font-medium whitespace-nowrap transition-opacity",
              )}
            >
              Live results
            </p>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
