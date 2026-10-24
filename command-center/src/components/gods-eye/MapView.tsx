"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MaplibreMap,
  Marker,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
  type GeoJSONSource,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { CameraEntry } from "@/data/cameras";
import type { LayerState } from "./LayerRail";
import type { AircraftDot } from "@/app/api/aircraft/route";
import type { QuakeDot } from "@/app/api/quakes/route";
import type { IssState } from "@/app/api/iss/route";
import type { RadarFrame } from "@/app/api/radar/route";

interface FocusRequest {
  center: [number, number];
  zoom: number;
  pitch: number;
  nonce: number;
}

interface Props {
  layers: LayerState;
  cameras: CameraEntry[];
  selectedCameraId: string | null;
  onSelectCamera: (cam: CameraEntry) => void;
  aircraft: AircraftDot[];
  onSelectAircraft: (a: AircraftDot) => void;
  quakes: QuakeDot[];
  iss: IssState | null;
  radar: RadarFrame | null;
  radarVisible: boolean;
  satelliteVisible: boolean;
  regionFocus: FocusRequest;
  cameraFocus: FocusRequest;
  cityNodes: { name: string; country: string; lat: number; lon: number }[];
}

function gibsDate(): string {
  const d = new Date(Date.now() - 26 * 3600 * 1000); // MODIS Terra lag
  return d.toISOString().slice(0, 10);
}

