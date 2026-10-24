// GODS EYE // UAE — Geographic constants: cities, airfields, regions, bounds

export interface CityNode {
  name: string;
  country: string;
  lat: number;
  lon: number;
  tzOffset: number; // hours from UTC
}

export const CITY_NODES: CityNode[] = [
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708, tzOffset: 4 },
  { name: "Abu Dhabi", country: "UAE", lat: 24.4539, lon: 54.3773, tzOffset: 4 },
  { name: "Sharjah", country: "UAE", lat: 25.3463, lon: 55.4209, tzOffset: 4 },
  { name: "Doha", country: "Qatar", lat: 25.2854, lon: 51.531, tzOffset: 3 },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753, tzOffset: 3 },
  { name: "Muscat", country: "Oman", lat: 23.588, lon: 58.3829, tzOffset: 4 },
  { name: "Kuwait City", country: "Kuwait", lat: 29.3759, lon: 47.9774, tzOffset: 3 },
  { name: "Manama", country: "Bahrain", lat: 26.2285, lon: 50.586, tzOffset: 3 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, tzOffset: 3 },
  { name: "Istanbul", country: "Türkiye", lat: 41.0082, lon: 28.9784, tzOffset: 3 },
];

export interface Airfield {
  iata: string;
  name: string;
  lat: number;
  lon: number;
}

export const AIRFIELDS: Airfield[] = [
  { iata: "DXB", name: "Dubai Intl", lat: 25.2532, lon: 55.3657 },
  { iata: "DWC", name: "Al Maktoum Intl", lat: 24.8968, lon: 55.1614 },
  { iata: "AUH", name: "Zayed Intl", lat: 24.433, lon: 54.6511 },
  { iata: "SHJ", name: "Sharjah Intl", lat: 25.3286, lon: 55.5172 },
  { iata: "AAN", name: "Al Ain Intl", lat: 24.2617, lon: 55.6092 },
  { iata: "FJR", name: "Fujairah Intl", lat: 25.1122, lon: 56.326 },
  { iata: "RKT", name: "Ras Al Khaimah Intl", lat: 25.6133, lon: 55.9389 },
  { iata: "OMA", name: "Umm Al Quwain", lat: 25.4833, lon: 55.55 },
  { iata: "DOH", name: "Hamad Intl", lat: 25.2731, lon: 51.6081 },
  { iata: "BAH", name: "Bahrain Intl", lat: 26.2708, lon: 50.6336 },
  { iata: "RUH", name: "King Khalid Intl", lat: 24.9576, lon: 46.6988 },
  { iata: "MCT", name: "Muscat Intl", lat: 23.5933, lon: 58.2844 },
  { iata: "KWI", name: "Kuwait Intl", lat: 29.2266, lon: 47.9689 },
  { iata: "CAI", name: "Cairo Intl", lat: 30.1219, lon: 31.4056 },
];

// Region focus presets: [west, south, east, north] bounds + map center/zoom
export interface RegionFocus {
  id: string;
  label: string;
  center: [number, number];
  zoom: number;
  pitch: number;
}

export const REGIONS: RegionFocus[] = [
  { id: "gulf", label: "ARABIAN GULF", center: [52.5, 25.5], zoom: 5.6, pitch: 42 },
  { id: "uae", label: "UAE GRID", center: [54.6, 24.8], zoom: 7.6, pitch: 50 },
  { id: "dxb", label: "DUBAI", center: [55.18, 25.14], zoom: 10.8, pitch: 58 },
  { id: "auh", label: "ABU DHABI", center: [54.55, 24.51], zoom: 10.2, pitch: 58 },
  { id: "me", label: "MIDDLE EAST", center: [43.5, 29.0], zoom: 4.6, pitch: 35 },
];

// Middle East bounding box used to filter regional feeds
export const ME_BBOX = { minLat: 12, maxLat: 42, minLon: 25, maxLon: 64 };

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function bearingDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
}

export function nearestAirfield(
  lat: number,
  lon: number,
): { field: Airfield; distanceKm: number } | null {
  let best: Airfield | null = null;
  let bestD = Infinity;
  for (const f of AIRFIELDS) {
    const d = haversineKm(lat, lon, f.lat, f.lon);
    if (d < bestD) {
      bestD = d;
      best = f;
    }
  }
  return best ? { field: best, distanceKm: bestD } : null;
}
