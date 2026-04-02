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
    "vr-mall": [],
    eternity: ["03.35 PM", "08.45 PM"],
  },
};

export const DAYS = ["Saturday, April 04", "Sunday, April 05"];

export { images };
