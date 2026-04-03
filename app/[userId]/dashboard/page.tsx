"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ALL_SLOTS, THEATERS } from "@/constants";
import { 
  Trophy, 
  Crown, 
  Medal, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Search,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

const DashboardPage = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  
  // ── Convex Data ────────────────────────────────────────────────────────────
  const slotCountDocs = useQuery(api.showtimes.getAllSlotCounts);
  const allVoters = useQuery(api.voters.getDashboardData);
  const isLoadingData = slotCountDocs === undefined || allVoters === undefined;

  const [expandedPodium, setExpandedPodium] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const theaterById = Object.fromEntries(THEATERS.map((t) => [t.id, t.name]));

  // ── Authentication Check ───────────────────────────────────────────────────
  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-grid-dashed flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  // Only the user whose ID is in the URL can access this dashboard
  if (!session || session.user.id !== userId) {
    return (
      <div className="min-h-screen bg-grid-dashed flex flex-col items-center justify-center p-8">
        <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-zinc-100 flex flex-col items-center text-center max-w-md">
          <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center text-zinc-400 mb-8">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight mb-4">Access Denied</h1>
          <p className="text-zinc-600 mb-8">
            You don't have permission to view this dashboard. Only the owner of this account can access it.
          </p>
          <button 
            onClick={() => router.push("/home")}
            className="w-full h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // ── Data Processing ────────────────────────────────────────────────────────
  const liveVotes: Record<string, number> = {};
  if (slotCountDocs) {
    for (const doc of slotCountDocs) {
      liveVotes[doc.slotId] = doc.voteCount;
    }
  }

  const sortedSlots = [...ALL_SLOTS].sort((a, b) => {
    const votesA = liveVotes[a.id] ?? 0;
    const votesB = liveVotes[b.id] ?? 0;
    return votesB - votesA;
  });

  const topThree = sortedSlots.slice(0, 3);

  // Group voters by slot
  const votersBySlot: Record<string, any[]> = {};
  if (allVoters) {
    for (const voter of allVoters) {
      for (const slotId of voter.selectedSlots) {
        if (!votersBySlot[slotId]) votersBySlot[slotId] = [];
        votersBySlot[slotId].push(voter);
      }
    }
  }

  const filteredVoters = allVoters?.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-grid-dashed pb-32">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-8 py-4 flex justify-between items-center">
        <Link href="/live-results" className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors font-bold uppercase text-xs tracking-widest">
          <ArrowLeft size={16} />
          Back to Results
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Dashboard Account</span>
            <span className="text-sm font-black text-black">{session.user.name}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-black border-2 border-white shadow-lg overflow-hidden">
            {session.user.image ? (
              <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-8 py-16 space-y-24">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-black text-[60px] md:text-[80px] leading-[0.9] font-black uppercase tracking-tighter">
            Admin<br />Control Panel
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl font-medium">
            Manage voting data, view winning slots, and track individual voter choices in real-time.
          </p>
        </div>

        {/* Podium Section */}
        <section className="space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-black uppercase tracking-tight">Winning Podium</h2>
              <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Real-time leaders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end pt-10">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="order-2 md:order-1 flex flex-col items-center">
                <div className="text-center mb-6 space-y-2">
                  <Medal className="w-10 h-10 text-zinc-400 mx-auto" />
                  <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">2nd Place</p>
                </div>
                <div 
                  className={cn(
                    "w-full bg-white rounded-[40px] p-10 border-2 border-zinc-100 text-center shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden relative group",
                    expandedPodium === 1 && "ring-4 ring-zinc-200"
                  )}
                  onClick={() => setExpandedPodium(expandedPodium === 1 ? null : 1)}
                >
                  <div className="space-y-3 relative z-10">
                    <p className="text-2xl font-black text-black leading-none">{topThree[1].time}</p>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">{topThree[1].day}</p>
                    <p className="text-xs font-bold text-zinc-500 uppercase">{theaterById[topThree[1].venueId]}</p>
                  </div>
                  <div className="pt-8 relative z-10 flex flex-col items-center">
                    <span className="text-5xl font-black text-black italic leading-none">
                      {liveVotes[topThree[1].id] ?? 0}
                    </span>
                    <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-2">Votes Casted</span>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-center gap-2 text-zinc-400 group-hover:text-black transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest">View Voters</span>
                    {expandedPodium === 1 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>

                  {/* Dropdown Content */}
                  <AnimatePresence>
                    {expandedPodium === 1 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 text-left space-y-3 overflow-hidden"
                      >
                        <div className="h-px bg-zinc-100 mb-4" />
                        {votersBySlot[topThree[1].id]?.length > 0 ? (
                          votersBySlot[topThree[1].id].map((v, i) => (
                            <div key={i} className="flex flex-col">
                              <span className="text-sm font-black text-black leading-tight">{v.name}</span>
                              <span className="text-[10px] text-zinc-400 font-medium truncate">{v.email}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-400 italic">No voters found</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="order-1 md:order-2 flex flex-col items-center z-10">
                <div className="text-center mb-8 space-y-2">
                  <Crown className="w-14 h-14 text-black mx-auto animate-bounce-slow" />
                  <p className="text-lg font-black text-black uppercase tracking-[0.3em]">Current King</p>
                </div>
                <div 
                  className={cn(
                    "w-full bg-black rounded-[50px] p-12 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] text-white relative group overflow-hidden border border-white/10 cursor-pointer transition-all duration-500",
                    expandedPodium === 0 && "ring-8 ring-black/10 scale-105"
                  )}
                  onClick={() => setExpandedPodium(expandedPodium === 0 ? null : 0)}
                >
                  <div className="absolute inset-0 bg-linear-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="space-y-3 relative z-10">
                    <p className="text-3xl font-black text-white leading-none">{topThree[0].time}</p>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-[0.3em]">{topThree[0].day}</p>
                    <p className="text-xs font-bold text-white/80 uppercase tracking-widest">{theaterById[topThree[0].venueId]}</p>
                  </div>
                  <div className="pt-10 relative z-10 flex flex-col items-center">
                    <div className="text-white/30 text-[10px] uppercase font-bold tracking-[6px] mb-3">Dominance</div>
                    <span className="text-7xl font-black text-white italic leading-none">
                      {liveVotes[topThree[0].id] ?? 0}
                    </span>
                    <span className="text-white/60 font-medium uppercase text-xs tracking-widest mt-4">Total Energy</span>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-center gap-2 text-white/40 group-hover:text-white transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest">View Voters</span>
                    {expandedPodium === 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>

                  {/* Dropdown Content */}
                  <AnimatePresence>
                    {expandedPodium === 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-8 text-left space-y-4 overflow-hidden"
                      >
                        <div className="h-px bg-white/10 mb-2" />
                        {votersBySlot[topThree[0].id]?.length > 0 ? (
                          votersBySlot[topThree[0].id].map((v, i) => (
                            <div key={i} className="flex flex-col">
                              <span className="text-base font-black text-white leading-tight">{v.name}</span>
                              <span className="text-xs text-white/40 font-medium">{v.email}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-white/30 italic">No voters found</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="order-3 md:order-3 flex flex-col items-center">
                <div className="text-center mb-6 space-y-2">
                  <Medal className="w-10 h-10 text-orange-400 mx-auto" />
                  <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">3rd Place</p>
                </div>
                <div 
                  className={cn(
                    "w-full bg-zinc-50 rounded-[35px] p-8 border-2 border-transparent text-center shadow-xl transition-all duration-500 cursor-pointer overflow-hidden relative group",
                    expandedPodium === 2 && "ring-4 ring-zinc-200 border-zinc-200 bg-white"
                  )}
                  onClick={() => setExpandedPodium(expandedPodium === 2 ? null : 2)}
                >
                  <div className="space-y-2 relative z-10">
                    <p className="text-xl font-black text-zinc-800 leading-none">{topThree[2].time}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{topThree[2].day}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">{theaterById[topThree[2].venueId]}</p>
                  </div>
                  <div className="pt-6 relative z-10 flex flex-col items-center">
                    <span className="text-4xl font-black text-zinc-800 italic leading-none">
                      {liveVotes[topThree[2].id] ?? 0}
                    </span>
                    <span className="text-zinc-400 font-bold uppercase text-[9px] tracking-widest mt-2">Votes</span>
                  </div>

                  <div className="mt-6 pt-5 border-t border-zinc-200 flex items-center justify-center gap-2 text-zinc-400 group-hover:text-black transition-colors">
                    <span className="text-[9px] font-bold uppercase tracking-widest">View Voters</span>
                    {expandedPodium === 2 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>

                  {/* Dropdown Content */}
                  <AnimatePresence>
                    {expandedPodium === 2 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-5 text-left space-y-3 overflow-hidden"
                      >
                        <div className="h-px bg-zinc-200 mb-3" />
                        {votersBySlot[topThree[2].id]?.length > 0 ? (
                          votersBySlot[topThree[2].id].map((v, i) => (
                            <div key={i} className="flex flex-col">
                              <span className="text-sm font-black text-zinc-800 leading-tight">{v.name}</span>
                              <span className="text-[10px] text-zinc-400 font-medium truncate">{v.email}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-400 italic">No voters found</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Voter List Section */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/10">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-black uppercase tracking-tight">Active Voters</h2>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Total: {allVoters?.length ?? 0} Users</p>
              </div>
            </div>
            
            <div className="relative group max-w-md w-full">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-black transition-colors">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 pl-14 pr-6 bg-white rounded-2xl border-2 border-zinc-100 outline-hidden focus:border-black transition-all font-bold placeholder:text-zinc-300 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {isLoadingData ? (
              <div className="col-span-full h-60 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-zinc-200" />
              </div>
            ) : filteredVoters?.length === 0 ? (
              <div className="col-span-full p-20 text-center bg-white rounded-[40px] border-2 border-dashed border-zinc-100">
                <p className="text-zinc-400 font-bold text-xl">No voters found matching your search</p>
              </div>
            ) : (
              filteredVoters?.map((voter) => (
                <motion.div 
                  layout
                  key={voter._id}
                  className="bg-white rounded-[40px] p-8 border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-all duration-500">
                        <UserIcon size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-black uppercase tracking-tight leading-none mb-2">{voter.name}</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ID: {voter.userId.slice(0, 10)}...</p>
                      </div>
                    </div>
                    <div className="px-5 py-2 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100">
                      Confirmed
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Mail size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
                      </div>
                      <span className="text-xs font-bold text-black truncate">{voter.email}</span>
                    </div>
                    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Phone size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Phone</span>
                      </div>
                      <span className="text-xs font-bold text-black">{voter.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Selected Timings</p>
                    <div className="flex flex-wrap gap-2">
                      {voter.selectedSlots.map((slotId: string, idx: number) => {
                        const slot = ALL_SLOTS.find(s => s.id === slotId);
                        if (!slot) return null;
                        return (
                          <div 
                            key={idx}
                            className="px-4 py-2 bg-white border border-zinc-200 rounded-xl flex flex-col items-start gap-1 group-hover:border-black/20 transition-all"
                          >
                            <span className="text-[10px] font-black text-black leading-none">{slot.time}</span>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter leading-none">{slot.day.split(',')[0]} &bull; {theaterById[slot.venueId]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
