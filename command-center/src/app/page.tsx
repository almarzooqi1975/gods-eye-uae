"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BootSequence from "@/components/gods-eye/BootSequence";
import TopBar from "@/components/gods-eye/TopBar";
import LayerRail, { type LayerState } from "@/components/gods-eye/LayerRail";
import MapView from "@/components/gods-eye/MapView";
import CameraPanel from "@/components/gods-eye/CameraPanel";
import AircraftPanel from "@/components/gods-eye/AircraftPanel";
import EnvironmentPanel from "@/components/gods-eye/EnvironmentPanel";
import AnalystChat, { type LiveContext } from "@/components/gods-eye/AnalystChat";
import NewsTicker from "@/components/gods-eye/NewsTicker";
import { CAMERAS, UAE_CAMERAS, type CameraEntry } from "@/data/cameras";
import { CITY_NODES, REGIONS } from "@/data/geo";
import type { AircraftDot } from "@/app/api/aircraft/route";
import type { QuakeDot } from "@/app/api/quakes/route";
import type { CityWeather } from "@/app/api/weather/route";
import type { IssState } from "@/app/api/iss/route";
import type { RadarFrame } from "@/app/api/radar/route";
import type { NewsItem } from "@/app/api/news/route";
import type { CameraHealth } from "@/app/api/cameras/health/route";

type PanelTab = "cam" | "air" | "env" | "news" | "ai";

