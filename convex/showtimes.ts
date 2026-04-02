import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS — slot key codec
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse a composite slotKey back into its parts.
 * Format: "<date>|<theaterId>|<time>"
 */
function parseSlotKey(slotKey: string): {
  date: string;
  theaterId: string;
  time: string;
} {
  const [date, theaterId, time] = slotKey.split("|");
  return { date, theaterId, time };
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all showtime vote-count documents for the live-results page.
 * Bounded by `.take(100)` — well above the maximum slots for this event.
 */
export const getAllSlotCounts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("showtimeVoteCounts").order("asc").take(100);
  },
});

/**
 * Get the vote count for a specific slot.
 */
export const getSlotCount = query({
  args: { slotKey: v.string() },
  handler: async (ctx, { slotKey }) => {
    return await ctx.db
      .query("showtimeVoteCounts")
      .withIndex("by_slotKey", (q) => q.eq("slotKey", slotKey))
      .unique();
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL MUTATIONS (called by voters.ts)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Upsert-increment: if a counter document for `slotKey` exists, add 1
 * to its voteCount. Otherwise, create it with voteCount = 1.
 */
export const incrementSlotCount = internalMutation({
  args: { slotKey: v.string() },
  handler: async (ctx, { slotKey }) => {
    const existing = await ctx.db
      .query("showtimeVoteCounts")
      .withIndex("by_slotKey", (q) => q.eq("slotKey", slotKey))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { voteCount: existing.voteCount + 1 });
    } else {
      const { date, theaterId, time } = parseSlotKey(slotKey);
      await ctx.db.insert("showtimeVoteCounts", {
        slotKey,
        date,
        theaterId,
        time,
        voteCount: 1,
      });
    }
  },
});

/**
 * Decrement a slot's counter.  Floor at 0 — never go negative.
 */
export const decrementSlotCount = internalMutation({
  args: { slotKey: v.string() },
  handler: async (ctx, { slotKey }) => {
    const existing = await ctx.db
      .query("showtimeVoteCounts")
      .withIndex("by_slotKey", (q) => q.eq("slotKey", slotKey))
      .unique();

    if (!existing) return; // nothing to decrement

    const next = Math.max(0, existing.voteCount - 1);
    await ctx.db.patch(existing._id, { voteCount: next });
  },
});
