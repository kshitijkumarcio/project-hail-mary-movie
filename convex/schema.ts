import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({

 
  voters: defineTable({
    /** Better-Auth user id (references `user._id` in authTables) */
    userId: v.string(),

    /** Voter's display name */
    name: v.string(),

    /** Phone number (stored with +91 prefix, e.g. "+919876543210") */
    phone: v.string(),

    /** Email address — same as Better-Auth user email */
    email: v.string(),

    /**
     * The showtime slots the voter chose.
     * Each element encodes a unique slot as "<date>|<theaterId>|<time>",
     * e.g. "Saturday, April 04|vr-mall|11.25 AM".
     *
     * Kept as a bounded array (max ~10 slots) — safe within 1 MB doc size.
     */
    selectedSlots: v.array(v.string()),

    /** True once form + OTP flow completes */
    voted: v.boolean(),

    /** ISO timestamp of the last update */
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_voted", ["voted"]),

  
  // ── Denormalized vote counts (one document per showtime slot) ───────────────
  /**
   * Maintained by mutations whenever a voter adds/removes/changes a slot.
   * Using separate documents avoids contention on a single counter document
   * and lets us update only the affected slots atomically.
   *
   * Key format: "<date>|<theaterId>|<time>"
   *   e.g.  "Saturday, April 04|vr-mall|11.25 AM"
   */
  showtimeVoteCounts: defineTable({
    /** Unique ID made from venue+time+day slug */
    slotId: v.string(),

    /** Human-readable parts for display — avoids re-parsing slotId */
    date: v.string(),
    theaterId: v.string(),
    time: v.string(),

    /** Running total of voters who selected this slot */
    voteCount: v.number(),
  }).index("by_slotId", ["slotId"]),
});