const TABS: { id: PanelTab; label: string }[] = [
  { id: "cam", label: "CAM" },
  { id: "air", label: "AIR" },
  { id: "env", label: "ENV" },
  { id: "news", label: "WIRE" },
  { id: "ai", label: "AI" },
];

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelTab, setPanelTab] = useState<PanelTab>("cam");
  const [layers, setLayers] = useState<LayerState>({
    cameras: true,
    aircraft: true,
    quakes: true,
    iss: true,
    radar: false,
    satellite: false,
    cities: true,
  });
  const [activeRegion, setActiveRegion] = useState("gulf");
  const [regionFocus, setRegionFocus] = useState({
    center: REGIONS[0].center,
    zoom: REGIONS[0].zoom,
    pitch: REGIONS[0].pitch,
    nonce: 0,
  });
  const [cameraFocus, setCameraFocus] = useState({
    center: [55.14, 25.08] as [number, number],
    zoom: 11.6,
    pitch: 55,
    nonce: 0,
  });

  const [watchMode, setWatchMode] = useState(false);
  const [selectedCam, setSelectedCam] = useState<CameraEntry | null>(null);
  const [selectedAircraft, setSelectedAircraft] = useState<AircraftDot | null>(null);

  // live data
  const [aircraft, setAircraft] = useState<AircraftDot[]>([]);
  const [acSource, setAcSource] = useState("—");
  const [acUpdated, setAcUpdated] = useState<number | null>(null);
  const [quakes, setQuakes] = useState<QuakeDot[]>([]);
  const [quakesOk, setQuakesOk] = useState(false);
  const [cities, setCities] = useState<CityWeather[]>([]);
  const [iss, setIss] = useState<IssState | null>(null);
  const [radar, setRadar] = useState<RadarFrame | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [health, setHealth] = useState<CameraHealth[]>([]);

  // ── polling: aircraft (8s) ──────────────────────────────────────────────
  useEffect(() => {
    let stop = false;
    const poll = async () => {
      try {
        const r = await fetch("/api/aircraft?lat=24.8&lon=54.8&dist=160");
        const j = (await r.json()) as { aircraft?: AircraftDot[]; source?: string };
        if (stop) return;
        setAircraft(j.aircraft ?? []);
        setAcSource(j.source ?? "—");
        setAcUpdated(Date.now());
      } catch {
        /* keep last */
      }
    };
    poll();
    const iv = setInterval(poll, 8000);
    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, []);

  // ── polling: ISS (5s) ───────────────────────────────────────────────────
  useEffect(() => {
    let stop = false;
    const poll = async () => {
      try {
        const r = await fetch("/api/iss");
        const j = (await r.json()) as { iss?: IssState | null };
        if (!stop) setIss(j.iss ?? null);
      } catch {
        /* keep last */
      }
    };
    poll();
    const iv = setInterval(poll, 5000);
    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, []);

  // ── polling: quakes (3min) ──────────────────────────────────────────────
  useEffect(() => {
    let stop = false;
    const poll = async () => {
      try {
        const r = await fetch("/api/quakes");
        const j = (await r.json()) as { quakes?: QuakeDot[]; source?: string };
        if (stop) return;
        setQuakes(j.quakes ?? []);
        setQuakesOk(j.source === "USGS" || j.source === "cache");
      } catch {
        /* keep last */
      }
    };
    poll();
    const iv = setInterval(poll, 180000);
    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, []);

  // ── weather + news + radar + cam health (slow / on boot) ────────────────
  useEffect(() => {
    if (!booted) return;
    let stop = false;
    fetch("/api/weather")
      .then((r) => r.json())
      .then((j: { cities?: CityWeather[] }) => !stop && setCities(j.cities ?? []))
      .catch(() => undefined);
    fetch("/api/news")
      .then((r) => r.json())
      .then((j: { items?: NewsItem[] }) => !stop && setNews(j.items ?? []))
      .catch(() => undefined);
    fetch("/api/radar")
      .then((r) => r.json())
      .then((j: { radar?: RadarFrame | null }) => !stop && setRadar(j.radar ?? null))
      .catch(() => undefined);
    fetch("/api/cameras/health")
      .then((r) => r.json())
      .then((j: { health?: CameraHealth[] }) => !stop && setHealth(j.health ?? []))
      .catch(() => undefined);
    const iv = setInterval(() => {
      fetch("/api/news")
        .then((r) => r.json())
        .then((j: { items?: NewsItem[] }) => !stop && setNews(j.items ?? []))
        .catch(() => undefined);
    }, 300000);
    return () => {
      stop = true;
      clearInterval(iv);
    };
  }, [booted]);

  // ── feed health chips ───────────────────────────────────────────────────
  const feedHealth: Record<string, string> = useMemo(
    () => ({
      "ADS-B":
        acSource === "adsb.fi" || acSource === "adsb.lol" || acSource === "cache"
          ? "OK"
          : "DOWN",
      USGS: quakesOk ? "OK" : "…",
      WX: cities.length > 0 ? "OK" : "…",
      WIRE: news.length > 0 ? "OK" : "…",
      ISS: iss ? "OK" : "…",
    }),
    [acSource, quakesOk, cities.length, news.length, iss],
  );

  // ── watch mode ──────────────────────────────────────────────────────────
  const watchIdx = useRef(0);
  useEffect(() => {
    if (!watchMode) return;
    const hop = () => {
      const cam = UAE_CAMERAS[watchIdx.current % UAE_CAMERAS.length];
      watchIdx.current += 1;
      setSelectedCam(cam);
      setPanelTab("cam");
      setCameraFocus({
        center: [cam.lon, cam.lat],
        zoom: 11.6,
        pitch: 55,
        nonce: Date.now(),
      });
    };
    hop();
    const iv = setInterval(hop, 12000);
    return () => clearInterval(iv);
  }, [watchMode]);

  // ── handlers ────────────────────────────────────────────────────────────
  const handleToggle = useCallback((key: keyof LayerState) => {
    setLayers((l) => ({ ...l, [key]: !l[key] }));
  }, []);

  const handleFocusRegion = useCallback((id: string) => {
    const r = REGIONS.find((x) => x.id === id);
    if (!r) return;
    setActiveRegion(id);
    setRegionFocus({ center: r.center, zoom: r.zoom, pitch: r.pitch, nonce: Date.now() });
  }, []);

  const handleSelectCamera = useCallback((cam: CameraEntry) => {
    setSelectedCam(cam);
    setPanelTab("cam");
    setPanelOpen(true);
    setCameraFocus({ center: [cam.lon, cam.lat], zoom: 11.6, pitch: 55, nonce: Date.now() });
  }, []);

  const handleSelectAircraft = useCallback((a: AircraftDot) => {
    setSelectedAircraft(a);
    setPanelTab("air");
    setPanelOpen(true);
  }, []);

  const healthMap = useMemo(() => {
    const m: Record<string, CameraHealth> = {};
    for (const h of health) m[h.id] = h;
    return m;
  }, [health]);

  const camsOnline = health.filter((h) => h.status === "OK").length;

  const analystContext: LiveContext = useMemo(
    () => ({
      camerasOnline: camsOnline,
      camerasTotal: CAMERAS.length,
      aircraftTracked: aircraft.length,
      notableAircraft: aircraft
        .filter((a) => !a.onGround)
        .slice(0, 12)
        .map((a) => ({
          callsign: a.callsign,
          type: a.type,
          altFt: a.altFt,
          gsKt: a.gsKt,
        })),
      quakes24h: quakes.slice(0, 8).map((q) => ({ mag: q.mag, place: q.place })),
      weather: cities.map((c) => ({ name: c.name, tempC: c.tempC, windKph: c.windKph })),
      iss: iss ? { lat: iss.lat, lon: iss.lon, visibility: iss.visibility } : null,
      newsHeadlines: news.slice(0, 10).map((n) => n.title),
    }),
    [camsOnline, aircraft, quakes, cities, iss, news],
  );

  if (!booted) {
    return (
      <main className="ge-root h-screen w-screen overflow-hidden">
        <BootSequence onDone={() => setBooted(true)} />
      </main>
    );
  }

  return (
    <main className="ge-root flex h-screen w-screen flex-col overflow-hidden font-mono">
      <TopBar
        aircraftCount={aircraft.filter((a) => !a.onGround).length}
        camCount={CAMERAS.length}
        quakeCount={quakes.length}
        feedHealth={feedHealth}
        onOpenRail={() => setRailOpen(true)}
      />

      <div className="relative flex min-h-0 flex-1">
        {/* Layer rail — slide-over on mobile, static on desktop */}
        <div className="hidden md:block">
          <LayerRail
            layers={layers}
            onToggle={handleToggle}
            regions={REGIONS}
            activeRegion={activeRegion}
            onFocusRegion={handleFocusRegion}
            watchMode={watchMode}
            onToggleWatch={() => setWatchMode((w) => !w)}
            counts={{
              aircraft: aircraft.filter((a) => !a.onGround).length,
              quakes: quakes.length,
              cams: CAMERAS.length,
            }}
            open
            onClose={() => setRailOpen(false)}
          />
        </div>
        <div className="md:hidden">
          <LayerRail
            layers={layers}
            onToggle={handleToggle}
            regions={REGIONS}
            activeRegion={activeRegion}
            onFocusRegion={(id) => {
              handleFocusRegion(id);
              setRailOpen(false);
            }}
            watchMode={watchMode}
            onToggleWatch={() => setWatchMode((w) => !w)}
            counts={{
              aircraft: aircraft.filter((a) => !a.onGround).length,
              quakes: quakes.length,
              cams: CAMERAS.length,
            }}
            open={railOpen}
            onClose={() => setRailOpen(false)}
          />
        </div>

        {/* Map + context panel */}
        <div className="relative min-w-0 flex-1">
          <MapView
            layers={layers}
            cameras={CAMERAS}
            selectedCameraId={selectedCam?.id ?? null}
            onSelectCamera={handleSelectCamera}
            aircraft={aircraft}
            onSelectAircraft={handleSelectAircraft}
            quakes={quakes}
            iss={iss}
            radar={radar}
            radarVisible={layers.radar}
            satelliteVisible={layers.satellite}
            regionFocus={regionFocus}
            cameraFocus={cameraFocus}
            cityNodes={CITY_NODES}
          />

          {/* Context panel — desktop side panel / mobile bottom sheet */}
          <div
            className={`absolute z-30 flex flex-col hud-panel ${
              panelOpen ? "" : "hidden"
            } inset-x-0 bottom-0 h-[58vh] rounded-t-md border-b-0 lg:inset-y-0 lg:left-auto lg:right-3 lg:top-3 lg:bottom-3 lg:h-auto lg:w-[370px] lg:rounded-md lg:border-b`}
          >
            <div className="flex items-center gap-1 border-b border-amber-400/15 px-2 py-1.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPanelTab(t.id)}
                  className={`px-2.5 py-1.5 font-mono text-[10px] tracking-[0.18em] transition-colors ${
                    panelTab === t.id
                      ? "border-b-2 border-amber-400 text-amber-200 hud-glow"
                      : "text-zinc-500 hover:text-amber-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
              <button
                onClick={() => setPanelOpen(false)}
                className="ml-auto px-2 py-1 font-mono text-[10px] text-zinc-500 hover:text-amber-200"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>
            <div className="min-h-0 flex-1">
              {panelTab === "cam" && (
                <CameraPanel
                  cameras={CAMERAS}
                  selected={selectedCam}
                  health={healthMap}
                  onSelect={handleSelectCamera}
                  watchMode={watchMode}
                />
              )}
              {panelTab === "air" && (
                <AircraftPanel
                  aircraft={aircraft}
                  selected={selectedAircraft}
                  onSelect={setSelectedAircraft}
                  lastUpdate={acUpdated}
                  source={acSource}
                />
              )}
              {panelTab === "env" && (
                <EnvironmentPanel cities={cities} quakes={quakes} iss={iss} />
              )}
              {panelTab === "news" && (
                <div className="h-full overflow-y-auto ge-scrollbar p-3">
                  <div className="mb-2 font-mono text-[10px] tracking-[0.25em] text-amber-200/60">
                    GDELT WIRE — GULF & MIDDLE EAST
                  </div>
                  {news.length === 0 ? (
                    <div className="hud-inset p-3 font-mono text-[10px] text-zinc-600">
                      SYNCING NEWS WIRE… (GDELT RATE LIMITS TO 1 REQ/5S — RETRY SHORTLY)
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {news.map((n, i) => (
                        <a
                          key={i}
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block border border-amber-400/10 bg-black/30 p-2.5 transition-colors hover:border-amber-400/40"
                        >
                          <div className="font-mono text-[10.5px] leading-4 text-amber-100/85">
                            {n.title}
                          </div>
                          <div className="mt-1 font-mono text-[8.5px] tracking-[0.14em] text-zinc-600">
                            {n.domain.toUpperCase()} · {n.seendate.slice(0, 12)}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {panelTab === "ai" && (
                <AnalystChat context={analystContext} selectedCam={selectedCam} />
              )}
            </div>
          </div>

          {!panelOpen && (
            <button
              onClick={() => setPanelOpen(true)}
              className="absolute right-3 top-3 z-30 border border-amber-400/40 bg-black/70 px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-amber-200"
            >
              ◧ PANEL
            </button>
          )}
        </div>
      </div>

      <NewsTicker items={news} />
    </main>
  );
}
