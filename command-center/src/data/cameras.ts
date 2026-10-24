// GODS EYE // UAE — Camera catalog
// Real public camera sources across the Middle East, UAE first.
// Tier semantics:
//  - "verified"  → exact provider page URL confirmed live (exact cam page)
//  - "listed"    → cam confirmed on provider's public listing page; pageUrl points to that listing

export type CameraTier = "verified" | "listed";

export interface CameraEntry {
  id: string;
  code: string; // HUD display code e.g. "DXB-01"
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  provider: string;
  pageUrl: string;
  tier: CameraTier;
  domain: "URBAN" | "COASTAL" | "DESERT" | "HERITAGE";
  note: string;
}

export const CAMERAS: CameraEntry[] = [
  // ── UNITED ARAB EMIRATES — DUBAI ─────────────────────────────────────────
  {
    id: "dxb-marina-princess",
    code: "DXB-01",
    name: "Dubai Marina — Princess Tower",
    city: "Dubai",
    country: "United Arab Emirates",
    lat: 25.0789,
    lon: 55.1382,
    provider: "SkylineWebcams",
    pageUrl:
      "https://www.skylinewebcams.com/en/webcam/united-arab-emirates/dubai/dubai/dubai-marina.html",
    tier: "verified",
    domain: "URBAN",
    note: "View over Dubai Marina, JLT, Sheikh Zayed Road and Metro line from Princess Tower.",
  },
  {
    id: "dxb-skyline-princess",
    code: "DXB-02",
    name: "Dubai Skyline — Princess Tower",
    city: "Dubai",
    country: "United Arab Emirates",
    lat: 25.0778,
    lon: 55.1367,
    provider: "SkylineWebcams",
    pageUrl:
      "https://www.skylinewebcams.com/en/webcam/united-arab-emirates/dubai/dubai/dubai.html",
    tier: "verified",
    domain: "URBAN",
    note: "Panoramic view of Dubai city from one of the tallest residential towers on earth.",
  },
  {
    id: "dxb-palm-fairmont",
    code: "DXB-03",
    name: "Palm Jumeirah — Fairmont The Palm",
    city: "Dubai",
    country: "United Arab Emirates",
    lat: 25.0845,
    lon: 55.1118,
    provider: "SkylineWebcams",
    pageUrl:
      "https://www.skylinewebcams.com/en/webcam/united-arab-emirates/dubai/dubai/fairmont-the-palm.html",
    tier: "verified",
    domain: "COASTAL",
    note: "Beach view across Palm Jumeirah toward the Dubai skyline.",
  },
  {
    id: "dxb-deira",
    code: "DXB-04",
    name: "Deira District",
    city: "Dubai",
    country: "United Arab Emirates",
    lat: 25.2697,
    lon: 55.3095,
    provider: "WorldCam",
    pageUrl: "https://worldcam.eu/webcams/asia/uae",
    tier: "listed",
    domain: "URBAN",
    note: "Historic trading district on Dubai Creek — the old city core.",
  },
  // ── UNITED ARAB EMIRATES — ABU DHABI ─────────────────────────────────────
  {
    id: "auh-alraha",
    code: "AUH-01",
    name: "Al Raha Beach",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    lat: 24.4403,
    lon: 54.6003,
    provider: "WorldCam",
    pageUrl: "https://worldcam.eu/webcams/asia/uae",
    tier: "listed",
    domain: "COASTAL",
    note: "Al Raha Beach waterfront on the western gateway to Abu Dhabi.",
  },
  {
    id: "auh-reem",
    code: "AUH-02",
    name: "Al Reem Island",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    lat: 24.5104,
    lon: 54.4302,
    provider: "WorldCam",
    pageUrl: "https://worldcam.eu/webcams/asia/uae",
    tier: "listed",
    domain: "URBAN",
    note: "Rapidly rising island district facing the Abu Dhabi corniche.",
  },
  {
    id: "auh-masdar",
    code: "AUH-03",
    name: "Masdar City",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    lat: 24.4267,
    lon: 54.6156,
    provider: "WorldCam",
    pageUrl: "https://worldcam.eu/webcams/asia/uae",
    tier: "listed",
    domain: "URBAN",
    note: "The world-famous sustainable smart-city prototype.",
  },
  {
    id: "auh-yasbay",
    code: "AUH-04",
    name: "Yas Bay",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    lat: 24.467,
    lon: 54.605,
    provider: "WorldCam",
    pageUrl: "https://worldcam.eu/webcams/asia/uae",
    tier: "listed",
    domain: "COASTAL",
    note: "Yas Island waterfront — entertainment and marina quarter.",
  },
  // ── UNITED ARAB EMIRATES — NORTHERN EMIRATES ─────────────────────────────
  {
    id: "shj-aldhaid",
    code: "SHJ-01",
    name: "Al Dhaid — Sharjah Safari Reserve",
    city: "Sharjah",
    country: "United Arab Emirates",
    lat: 25.2667,
    lon: 55.8833,
    provider: "WorldCam",
    pageUrl: "https://worldcam.eu/webcams/asia/uae",
    tier: "listed",
    domain: "DESERT",
    note: "Desert interior of the Emirate of Sharjah — wildlife reserve.",
  },
  {
    id: "fuj-dibba",
    code: "FUJ-01",
    name: "Dibba — Sandy Beach",
    city: "Fujairah",
    country: "United Arab Emirates",
    lat: 25.6006,
    lon: 56.3498,
    provider: "WorldCam",
    pageUrl: "https://worldcam.eu/webcams/asia/uae",
    tier: "listed",
    domain: "COASTAL",
    note: "Gulf of Oman coastline at the foot of the Hajar Mountains.",
  },
  {
    id: "uaq-kitebeach",
    code: "UAQ-01",
    name: "Kite Beach Center",
    city: "Umm Al Quwain",
    country: "United Arab Emirates",
    lat: 25.5602,
    lon: 55.5503,
    provider: "WorldCam",
    pageUrl: "https://worldcam.eu/webcams/asia/uae",
    tier: "listed",
    domain: "COASTAL",
    note: "Kitesurf lagoon on the northern coast of the UAE.",
  },
  // ── MIDDLE EAST — REGIONAL NODES ─────────────────────────────────────────
  {
    id: "cai-giza-cheops",
    code: "CAI-01",
    name: "Giza — Great Pyramid & Khafre",
    city: "Cairo",
    country: "Egypt",
    lat: 29.9773,
    lon: 31.1325,
    provider: "SkylineWebcams",
    pageUrl:
      "https://www.skylinewebcams.com/en/webcam/egypt/cairo/cairo/pyramid-of-cheops-and-khafre.html",
    tier: "verified",
    domain: "HERITAGE",
    note: "Panoramic view of the Great Pyramid of Giza and Khafre; Menkaure in the background.",
  },
  {
    id: "cai-giza-sphinx",
    code: "CAI-02",
    name: "Giza — Pyramids & Sphinx",
    city: "Cairo",
    country: "Egypt",
    lat: 29.975,
    lon: 31.135,
    provider: "SkylineWebcams",
    pageUrl:
      "https://www.skylinewebcams.com/en/webcam/egypt/cairo/cairo/pyramids-giza-sphinx.html",
    tier: "verified",
    domain: "HERITAGE",
    note: "The Giza necropolis — Cheops, Chephren, Mycerinus and the Sphinx plateau.",
  },
  {
    id: "ist-goldenhorn",
    code: "IST-01",
    name: "Istanbul — Golden Horn",
    city: "Istanbul",
    country: "Türkiye",
    lat: 41.0201,
    lon: 28.9703,
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/turkey.html",
    tier: "listed",
    domain: "URBAN",
    note: "The Golden Horn estuary — historic waterway between old and new Istanbul.",
  },
  {
    id: "jrs-oldcity",
    code: "JRS-01",
    name: "Jerusalem — Old City Overview",
    city: "Jerusalem",
    country: "Israel / Palestine",
    lat: 31.7767,
    lon: 35.2345,
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/israel.html",
    tier: "listed",
    domain: "HERITAGE",
    note: "Live view over the Old City of Jerusalem.",
  },
  {
    id: "ptra-valley",
    code: "PTRA-01",
    name: "Petra — Rose City Approach",
    city: "Ma'an Governorate",
    country: "Jordan",
    lat: 30.3285,
    lon: 35.4444,
    provider: "SkylineWebcams",
    pageUrl: "https://www.skylinewebcams.com/en/webcam/jordan.html",
    tier: "listed",
    domain: "HERITAGE",
    note: "The Nabataean rose-red city half as old as time.",
  },
];

export const UAE_CAMERAS = CAMERAS.filter(
  (c) => c.country === "United Arab Emirates",
);
export const ME_CAMERAS = CAMERAS.filter(
  (c) => c.country !== "United Arab Emirates",
);
