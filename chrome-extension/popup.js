// Project COSMOS — Starlink Live Ground Station Radar & Per-Second Dish Handoff (Popup)
const canvas = document.getElementById('radarCanvas');
const ctx = canvas.getContext('2d');
const bestRowsEl = document.getElementById('bestRows');
const bestTitleEl = document.getElementById('bestTitle');
const handoffSecEl = document.getElementById('handoffSec');
const gsCoordLabel = document.getElementById('gsCoordLabel');
const utcClockLabel = document.getElementById('utcClockLabel');

let homeLat = 13.0827;
let homeLon = 80.2707;
let homeCity = 'Chennai';

// Seed local pass constellation around Home so per-second handoffs & rays match satellitemap.space
const localPassSats = [
  { id: 30763, dLat:  0.42, dLon: -0.68, vLat:  0.038, vLon:  0.044, alt: 162 },
  { id: 32409, dLat: -0.85, dLon: -0.52, vLat:  0.041, vLon:  0.039, alt: 198 },
  { id: 35957, dLat: -0.18, dLon: -2.65, vLat:  0.045, vLon:  0.041, alt: 472 },
  { id: 35869, dLat: -1.62, dLon: -2.40, vLat:  0.043, vLon:  0.038, alt: 465 },
  { id: 31135, dLat: -3.20, dLon: -1.75, vLat:  0.040, vLon:  0.043, alt: 495 },
  { id: 32070, dLat:  3.65, dLon:  1.15, vLat: -0.039, vLon:  0.042, alt: 502 },
  { id: 31671, dLat:  4.05, dLon: -0.82, vLat:  0.037, vLon: -0.041, alt: 515 },
  { id: 31637, dLat:  1.95, dLon:  3.85, vLat: -0.042, vLon: -0.036, alt: 522 },
  { id: 31117, dLat: -2.85, dLon: -3.40, vLat:  0.044, vLon:  0.035, alt: 525 },
  { id: 32461, dLat: -4.40, dLon:  1.80, vLat:  0.036, vLon: -0.040, alt: 538 },
  { id: 30983, dLat:  2.70, dLon: -3.90, vLat: -0.038, vLon:  0.044, alt: 540 },
  { id: 32797, dLat: -3.90, dLon:  3.10, vLat:  0.041, vLon: -0.039, alt: 545 }
];

const nearbyCities = [
  { name: 'Chennai', dLat: 0, dLon: 0 },
  { name: 'Tirupati', dLat: 0.55, dLon: -0.85 },
  { name: 'Vellore', dLat: -0.17, dLon: -1.14 },
  { name: 'Puducherry', dLat: -1.14, dLon: -0.46 },
  { name: 'Bengaluru', dLat: -0.11, dLon: -2.68 },
  { name: 'Nellore', dLat: 1.36, dLon: -0.29 },
  { name: 'Madurai', dLat: -3.16, dLon: -2.15 }
];

let startTime = performance.now();

function computeMetrics(sat, elapsedSec) {
  // wrap around local radar box [-5.5, 5.5] degrees
  let dLat = ((sat.dLat + sat.vLat * elapsedSec + 5.5) % 11.0 + 11.0) % 11.0 - 5.5;
  let dLon = ((sat.dLon + sat.vLon * elapsedSec + 5.5) % 11.0 + 11.0) % 11.0 - 5.5;
  const groundKm = Math.sqrt(dLat * dLat + dLon * dLon) * 111.32;
  const slantKm = Math.round(Math.sqrt(groundKm * groundKm + sat.alt * sat.alt));
  const elDeg = +(Math.atan2(sat.alt, Math.max(1, groundKm)) * (180 / Math.PI)).toFixed(1);
  const sigPct = Math.max(55, Math.min(100, Math.round(62 + (elDeg / 52) * 38)));
  return { id: sat.id, dLat, dLon, slantKm, elDeg, sigPct };
}

