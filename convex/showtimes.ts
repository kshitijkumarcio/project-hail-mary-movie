// FORCE REFRESH TO DETECT initializeAllSlots
import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all showtime vote-count documents for the live-results page.
 */
export const getAllSlotCounts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("showtimeVoteCounts").order("asc").take(100);
  },
});

/**
 * Get the vote count for a specific slot by its ID.
 */
export const getSlotCount = query({
  args: { slotId: v.string() },
  handler: async (ctx, { slotId }) => {
    return await ctx.db
      .query("showtimeVoteCounts")
      .withIndex("by_slotId", (q) => q.eq("slotId", slotId))
      .unique();
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL MUTATIONS (called by voters.ts)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strict increment: if the slotId exists, add 1.
 * Otherwise, log an error (we never create new slots dynamically).
 */
export const incrementSlotCount = internalMutation({
  args: { slotId: v.string() },
  handler: async (ctx, { slotId }) => {
    const existing = await ctx.db
      .query("showtimeVoteCounts")
      .withIndex("by_slotId", (q) => q.eq("slotId", slotId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { voteCount: existing.voteCount + 1 });
    } else {
      console.error(`Attempted to increment non-existent slotId: ${slotId}`);
    }
  },
});

/**
 * Decrement a slot's counter. Floor at 0.
 */
export const decrementSlotCount = internalMutation({
  args: { slotId: v.string() },
  handler: async (ctx, { slotId }) => {
    const existing = await ctx.db
      .query("showtimeVoteCounts")
      .withIndex("by_slotId", (q) => q.eq("slotId", slotId))
      .unique();

    if (!existing) return;

    const next = Math.max(0, existing.voteCount - 1);
    await ctx.db.patch(existing._id, { voteCount: next });
  },
});

/**
 * Initialization mutation to seed the 10 slots with 0 votes.
 * Can be run manually: bunx convex run showtimes:initializeAllSlots
 */
export const initializeAllSlots = mutation({
  args: {},
  handler: async (ctx) => {
    const slots = [
      // Saturday
      { id: "vr-mall-11-25-am-saturday-april-04", venueId: "vr-mall", time: "11.25 AM", date: "Saturday, April 04" },
      { id: "vr-mall-05-15-pm-saturday-april-04", venueId: "vr-mall", time: "05.15 PM", date: "Saturday, April 04" },
      { id: "vr-mall-11-05-pm-saturday-april-04", venueId: "vr-mall", time: "11.05 PM", date: "Saturday, April 04" },
      { id: "eternity-03-35-pm-saturday-april-04", venueId: "eternity", time: "03.35 PM", date: "Saturday, April 04" },
      { id: "eternity-08-45-pm-saturday-april-04", venueId: "eternity", time: "08.45 PM", date: "Saturday, April 04" },
      // Sunday
      { id: "vr-mall-11-25-am-sunday-april-05", venueId: "vr-mall", time: "11.25 AM", date: "Sunday, April 05" },
      { id: "vr-mall-05-15-pm-sunday-april-05", venueId: "vr-mall", time: "05.15 PM", date: "Sunday, April 05" },
      { id: "vr-mall-11-05-pm-sunday-april-05", venueId: "vr-mall", time: "11.05 PM", date: "Sunday, April 05" },
      { id: "eternity-03-35-pm-sunday-april-05", venueId: "eternity", time: "03.35 PM", date: "Sunday, April 05" },
      { id: "eternity-08-45-pm-sunday-april-05", venueId: "eternity", time: "08.45 PM", date: "Sunday, April 05" },
    ];

    for (const slot of slots) {
      const existing = await ctx.db
        .query("showtimeVoteCounts")
        .withIndex("by_slotId", (q) => q.eq("slotId", slot.id))
        .unique();

      if (!existing) {
        await ctx.db.insert("showtimeVoteCounts", {
          slotId: slot.id,
          date: slot.date,
          theaterId: slot.venueId,
          time: slot.time,
          voteCount: 0,
        });
      }
    }
    return { count: slots.length };
  },
});
