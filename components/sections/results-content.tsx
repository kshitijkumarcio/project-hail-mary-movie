"use client";
import Image from "next/image";
import { images } from "@/constants";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import GsapScrollToButton from "../ui/gsap-scroll-to-button";
import Marquee from "../animating-wrappers/text-marquee";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DAYS, THEATERS, SHOWTIMES_BY_THEATER } from "@/constants";
import {
  CheckCircle2,
  TrendingUp,
  User,
  Phone,
  Mail,
  Clock,
  Trophy,
  Crown,
  Medal,
  UserCheck,
  Loader2,
} from "lucide-react";
import FlipTextButton from "../ui/flip-text-button";
import UpdatePreferencesForm from "./update-preferences-form";
import UpdateProfileForm from "./update-profile-form";

/** All possible slots in display-key order (matches voters.selectedSlots format) */
const ALL_SLOTS: string[] = DAYS.flatMap((day) =>
  THEATERS.flatMap((theater) =>
    (SHOWTIMES_BY_THEATER[day as keyof typeof SHOWTIMES_BY_THEATER]?.[theater.id] ?? []).map(
      (time) => `${day} | ${theater.name} | ${time}`
    )
  )
);

const ResultsContent = () => {
  const formRef = useRef<HTMLDivElement>(null);
  const [activeUpdateForm, setActiveUpdateForm] = useState<"preferences" | "profile" | null>(null);

  const handleUpdateClick = (mode: "preferences" | "profile") => {
    setActiveUpdateForm(mode);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // ── Live Convex data ────────────────────────────────────────────────────────
  const slotCountDocs = useQuery(api.showtimes.getAllSlotCounts);
  const isLoading = slotCountDocs === undefined;

  const voterRecord = useQuery(api.voters.getMyVoterRecord);
  const isLoadingUser = voterRecord === undefined;

  const userData = voterRecord || {
    name: isLoadingUser ? "Loading..." : "You haven't voted yet 👋",
    phone: isLoadingUser ? "Loading..." : "You haven't voted yet 👋",
    email: isLoadingUser ? "Loading..." : "You haven't voted yet 👋",
    selectedSlots: [] as string[],
  };

  /**
   * Build a vote-count map keyed on the display format:
   * "Saturday, April 04 | Cinepolis: VR Mall | 05.15 PM"
   *
   * The showtimeVoteCounts table stores slotKey as "date|theaterId|time".
   * We reconstruct the display key by matching theaterId → theaterName.
   */
  const theaterById = Object.fromEntries(THEATERS.map((t) => [t.id, t.name]));

  const liveVotes: Record<string, number> = {};
  if (slotCountDocs) {
    for (const doc of slotCountDocs) {
      const theaterName = theaterById[doc.theaterId] ?? doc.theaterId;
      const displayKey = `${doc.date} | ${theaterName} | ${doc.time}`;
      liveVotes[displayKey] = doc.voteCount;
    }
  }

  // Merge with all slots so every slot always has a count (even if 0)
  const votesMap: Record<string, number> = Object.fromEntries(
    ALL_SLOTS.map((slot) => [slot, liveVotes[slot] ?? 0])
  );

  const allZero = Object.values(votesMap).every((v) => v === 0);

  // Sort by vote count descending; if all zero, preserve constants order
  const sortedSessions: [string, number][] = allZero
    ? ALL_SLOTS.slice(0, 3).map((slot) => [slot, 0])
    : Object.entries(votesMap).sort((a, b) => b[1] - a[1]);

  const topThree = allZero
    ? sortedSessions  // already exactly 3
    : sortedSessions.slice(0, 3);

  const topSessions = topThree.map((s) => s[0]);
  const maxVotes = topThree[0]?.[1] || 0;

  const [isHovered, setIsHovered] = useState(false);
  const ticketDivRef = useRef<HTMLDivElement>(null);

  // Motion values for tracking mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring values for smooth animation
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Transform parameters
  const rotateDepth = 15; // Degrees of rotation
  const translateDepth = 18; // Pixels of translation

  // Transform mouse position to rotation values
  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`-${rotateDepth}deg`, `${rotateDepth}deg`],
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`${rotateDepth}deg`, `-${rotateDepth}deg`], // ✅ Fixed mapping (reversed)
  );

  const translateX = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${translateDepth}px`, `${translateDepth}px`],
  );
  const translateY = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${translateDepth}px`, `-${translateDepth}px`],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ticketDivRef.current) return;

    const rect = ticketDivRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div className="px-16 py-24 pt-36 font-mona-sans space-y-24">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="space-y-4 flex-1">
          <p className="text-black text-[48px] md:text-[60px] leading-tight font-bold">
            (Live Results{" "}
            <span className="inline-block -tracking-[4px] md:-tracking-[6px] translate-y-[-2px]">
              ------
            </span>
            )
          </p>
          <p className="text-zinc-600 text-lg max-w-xl">
            Here's how the community is voting for the screening.
          </p>
        </div>

        <div className="relative flex-1">
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-998 aspect-5/1.75 w-[35dvw] perspective-[1000]">
            {/* ticket 1 */}
            <motion.div
              ref={ticketDivRef}
              onPointerEnter={handleMouseEnter}
              onPointerLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              animate={{
                rotate: !isHovered ? "3deg" : "0deg",
                z: isHovered ? 50 : 0,
              }}
              style={{
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
                translateX: isHovered ? translateX : 0,
                translateY: isHovered ? translateY : 0,
                transformStyle: "preserve-3d",
              }}
              transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
              className="absolute left-1/2 z-778 h-full w-full -translate-x-1/2 overflow-hidden rounded-[8px] shadow-2xl"
            >
              <div className="flex h-full w-full rounded-[8px] overflow-hidden">
                <div className="h-full w-full max-w-[78%] ">
                  <div className="relative h-full w-full">
                    <Image
                      src={images.ticketP1}
                      alt="Barcode"
                      placeholder="blur"
                      fill
                      priority
                      unoptimized
                      className="object-cover object-left"
                    />
                  </div>
                </div>
                <div
                  className="relative flex h-full max-h-[364px] min-w-4 flex-col items-center justify-between bg-black"
                  style={{
                    maskImage: `
                      radial-gradient(circle at 50% 0%, transparent 0, transparent 8px, white 8px),
              radial-gradient(circle at 50% 100%, transparent 0, transparent 8px, white 8px),
              ${Array.from({ length: 36 })
                .map((_, i) => {
                  const position = 5 + i * (90 / 35);
                  return `radial-gradient(circle at 50% ${position}%, transparent 0, transparent 1.5px, white 1.5px)`;
                })
                .join(",\n      ")}
                `,
                    WebkitMaskImage: `
                radial-gradient(circle at 50% 0%, transparent 0, transparent 8px, white 4px),
                radial-gradient(circle at 50% 100%, transparent 0, transparent 8px, white 4px),
                ${Array.from({ length: 36 })
                  .map((_, i) => {
                    const position = 5 + i * (90 / 35);
                    return `radial-gradient(circle at 50% ${position}%, transparent 0, transparent 1.5px, white 1.5px)`;
                  })
                  .join(",\n      ")}
                `,
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                  }}
                ></div>
                <div className="h-full flex w-full max-w-[22%]">
                  <div className="relative h-full w-full">
                    <Image
                      src={images.ticketP2}
                      fill
                      placeholder="blur"
                      unoptimized
                      alt=""
                      priority
                      sizes="500px"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ticket 2 */}
            <motion.div
              animate={{
                rotate: !isHovered ? "-6deg" : "0deg",
                z: isHovered ? 25 : 0,
              }}
              style={{
                rotateX: isHovered ? rotateX : 0,
                rotateY: isHovered ? rotateY : 0,
                translateX: isHovered ? translateX : 0,
                translateY: isHovered ? translateY : 0,
                transformStyle: "preserve-3d",
              }}
              transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
              className="pointer-events-none shadow-2xl absolute left-1/2 z-777 h-full w-full -translate-x-1/2 overflow-hidden rounded-[8px]"
            >
              <div className="flex h-full w-full rounded-[8px] overflow-hidden">
                <div className="h-full w-full max-w-[78%] bg-[#AAAAAA]"></div>
                <div
                  className="relative flex h-full max-h-[364px] min-w-4 flex-col items-center justify-between bg-[#AAAAAA]"
                  style={{
                    maskImage: `
                        radial-gradient(circle at 50% 0%, transparent 0, transparent 8px, black 8px),
                radial-gradient(circle at 50% 100%, transparent 0, transparent 8px, black 8px),
                ${Array.from({ length: 36 })
                  .map((_, i) => {
                    const position = 5 + i * (90 / 35);
                    return `radial-gradient(circle at 50% ${position}%, transparent 0, transparent 1.5px, black 1.5px)`;
                  })
                  .join(",\n        ")}
                   `,
                    WebkitMaskImage: `
                   radial-gradient(circle at 50% 0%, transparent 0, transparent 8px, black 4px),
                   radial-gradient(circle at 50% 100%, transparent 0, transparent 8px, black 4px),
                   ${Array.from({ length: 36 })
                     .map((_, i) => {
                       const position = 5 + i * (90 / 35);
                       return `radial-gradient(circle at 50% ${position}%, transparent 0, transparent 1.5px, black 1.5px)`;
                     })
                     .join(",\n        ")}
                   `,
                    maskComposite: "intersect",
                    WebkitMaskComposite: "source-in",
                  }}
                ></div>
                <div className="h-full w-full max-w-[22%] bg-[#AAAAAA]"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative mt-60 grid grid-cols-12 gap-16 items-start">
        {/* Left side: Podium Section */}
        <div className="lg:col-span-7 space-y-12 bg-zinc-100/50 rounded-[32px] p-8 border border-zinc-200/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-black uppercase tracking-tight">
                Most Voted Screens
              </h2>
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading live data…
              </div>
            )}
            {!isLoading && allZero && (
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest bg-zinc-200 px-3 py-1 rounded-full">
                No votes yet
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto pt-10">
            {/* 2nd Place */}
            {topThree[1] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="order-2 md:order-1 flex flex-col items-center"
              >
                <div className="text-center mb-6 space-y-1">
                  <Medal className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                    2nd Place
                  </p>
                </div>
                <div className="w-full bg-zinc-100 rounded-t-[32px] p-8 border-x border-t border-zinc-200 text-center min-h-[220px] flex flex-col justify-between shadow-sm">
                  <div className="space-y-2">
                    <p className="font-bold text-black leading-snug">
                      {topThree[1][0].split(" | ")[2]}
                    </p>
                    <p className="text-[11px] font-bold text-black/50 uppercase tracking-widest">
                      {topThree[1][0].split(" | ")[0]}
                    </p>
                    <p className="text-xs font-bold text-zinc-500 uppercase">
                      {topThree[1][0].split(" | ")[1]}
                    </p>
                  </div>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-black">
                      {topThree[1][1]}
                    </span>
                    <span className="text-zinc-400 font-bold ml-2">votes</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="order-1 md:order-2 flex flex-col items-center z-10"
              >
                <div className="text-center mb-6 space-y-1">
                  <Crown className="w-12 h-12 text-black mx-auto animate-bounce-slow" />
                  <p className="text-lg font-black text-black uppercase tracking-[0.2em]">
                    Current Winner
                  </p>
                </div>
                <div className="w-full bg-black rounded-t-[40px] p-10 text-center min-h-[300px] flex flex-col justify-between shadow-2xl shadow-black/20 text-white relative group overflow-hidden border border-white/10">
                  <div className="absolute inset-0 bg-linear-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="space-y-2 relative z-10">
                    <p className="text-xl font-bold text-white leading-tight">
                      {topThree[0][0].split(" | ")[2]}
                    </p>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest">
                      {topThree[0][0].split(" | ")[0]}
                    </p>
                    <p className="text-xs font-bold text-white/80 uppercase tracking-widest">
                      {topThree[0][0].split(" | ")[1]}
                    </p>
                  </div>
                  <div className="pt-6 relative z-10">
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-[4px] mb-2">
                       Total Power
                    </div>
                    <span className="text-6xl font-black text-white italic">
                      {topThree[0][1]}
                    </span>
                    <span className="text-white/60 font-bold ml-3 text-lg uppercase">
                      Votes
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="order-3 md:order-3 flex flex-col items-center"
              >
                <div className="text-center mb-6 space-y-1">
                  <Medal className="w-8 h-8 text-orange-500/60 mx-auto" />
                  <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                    3rd Place
                  </p>
                </div>
                <div className="w-full bg-zinc-50 rounded-t-[24px] p-6 border-x border-t border-zinc-100 text-center min-h-[180px] flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="font-bold text-zinc-800 leading-snug">
                      {topThree[2][0].split(" | ")[2]}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {topThree[2][0].split(" | ")[0]}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">
                      {topThree[2][0].split(" | ")[1]}
                    </p>
                  </div>
                  <div className="pt-4">
                    <span className="text-3xl font-bold text-zinc-700">
                      {topThree[2][1]}
                    </span>
                    <span className="text-zinc-400 font-bold ml-2 text-sm">
                      votes
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Left Side: Global Rankings */}
          <div className="mt-40 lg:col-span-7 space-y-12">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-black uppercase tracking-tight">
                Active Votes
              </h2>
            </div>

            <div className="space-y-10">
              {DAYS.map((day) => (
                <div key={day} className="pt-5 pb-5 space-y-6">
                  <p className="text-xl font-bold border-l-4 pl-4 border-l-black text-black/90">
                    {day}
                  </p>

                  <div className="grid pt-6 grid-cols-1 gap-4 space-y-10">
                    {THEATERS.map((theater) => {
                      const times = SHOWTIMES_BY_THEATER[day][theater.id];

                      return (
                        <div key={`${day}-${theater.id}`} className="space-y-4">
                          <p className="font-bold text-zinc-800">
                            {theater.name}
                          </p>
                          {times.length === 0 ? (
                            <div className="p-5 rounded-2xl border-2 border-dashed border-zinc-100 bg-zinc-50/50 flex items-center justify-center">
                              <p className="text-zinc-400 text-sm font-medium italic">
                                No slots available in VR Mall on this day
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {times.map((time) => {
                                const sessionKey = `${day} | ${theater.name} | ${time}`;
                                const votes = votesMap[sessionKey] ?? 0;
                                const isTop = !allZero && topSessions.includes(sessionKey);

                                return (
                                  <div
                                    key={sessionKey}
                                    className={cn(
                                      "flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300",
                                      isTop
                                        ? "bg-black border-black text-white shadow-xl shadow-black/10"
                                        : "bg-white border-zinc-100",
                                    )}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div
                                        className={cn(
                                          "w-2 h-2 rounded-full",
                                          theater.name.includes("VR Mall")
                                            ? "bg-green-500"
                                            : "bg-red-500",
                                        )}
                                      />
                                      <span className="font-semibold">
                                        {time}
                                      </span>
                                      {isTop && (
                                        <span className="text-[10px] uppercase tracking-widest bg-white/20 px-2 py-1 rounded-full font-bold">
                                          Trending
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={cn(
                                          "text-lg font-bold",
                                          isTop ? "text-white" : "text-black",
                                        )}
                                      >
                                        {votes}
                                      </span>
                                      <span
                                        className={
                                          isTop
                                            ? "text-white/60"
                                            : "text-zinc-400"
                                        }
                                      >
                                        votes
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Personal Data Portal */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-8">
          <div className="bg-zinc-100/50 rounded-[32px] p-8 border border-zinc-200/50 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-black" />
                <h2 className="text-2xl font-bold text-black uppercase tracking-tight">
                  Your Data
                </h2>
              </div>
              {voterRecord ? (
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  Voted
                </div>
              ) : (
                <div className="px-3 py-1 bg-zinc-200 text-zinc-600 text-xs font-bold rounded-full uppercase tracking-wider">
                  {isLoadingUser ? "Loading..." : "Not Voted"}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-black transition-colors">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Name
                  </p>
                  <p className="font-bold text-black">{userData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-black transition-colors">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Phone
                  </p>
                  <p className="font-bold text-black">{userData.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-black transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Email
                  </p>
                  <p className="font-bold text-black">{userData.email}</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-200" />

            {/* Selected Sessions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-zinc-400" />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Your Choices
                </p>
              </div>
              <div className="space-y-2">
                {userData.selectedSlots.length > 0 ? (
                  userData.selectedSlots.map((session) => (
                    <div
                      key={session}
                      className="p-4 bg-white border border-zinc-200 rounded-xl flex items-center gap-3"
                    >
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span className="text-sm font-semibold text-zinc-700">
                        {session}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-white border border-zinc-200 rounded-xl flex items-center justify-center gap-3 text-zinc-500 text-sm">
                    No slots selected yet.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {voterRecord ? (
                <>
                  <button
                    onClick={() => handleUpdateClick("preferences")}
                    className={cn(
                      "w-full h-14 rounded-2xl font-bold uppercase text-sm tracking-wider transition-all flex items-center justify-center group overflow-hidden",
                      activeUpdateForm === "preferences"
                        ? "bg-zinc-200 text-zinc-600"
                        : "bg-black text-white hover:bg-zinc-800",
                    )}
                  >
                    <FlipTextButton maxHeight="max-h-14">
                      Update Preferences
                    </FlipTextButton>
                  </button>
                  <button
                    onClick={() => handleUpdateClick("profile")}
                    className={cn(
                      "w-full h-14 rounded-2xl font-bold uppercase text-sm tracking-wider transition-all flex items-center justify-center group overflow-hidden",
                      activeUpdateForm === "profile"
                        ? "bg-zinc-200 text-zinc-600"
                        : "bg-black text-white hover:bg-zinc-800",
                    )}
                  >
                    <FlipTextButton maxHeight="max-h-14">
                      Update Profile
                    </FlipTextButton>
                  </button>
                </>
              ) : (
                <Link
                  href="/home"
                  className="w-full h-14 rounded-2xl font-bold uppercase bg-black text-white hover:bg-zinc-800 text-sm tracking-wider transition-all flex items-center justify-center group overflow-hidden shadow-xl shadow-black/10"
                >
                  <FlipTextButton maxHeight="max-h-14">
                    Cast Your Vote
                  </FlipTextButton>
                </Link>
              )}
            </div>
          </div>

          <div className="p-8 border-2 border-dashed border-zinc-200 rounded-[32px] text-center space-y-2">
            <p className="text-zinc-500 font-medium">
              Want to invite a friend?
            </p>
            <p className="text-sm text-zinc-400">
              Share this page with them! 
            </p>
          </div>
        </div>
      </div>

      {/* Update Form Section */}
      {activeUpdateForm && (
        <div ref={formRef} className="pt-24 border-t border-zinc-200">
          {activeUpdateForm === "preferences" ? (
            <UpdatePreferencesForm initialData={{ session: userData.selectedSlots }} />
          ) : (
            <UpdateProfileForm initialData={{ name: userData.name, phone: userData.phone, email: userData.email }} />
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsContent;