function makeAircraftIcon(color: [number, number, number, number]): ImageData | null {
  if (typeof document === "undefined") return null;
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`;
  ctx.strokeStyle = "rgba(0,0,0,0.9)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // nose at top (north), swept wings, tail
  ctx.moveTo(16, 3);
  ctx.lineTo(20, 13);
  ctx.lineTo(29, 24);
  ctx.lineTo(29, 27);
  ctx.lineTo(19, 23);
  ctx.lineTo(19, 27);
  ctx.lineTo(23, 30);
  ctx.lineTo(23, 31.5);
  ctx.lineTo(16, 29.5);
  ctx.lineTo(9, 31.5);
  ctx.lineTo(9, 30);
  ctx.lineTo(13, 27);
  ctx.lineTo(13, 23);
  ctx.lineTo(3, 27);
  ctx.lineTo(3, 24);
  ctx.lineTo(12, 13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  return ctx.getImageData(0, 0, size, size);
}

function issFootprintPolygon(lat: number, lon: number, radiusKm: number): GeoJSON.Polygon {
  const pts: [number, number][] = [];
  const angular = radiusKm / 6371; // radians
  for (let i = 0; i <= 64; i++) {
    const brng = (i * 360) / 64;
    const φ1 = (lat * Math.PI) / 180;
    const λ1 = (lon * Math.PI) / 180;
    const θ = (brng * Math.PI) / 180;
    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(angular) + Math.cos(φ1) * Math.sin(angular) * Math.cos(θ),
    );
    const λ2 =
      λ1 +
      Math.atan2(
        Math.sin(θ) * Math.sin(angular) * Math.cos(φ1),
        Math.cos(angular) - Math.sin(φ1) * Math.sin(φ2),
      );
    pts.push([((((λ2 * 180) / Math.PI + 540) % 360) - 180), (φ2 * 180) / Math.PI]);
  }
  return { type: "Polygon", coordinates: [pts] };
}

export default function MapView(props: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const camMarkersRef = useRef<Map<string, Marker>>(new Map());
  const cityMarkersRef = useRef<Marker[]>([]);
  const issMarkerRef = useRef<Marker | null>(null);
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  // ── init map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    // Serve the MapLibre worker from /public (bundler worker resolution fails under Turbopack).
    try {
      setWorkerUrl("/maplibre-gl-worker.mjs");
    } catch {
      /* ignore — fallback to default */
    }
    const map = new MaplibreMap({
      container: containerRef.current,
      center: [52.5, 25.5],
      zoom: 5.4,
      pitch: 42,
      attributionControl: false,
      style: {
        version: 8,
        projection: { type: "globe" } as never,
        sources: {
          basemap: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            maxzoom: 19,
            attribution:
              "Imagery © Esri, Maxar, Earthstar Geographics | Base map data © OpenStreetMap contributors",
          },
        },
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#030407" } },
          { id: "basemap", type: "raster", source: "basemap", paint: { "raster-opacity": 0.95, "raster-saturation": -0.2, "raster-brightness-max": 0.82 } },
        ],
      } as StyleSpecification,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ visualizePitch: true }), "bottom-right");
    map.addControl(new ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");

    map.on("load", () => {
      setMapLoaded(true);
      // aircraft icon images
      const green = makeAircraftIcon([52, 255, 148, 1]);
      if (green) map.addImage("ac-green", green);
      const red = makeAircraftIcon([255, 82, 82, 1]);
      if (red) map.addImage("ac-red", red);

      map.addSource("aircraft-src", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "aircraft-layer",
        type: "symbol",
        source: "aircraft-src",
        layout: {
          "icon-image": [
            "case",
            ["get", "emergency"],
            "ac-red",
            "ac-green",
          ] as never,
          "icon-size": 0.72,
          "icon-rotate": ["get", "heading"] as never,
          "icon-rotation-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
        paint: { "icon-opacity": 0.95 },
      });

      map.addSource("quakes-src", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "quake-halo",
        type: "circle",
        source: "quakes-src",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["get", "mag"],
            2, 5, 4, 11, 6, 20, 8, 32,
          ] as never,
          "circle-color": [
            "interpolate",
            ["linear"],
            ["get", "mag"],
            2, "#fbbf24",
            4, "#fb923c",
            5.5, "#ef4444",
          ] as never,
          "circle-opacity": 0.28,
          "circle-stroke-color": "#ef4444",
          "circle-stroke-width": 1,
          "circle-stroke-opacity": 0.7,
        },
      });

      map.addSource("iss-footprint-src", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "iss-footprint",
        type: "fill",
        source: "iss-footprint-src",
        paint: { "fill-color": "#e5e7eb", "fill-opacity": 0.06 },
      });
      map.addLayer({
        id: "iss-footprint-line",
        type: "line",
        source: "iss-footprint-src",
        paint: { "line-color": "#e5e7eb", "line-opacity": 0.5, "line-width": 1, "line-dasharray": [3, 2] },
      });

      map.on("click", "aircraft-layer", (e) => {
        const f = e.features?.[0];
        const id = f?.properties?.id as string | undefined;
        if (!id) return;
        const ac = propsRef.current.aircraft.find((a) => a.id === id);
        if (ac) propsRef.current.onSelectAircraft(ac);
      });
      map.on("mouseenter", "aircraft-layer", () => {
        map.getCanvas().style.cursor = "crosshair";
      });
      map.on("mouseleave", "aircraft-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      camMarkersRef.current.clear();
      cityMarkersRef.current = [];
      issMarkerRef.current = null;
    };
  }, []);

  // ── aircraft data sync ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("aircraft-src") as GeoJSONSource | undefined;
    if (!src) return;
    src.setData({
      type: "FeatureCollection",
      features: props.aircraft.map((a) => ({
        type: "Feature" as const,
        properties: {
          id: a.id,
          emergency: a.emergency,
          heading: a.trackDeg ?? 0,
        },
        geometry: { type: "Point" as const, coordinates: [a.lon, a.lat] },
      })),
    });
    const vis = props.layers.aircraft ? "visible" : "none";
    if (map.getLayer("aircraft-layer")) map.setLayoutProperty("aircraft-layer", "visibility", vis);
  }, [props.aircraft, props.layers.aircraft, mapLoaded]);

  // ── quakes sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("quakes-src") as GeoJSONSource | undefined;
    if (!src) return;
    src.setData({
      type: "FeatureCollection",
      features: props.quakes.map((q) => ({
        type: "Feature" as const,
        properties: { mag: q.mag },
        geometry: { type: "Point" as const, coordinates: [q.lon, q.lat] },
      })),
    });
    const vis = props.layers.quakes ? "visible" : "none";
    if (map.getLayer("quake-halo")) map.setLayoutProperty("quake-halo", "visibility", vis);
  }, [props.quakes, props.layers.quakes, mapLoaded]);

  // ── ISS sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("iss-footprint-src") as GeoJSONSource | undefined;
    if (!src) return;
    const iss = props.iss;
    if (!iss) {
      src.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    src.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: issFootprintPolygon(iss.lat, iss.lon, iss.footprintKm / 2),
        },
      ],
    });
    const vis = props.layers.iss ? "visible" : "none";
    for (const l of ["iss-footprint", "iss-footprint-line"]) {
      if (map.getLayer(l)) map.setLayoutProperty(l, "visibility", vis);
    }
    if (!issMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "iss-marker";
      issMarkerRef.current = new Marker({ element: el })
        .setLngLat([iss.lon, iss.lat])
        .addTo(map);
    } else {
      issMarkerRef.current.setLngLat([iss.lon, iss.lat]);
    }
    issMarkerRef.current.getElement().style.display = props.layers.iss ? "block" : "none";
  }, [props.iss, props.layers.iss, mapLoaded]);

  // ── radar raster layer ──────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !props.radar) return;
    if (!map.getSource("radar-src")) {
      map.addSource("radar-src", {
        type: "raster",
        tiles: [`${props.radar.host}${props.radar.path}/256/{z}/{x}/{y}/2/1_1.png`],
        tileSize: 256,
        maxzoom: 11,
      });
      // Layer-level maxzoom over-zooms z11 tiles instead of fetching
      // RainViewer's "Zoom Level Not Supported" watermark tiles.
      map.addLayer(
        {
          id: "radar-layer",
          type: "raster",
          source: "radar-src",
          maxzoom: 11,
          paint: { "raster-opacity": 0.42 },
        },
        map.getLayer("aircraft-layer") ? "aircraft-layer" : undefined,
      );
    }
    if (map.getLayer("radar-layer")) {
      map.setLayoutProperty(
        "radar-layer",
        "visibility",
        props.radarVisible ? "visible" : "none",
      );
    }
  }, [props.radar, props.radarVisible, mapLoaded]);

  // ── NASA GIBS raster layer ──────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !props.satelliteVisible) return;
    if (!map.getSource("gibs-src")) {
      map.addSource("gibs-src", {
        type: "raster",
        tiles: [
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate()}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
        ],
        tileSize: 256,
        maxzoom: 9,
      });
      // Layer-level maxzoom hides MODIS beyond z9 (no unsupported-zoom tiles).
      map.addLayer(
        {
          id: "gibs-layer",
          type: "raster",
          source: "gibs-src",
          maxzoom: 9,
          paint: { "raster-opacity": 0.85 },
        },
        map.getLayer("aircraft-layer") ? "aircraft-layer" : undefined,
      );
    }
    if (map.getLayer("gibs-layer")) {
      map.setLayoutProperty("gibs-layer", "visibility", props.satelliteVisible ? "visible" : "none");
    }
  }, [props.satelliteVisible, mapLoaded]);

  // ── camera markers ──────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const cam of props.cameras) {
      if (camMarkersRef.current.has(cam.id)) continue;
      const el = document.createElement("div");
      el.className = `cam-marker${cam.country !== "United Arab Emirates" ? " me-node" : ""}`;
      el.title = `${cam.code} — ${cam.name}`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        propsRef.current.onSelectCamera(cam);
      });
      const marker = new Marker({ element: el })
        .setLngLat([cam.lon, cam.lat])
        .addTo(map);
      camMarkersRef.current.set(cam.id, marker);
    }

    for (const [id, marker] of camMarkersRef.current) {
      const cam = props.cameras.find((c) => c.id === id);
      if (cam) {
        marker.getElement().style.display = props.layers.cameras ? "block" : "none";
        marker.getElement().classList.toggle("selected", props.selectedCameraId === id);
      }
    }
  }, [props.cameras, props.layers.cameras, props.selectedCameraId]);

  // ── city markers ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (cityMarkersRef.current.length === 0) {
      for (const city of props.cityNodes) {
        const el = document.createElement("div");
        el.className = "city-marker";
        const dot = document.createElement("span");
        dot.className = "dot";
        const lbl = document.createElement("span");
        lbl.className = "lbl";
        lbl.textContent = city.name.toUpperCase();
        el.appendChild(dot);
        el.appendChild(lbl);
        const m = new Marker({ element: el, anchor: "left" })
          .setLngLat([city.lon, city.lat])
          .addTo(map);
        cityMarkersRef.current.push(m);
      }
    }
    for (const m of cityMarkersRef.current) {
      m.getElement().style.display = props.layers.cities ? "flex" : "none";
    }
  }, [props.cityNodes, props.layers.cities]);

  // ── region focus ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !props.regionFocus.nonce) return;
    map.flyTo({
      center: props.regionFocus.center,
      zoom: props.regionFocus.zoom,
      pitch: props.regionFocus.pitch,
      duration: 2200,
      essential: true,
    });
  }, [props.regionFocus]);

  // ── camera focus (selection / watch mode) ───────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !props.cameraFocus.nonce) return;
    map.flyTo({
      center: props.cameraFocus.center,
      zoom: 11.6,
      pitch: 55,
      bearing: -18,
      duration: 2000,
      essential: true,
    });
  }, [props.cameraFocus]);

  return (
    <div className="scanlines vignette relative h-full w-full overflow-hidden bg-black">
      <div
        ref={containerRef}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        aria-label="Tactical globe map"
      />
      <div className="pointer-events-none absolute inset-0 z-[3] border border-amber-400/10" />
      <div className="pointer-events-none absolute left-3 top-3 z-[3] font-mono text-[9px] leading-4 tracking-[0.2em] text-amber-200/40">
        <div>MERCATOR → GLOBE PROJECTION</div>
        <div>SAT BASEMAP © ESRI · MAXAR · OSM</div>
      </div>
    </div>
  );
}
