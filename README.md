<div align="center">

# 🔶 GODS EYE // UAE

### Middle East Signals Command — open-signals mission console, UAE first

[![Deploy GitHub Pages](https://github.com/YOUR_USERNAME/gods-eye-uae/actions/workflows/pages.yml/badge.svg)](https://github.com/YOUR_USERNAME/gods-eye-uae/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-ffb000.svg)](LICENSE)
[![No Dependencies](https://img.shields.io/badge/Field%20Build-zero%20dependencies-22d3a7.svg)](#-field-build--one-file--zero-dependencies)
[![Next.js 16](https://img.shields.io/badge/Command%20Center-Next.js%2016-8d8875.svg)](#-command-center--nextjs-16-edition)

**A mission-control HUD for the Middle East's open signals — live camera grid, ADS-B air
traffic, seismic events, ISS telemetry and weather wire, with the United Arab Emirates
as the operational centerpiece.**

</div>

---

![GODS EYE // UAE — Field Build theater view](docs/screenshots/field-build-theater.png)

> The **FIELD BUILD** vector theater: Arabian Gulf at a glance — amber UAE camera sector,
> green ADS-B contacts, graticule, scale bar, compass and the ME THEATER minimap.

## What is this?

GODS EYE // UAE is a **monitoring console for publicly available open signals** across the
Middle East, designed around a dark mission-control aesthetic (amber / emerald on near-black,
monospace HUD typography, CRT scanline texture). It ships in two editions:

| | 🛰 FIELD BUILD | 🌍 COMMAND CENTER |
|---|---|---|
| **File** | `index.html` — one single file | `command-center/` — full Next.js 16 app |
| **Stack** | Vanilla JS + Canvas 2D | React + MapLibre GL globe + AI analyst |
| **Dependencies** | **Zero.** No build step, no framework | Node/bun + npm/bun install |
| **Hosting** | GitHub Pages, any static host, or `file://` | Any Node server (or your own VPS) |
| **Map** | Hand-built Canvas 2D vector theater | Esri World Imagery satellite globe |
| **AI analyst** | On-device heuristic brief | LLM-powered situation brief (`/api/analyst`) |
| **Best for** | Instant launch, sharing, embedding | The full cinematic experience |

Both editions track the same mission picture: a **20-node Middle East camera grid with the
UAE at the center**, live aircraft over the Gulf, seismic events from USGS, ISS passes,
regional weather, and a news wire — every feed public, every data source attributed on-screen.

## ⚡ Launch on GitHub Pages (60 seconds)

This repository is **launch-ready**. Everything GitHub needs is already inside:
the site itself, a `LICENSE`, a `.gitignore`, and a preconfigured
`.github/workflows/pages.yml` that builds and deploys the site on every push to `main`.

1. **Create a new repository** on GitHub (e.g. `gods-eye-uae`), then push this folder:

   ```bash
   cd gods-eye-uae
   git init -b main                     # already done if you kept the .git folder
   git add -A
   git commit -m "GODS EYE // UAE — initial release"
   git remote add origin https://github.com/YOUR_USERNAME/gods-eye-uae.git
   git push -u origin main
   ```

2. **Enable Pages**: repository **Settings → Pages → Build and deployment →
   Source: GitHub Actions**. (No other settings required — the included workflow
   handles the rest.)

3. **Done.** Within a minute your console is live at:

   ```
   https://YOUR_USERNAME.github.io/gods-eye-uae/
   ```

> Prefer zero-configuration instead of Actions? Set **Settings → Pages → Source:
> Deploy from a branch → `main` / `(root)`** — GitHub will serve `index.html` directly.
> In that case you can delete `.github/workflows/pages.yml`.

## 🛰 Field Build — one file, zero dependencies

![Field Build — DXB-01 selected](docs/screenshots/field-build-dxb01-selected.png)

Open `index.html` in any browser — from disk, USB stick, or a static host — and the
console boots straight into the Arabian Gulf theater. No install, no API keys, no build.

- **Vector theater map** — hand-simplified WGS84 coastlines (Arabia incl. Qatar and the
  Musandam enclave, Iran, Qeshm, Bahrain), amber UAE sector with approximate emirate
  borders, graticule, scale bar and compass
- **20-node camera grid** — click a node for a dashed selection reticle, cinematic zoom,
  coordinate/LINK-probe detail panel and an **OPEN LIVE FEED** button to the provider page
- **4 nodes stream embedded in-page** — DXB-05 (Dubai 24/7 Burj Khalifa), MKKA-01 (Makkah
  Masjid al-Haram), MDNA-01 (Madinah Masjid an-Nabawi), JRS-02 (Jerusalem Western Wall) play
  right inside the console via the sources' official YouTube players — no link-out needed
- **Live ADS-B layer** — aircraft symbols with callsign labels, honestly tagged
  `LIVE` or `SIM` depending on feed reachability from your network
- **Signal event log + LIVE WIRE ticker** — camera health flicker, quakes, ISS telemetry,
  weather wire entries streaming in real time
- **Tabs** — `CAM` camera grid · `AIR` air contacts · `ENV` weather/seismic/ISS ·
  `WIRE` headlines · `AI` situation brief
- **WATCH MODE** — auto-hops between UAE cameras every 12 s with cinematic focus
- **Pan / zoom / fly-to**, ME THEATER minimap with live viewport rectangle,
  boot sequence, scanline overlay

Run it locally (or just double-click it):

```bash
python3 -m http.server 8080   # then open http://localhost:8080
# …or simply open index.html directly — file:// works too
```

## 🌍 Command Center — Next.js 16 edition

![Command Center — DXB-01 on the globe](docs/screenshots/command-center-dxb01.png)

The full cinematic build: a **MapLibre GL satellite globe** (Esri World Imagery) over the
Gulf, layer rail with live counters, GDELT news ticker and an **AI analyst** that generates
situation briefs from the live feeds.

```bash
cd command-center
bun install            # or: npm install
cp .env.example .env.local
bun run db:push        # materialize the local SQLite scaffold (or: npx prisma db push)
bun run dev            # or: npm run dev  →  http://localhost:3000
```

- `/` — the mission console (boot sequence, HUD top bar, globe, layer rail, context panel)
- `/api/aircraft` · `/api/quakes` · `/api/weather` · `/api/iss` · `/api/news` ·
  `/api/radar` · `/api/cameras/health` — TTL-cached proxy routes for the public feeds
  (keeps your browser off third-party rate limits)
- `/api/analyst` — LLM situation brief with live context injection
  (set `ZAI_API_KEY` or your provider key in the environment to enable)

![Command Center — AIR tab](docs/screenshots/command-center-air-traffic.png)

## 📷 Camera grid — 20 verified public nodes

| ID | Location | City | Provider |
|---|---|---|---|
| DXB-01 | Dubai Marina — Princess Tower | Dubai | SkylineWebcams |
| DXB-02 | Dubai Skyline — Princess Tower | Dubai | SkylineWebcams |
| DXB-03 | Palm Jumeirah — Fairmont The Palm | Dubai | SkylineWebcams |
| DXB-04 | Deira District | Dubai | WorldCam |
| AUH-01 | Al Raha Beach | Abu Dhabi | WorldCam |
| AUH-02 | Al Reem Island | Abu Dhabi | WorldCam |
| AUH-03 | Masdar City | Abu Dhabi | WorldCam |
| AUH-04 | Yas Bay | Abu Dhabi | WorldCam |
| SHJ-01 | Al Dhaid — Sharjah Safari Reserve | Sharjah | WorldCam |
| FUJ-01 | Dibba — Sandy Beach | Fujairah | WorldCam |
| UAQ-01 | Kite Beach Center | Umm Al Quwain | WorldCam |
| CAI-01 | Giza — Great Pyramid & Khafre | Cairo | SkylineWebcams |
| CAI-02 | Giza — Pyramids & Sphinx | Cairo | SkylineWebcams |
| IST-01 | Istanbul — Golden Horn | Istanbul | SkylineWebcams |
| JRS-01 | Jerusalem — Old City Overview | Jerusalem | SkylineWebcams |
| PTRA-01 | Petra — Rose City Approach | Ma'an Governorate | SkylineWebcams |
| DXB-05 | Dubai 24/7 — Burj Khalifa Skyline ▶ | Dubai | UinDubai · YouTube |
| MKKA-01 | Makkah — Masjid al-Haram ▶ | Makkah | KSA Quran TV · YouTube |
| MDNA-01 | Madinah — Masjid an-Nabawi ▶ | Madinah | Sunnah TV · YouTube |
| JRS-02 | Jerusalem — Western Wall (Kotel) ▶ | Jerusalem | Western Wall Heritage · YouTube |

▶ = official stream **embedded in-page** (watch it directly inside the console).

Camera hosts block third-party embedding (X-Frame-Options), so link-out nodes health-probe
each source and hand you a one-click **OPEN LIVE FEED** link to the provider's own page —
no streams are rehosted or proxied. The four ▶ nodes are played through their sources'
official YouTube embed players, which do allow in-page embedding.

## 🛰 Data sources (all public, all attributed)

| Feed | Source | Used by |
|---|---|---|
| Air traffic | [adsb.fi](https://adsb.fi) → [adsb.lol](https://adsb.lol) failover | both editions |
| Seismic | [USGS](https://earthquake.usgs.gov) Middle East bbox | both editions |
| Weather | [Open-Meteo](https://open-meteo.com) → [MET Norway](https://www.met.no/en) fallback | both editions |
| ISS | [wheretheiss.at](https://wheretheiss.at) | both editions |
| News wire | [GDELT](https://www.gdeltproject.org) (rate-limit aware, graceful sync state) | both editions |
| Camera listings | [SkylineWebcams](https://www.skylinewebcams.com) · [WorldCam](https://worldcam.eu) | both editions |
| Embedded cams | YouTube: UinDubai · [KSA Quran TV](https://www.youtube.com/@SaudiQuranTv) · Sunnah TV · Western Wall Heritage | both editions |
| Basemap | Esri World Imagery (Esri, Maxar, OSM) | Command Center |
| Overlays | RainViewer radar · NASA GIBS MODIS | Command Center |

Feeds that are unreachable from your network degrade **honestly**: the HUD chip shows the
sync state, SIM-derived data is tagged `SIM`, and the console keeps running on the
remaining live sources. No fake data is ever presented as live.

## ⚠️ Disclaimer

GODS EYE // UAE aggregates **publicly accessible, openly published signals** — public
webcam listings, community ADS-B, government open data and open APIs. It does not access,
intercept or compromise any private, restricted or secured system. All trademarks and
stream rights belong to their respective owners; the console links out and attributes
every source on screen. Use responsibly and in accordance with each provider's terms.

## 🙏 Attribution

Architecture inspired by the open-source
[**God's Eye View**](https://github.com/bilawalsidhu/gods-eye-view) OSINT globe
(MIT) — rebuilt from scratch as a Middle East-first mission console with the UAE
camera grid as the centerpiece, plus this zero-dependency single-file Field Build.

## License

[MIT](LICENSE) — data and imagery credits remain with their respective owners
(see the license appendix for the full attribution list).
