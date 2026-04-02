import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the current authenticated user's voter record.
 * Returns null if either not logged in or hasn't voted yet.
 */
export const getMyVoterRecord = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("voters")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
  },
});

/**
 * Check whether the currently authenticated user has already voted.
 */
export const hasVoted = query({
  args: {},
  handler: async (ctx): Promise<boolean> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const record = await ctx.db
      .query("voters")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    return record?.voted ?? false;
  },
});

/**
 * Look up a voter by email — used server-side after OTP verification.
 */
export const getVoterByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("voters")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Called after successful OTP verification for a *new* voter.
 * Creates the voter document and increments each selected slot's vote count.
 */
export const castVote = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    selectedSlots: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Guard: prevent duplicate votes
    const existing = await ctx.db
      .query("voters")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing) throw new Error("User has already voted");

    await ctx.db.insert("voters", {
      userId: identity.subject,
      name: args.name,
      phone: args.phone,
      email: args.email,
      selectedSlots: args.selectedSlots,
      voted: true,
      updatedAt: Date.now(),
    });

    // Increment vote counts for each chosen slot
    for (const slotKey of args.selectedSlots) {
      await ctx.runMutation(internal.showtimes.incrementSlotCount, { slotKey });
    }
  },
});

/**
 * Update a voter's showtime selections.
 * Adjusts the running counters for added/removed slots.
 */
export const updateSelectedSlots = mutation({
  args: {
    newSlots: v.array(v.string()),
  },
  handler: async (ctx, { newSlots }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const record = await ctx.db
      .query("voters")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!record) throw new Error("Voter record not found");

    const oldSlots = new Set(record.selectedSlots);
    const nextSlots = new Set(newSlots);

    // Slots that were removed
    for (const slot of oldSlots) {
      if (!nextSlots.has(slot)) {
        await ctx.runMutation(internal.showtimes.decrementSlotCount, { slotKey: slot });
      }
    }

    // Slots that were added
    for (const slot of nextSlots) {
      if (!oldSlots.has(slot)) {
        await ctx.runMutation(internal.showtimes.incrementSlotCount, { slotKey: slot });
      }
    }

    await ctx.db.patch(record._id, {
      selectedSlots: newSlots,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Update a voter's personal profile (name, phone).
 * Does not change slot selections — use updateSelectedSlots for that.
 */
export const updateProfile = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, { name, phone }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const record = await ctx.db
      .query("voters")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!record) throw new Error("Voter record not found");

    await ctx.db.patch(record._id, { name, phone, updatedAt: Date.now() });
  },
});
