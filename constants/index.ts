import images from "@/constants/images";

export const THEATERS = [
  { name: "Cinepolis: VR Mall", id: "vr-mall" },
  { name: "MovieMax: Eternity", id: "eternity" },
];

export const SHOWTIMES_BY_THEATER: Record<string, Record<string, string[]>> = {
  "Saturday, April 04": {
    "vr-mall": ["11.25 AM", "05.15 PM", "11.05 PM"],
    eternity: ["03.35 PM", "08.45 PM"],
  },
  "Sunday, April 05": {
    "vr-mall": ["11.25 AM", "05.15 PM", "11.05 PM"],
    eternity: ["03.35 PM", "08.45 PM"],
  },
};

export const DAYS = ["Saturday, April 04", "Sunday, April 05"];

/**
 * Generate a unique ID for a movie slot based on venue, time, and day.
 * Format: venue-time-day (slugified)
 */
export const getSlotId = (venueId: string, time: string, day: string) => {
  const slugify = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  
  return `${slugify(venueId)}-${slugify(time)}-${slugify(day)}`;
};

/**
 * Flat list of all available movie slots with their unique IDs and metadata.
 */
export const ALL_SLOTS = DAYS.flatMap((day) =>
  Object.entries(SHOWTIMES_BY_THEATER[day]).flatMap(([venueId, times]) =>
    times.map((time) => ({
      id: getSlotId(venueId, time, day),
      venueId,
      time,
      day,
    }))
  )
);

export { images };

