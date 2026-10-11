# Project 09 — COSMOS & SpaceX Starlink Live 3D Constellation Simulation Software (A–Z Sequence)

**Author:** Mr ELONIKHIL (`mr elonikhil`)  
**License:** MIT License  

---

## 📋 Table of Contents (Sequential Build Structure)

1. **[Sequence 01] System Architecture & Monorepo Scaffolding** (`packages/types`, `packages/orbital`, `apps/api`, `apps/web`)
2. **[Sequence 02] Phase 1: Real-Time Orbital Propagation Engine (SGP4 / Keplerian + CelesTrak / Space-Track / N2YO / SatNOGS)**
3. **[Sequence 03] Phase 2: Space Weather, Solar Telemetry & Global Launch Systems (NOAA SWPC, NASA DONKI, SpaceX API)**
4. **[Sequence 04] Phase 3: Orbital Debris, SOCRATES Conjunctions & Planetary Defense (ESA DISCOS, JPL CNEOS/Sentry)**
5. **[Sequence 05] Phase 4: Earth Observation, NASA GIBS WMTS & JPL Horizons Solar System Ephemeris**
6. **[Sequence 06] Phase 5: Deep Space, Exoplanet Habitable Zone (ESI) & Multi-Messenger Astrophysics (LIGO/GWOSC, JWST/MAST)**
7. **[Sequence 07] Phase 6: 10,000+ Rotating API Key Vault, SpaceX `secp384r1` ECDSA mTLS Identity & Offline Archiver**
8. **[Sequence 08] Standalone 3D WebGL Starlink Simulator (`satellitemap.space` 11,127 Satellites + SRM Hostel Live Google Satellite Dish Radar)**
9. **[Sequence 09] React Three Fiber (`@react-three/fiber`) `InstancedMesh` Raycasting, 2D Slide-Out Inspector Sidebar, Orbit Trajectory & Footprint Cone**
10. **[Sequence 10] Chrome Extension (Manifest V3) Popup & Side Panel Live Dish Radar**
11. **[Sequence 11] Prompts Archive (Complete Engineering Prompts Used Across Project 09)**

---

## Sequence 01–07: 43 Space & Geospatial APIs + 10,000+ Rotating Key Vault

Project 09 integrates **43 space and geospatial data providers** managed by a round-robin **10,000+ API Key Rotation Vault** (`apps/api/src/utils/keyManager.ts`):

| Phase | Category | Providers Integrated |
| :--- | :--- | :--- |
| **Phase 1** | Satellite Tracking & 3D Maps | CelesTrak GP/TLE, USSF Space-Track.org, N2YO Live REST API, SatNOGS DB, AMSAT, Ivan TLE, WhereTheISS.at, Open-Notify, Cesium Ion, Google Maps Satellite Hybrid Tile API |
| **Phase 2** | Space Weather & Launches | NOAA SWPC, NASA Open APIs (DONKI/APOD/NeoWs), GFZ Potsdam Kp, Kyoto WDC Dst, Launch Library 2, SpaceX v4/v5 API, SNAPI v4, RocketLaunch.Live |
| **Phase 3** | Space Debris & NEOs | ESA DISCOSweb, CelesTrak SOCRATES Conjunctions, NASA JPL CAD, JPL Sentry Impact Risk, JPL SBDB, JPL Fireball/Bolide, IAU Minor Planet Center |
| **Phase 4** | Earth Observation & Planetary | NASA EONET v3, NASA EOSDIS GIBS WMTS, ESA Copernicus Sentinel, USGS EarthExplorer, OpenTopography DEM, JPL Horizons, NASA Mars Rover, NASA PDS4, USGS Astrogeology |
| **Phase 5** | Deep Space & Multi-Messenger | NASA Exoplanet Archive TAP, LIGO/Virgo/KAGRA GWOSC, STScI MAST (JWST/Hubble), ESA Gaia DR3, IAU TNS Supernovae, NMDB Cosmic Rays, NASA DSN Now, AstronomyAPI, SuperMAG |
| **Phase 6** | Enterprise mTLS & Offline Vault | SpaceX Starlink `secp384r1` ECDSA mTLS (`/CN=funspacecorp/O=Fun Space Corp/OU=Operations`), IndexedDB Offline Snapshot Engine, 10,000+ Key Load Balancer |

---

## Sequence 08: SpaceX Starlink Enterprise `secp384r1` ECDSA mTLS Generation

Generated via `scripts/generate-mtls-certs.mjs` (compatible with OpenSSL NIST P-384):

```bash
openssl ecparam -name secp384r1 -out certs/secp384r1.pem
openssl req -new -newkey ec:certs/secp384r1.pem -nodes \
  -keyout certs/client.key -sha384 -out certs/client.csr \
  -subj "/CN=funspacecorp/O=Fun Space Corp/OU=Operations"
```

---

## Sequence 09: Engineering Prompts Log

### Prompt A — Full-Stack Space Simulation & 10,000+ API Key Architecture
> *"Locate, extract, and compile the backend database and functional frontend structure of SatelliteMap.space... build our own system even more advanced version, adding 10000+ different api keys to maintain web real time for A-Z about space simulation across Phases 1 to 6."*

### Prompt B — SpaceX Starlink Live Constellation & Ground Station Dish Radar
> *"We are building SpaceX Starlink live constellation simulation web software... use `openssl ecparam -name secp384r1` (`/CN=funspacecorp/O=Fun Space Corp/OU=Operations`) and build `https://satellitemap.space/vis/constellation/starlink` real-time location per-second satellite connection handoffs with Google Maps Satellite layer (`12.8238178° N, 80.0450062° E` — SRM Hostel / SRMIST KTR Campus)."*

### Prompt C — 4-Step Interactive `InstancedMesh` Raycasting, HTML HUD, Orbit Line & Footprint Cone
> *"Implement advanced interactivity, specifically the ability to click individual satellites, view their data, and visualize their orbits in 4 strict steps:*
> *1. Instanced Raycasting & Selection State (`onPointerDown`, `event.instanceId`, `selectedSatellite`, `console.log`)*
> *2. The HTML HUD & Camera Follow (`@react-three/drei` `<Html>`, zero React re-render `useFrame` DOM refs, `OrbitControls` target lerp)*
> *3. Orbital Trajectory Line (`currentTime - 45m` to `currentTime + 45m` in 1-minute increments via `satellite.propagate`)*
> *4. Coverage Footprint (`THREE.ConeGeometry` with `lookAt(0,0,0)` and `AdditiveBlending`) & Global Un-selection"*

### Prompt D — Bulletproof `InstancedMesh` Hitbox & 2D Slide-Out Sidebar Overlay
> *"Fix the tiny geometry hitbox problem (`.computeBoundingSphere()`, `.computeBoundingBox()`, `raycaster.params.Mesh.threshold = 0.5`), stop event propagation (`e.stopPropagation()`), support global deselect on Earth/empty space click, and render the 2D slide-out `satellitemap.space` sidebar overlay displaying Satellite Name, NORAD ID, International Designator, Constellation, LEO/CIRCULAR badges, and collapsible telemetry sections."*

---

**Author:** mr elonikhil  
**License:** MIT License