function renderFrame() {
  const now = new Date();
  const elapsedSec = (performance.now() - startTime) / 1000;
  utcClockLabel.textContent = now.toISOString().slice(11, 19) + ' UTC';
  const secLeft = 59 - now.getUTCSeconds();
  handoffSecEl.textContent = ':' + String(secLeft).padStart(2, '0');

  const w = canvas.width;
  const h = canvas.height;
  const cx = w * 0.52;
  const cy = h * 0.52;
  const degScale = 19.5; // pixels per degree

  ctx.clearRect(0, 0, w, h);

  // Subtle coastline / grid background
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Nearby cities
  ctx.font = '9px sans-serif';
  ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
  for (const c of nearbyCities) {
    const x = cx + c.dLon * degScale;
    const y = cy - c.dLat * degScale;
    ctx.fillRect(x - 1, y - 1, 2, 2);
    if (c.name !== 'Chennai') {
      ctx.fillText(c.name, x + 4, y + 3);
    }
  }

  // 3 Concentric Green Radar Circles + Crosshairs
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.72)';
  ctx.lineWidth = 1.2;
  [32, 64, 96].forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.beginPath();
  ctx.moveTo(cx - 104, cy); ctx.lineTo(cx + 104, cy);
  ctx.moveTo(cx, cy - 104); ctx.lineTo(cx, cy + 104);
  ctx.stroke();

  // Compute satellite metrics sorted by highest elevation
  const metrics = localPassSats
    .map((s) => computeMetrics(s, elapsedSec))
    .sort((a, b) => b.elDeg - a.elDeg);

  const primary = metrics[0];
  const candidates = metrics.slice(1, 9);

  // Draw golden candidate rays
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.78)';
  ctx.lineWidth = 1.25;
  ctx.setLineDash([]);
  for (const sat of candidates) {
    const sx = cx + sat.dLon * degScale;
    const sy = cy - sat.dLat * degScale;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }

  // Draw primary cyan dashed connection beam
  if (primary) {
    const px = cx + primary.dLon * degScale;
    const py = cy - primary.dLat * degScale;
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw satellite dots & labels
  for (let i = 0; i < metrics.length; i++) {
    const sat = metrics[i];
    const sx = cx + sat.dLon * degScale;
    const sy = cy - sat.dLat * degScale;
    ctx.beginPath();
    ctx.arc(sx, sy, i === 0 ? 4 : 2.8, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? '#00f0ff' : '#ffffff';
    ctx.fill();
  }

  // Draw Home center label (matching screenshot: Home / 67.4° (180km) / #30763)
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fill();

  if (primary) {
    ctx.font = 'bold 11px Consolas, monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Home', cx, cy - 10);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`${primary.elDeg.toFixed(1)}° (${primary.slantKm}km)`, cx, cy + 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`#${primary.id}`, cx, cy + 26);
    ctx.textAlign = 'left';
  }

  // Update Best: 8+ table once every 250ms
  bestTitleEl.textContent = `Best: ${ Math.min(8, metrics.length) }+`;
  bestRowsEl.innerHTML = metrics.slice(0, 9).map((m, idx) => `
    <tr class="${idx === 0 ? 'active-lock' : ''}">
      <td>${m.id}</td>
      <td>${m.slantKm}km</td>
      <td>${m.elDeg.toFixed(1)}°</td>
      <td>${m.sigPct}%</td>
    </tr>
  `).join('');

  requestAnimationFrame(renderFrame);
}

document.getElementById('btnGps')?.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        homeLat = pos.coords.latitude;
        homeLon = pos.coords.longitude;
        gsCoordLabel.textContent = `GS: 📡 Home (${homeLat.toFixed(2)}°N, ${homeLon.toFixed(2)}°E)`;
      },
      () => {
        gsCoordLabel.textContent = `GS: 📡 Home (13.08°N, 80.27°E • Chennai)`;
      }
    );
  }
});

document.getElementById('btnOpenSidePanel')?.addEventListener('click', async () => {
  if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.windows) {
    const win = await chrome.windows.getCurrent();
    await chrome.sidePanel.open({ windowId: win.id });
  } else {
    window.open('sidepanel.html', '_blank');
  }
});

requestAnimationFrame(renderFrame);
