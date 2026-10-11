// Project COSMOS — Starlink Live Ground Station Radar & Dish Handoff (Side Panel)
const sideCanvas = document.getElementById('sideRadarCanvas');
const sctx = sideCanvas.getContext('2d');
const sideBestBody = document.getElementById('sideBestBody');
const sideBestHeader = document.getElementById('sideBestHeader');
const sideHandoffTimer = document.getElementById('sideHandoffTimer');
const sideUtcClock = document.getElementById('sideUtcClock');

const passSats = [
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

const cities = [
  { name: 'Chennai', dLat: 0, dLon: 0 },
  { name: 'Tirupati', dLat: 0.55, dLon: -0.85 },
  { name: 'Vellore', dLat: -0.17, dLon: -1.14 },
  { name: 'Kanchipuram', dLat: -0.25, dLon: -0.57 },
  { name: 'Puducherry', dLat: -1.14, dLon: -0.46 },
  { name: 'Bengaluru', dLat: -0.11, dLon: -2.68 },
  { name: 'Nellore', dLat: 1.36, dLon: -0.29 },
  { name: 'Thanjavur', dLat: -2.30, dLon: -1.14 },
  { name: 'Madurai', dLat: -3.16, dLon: -2.15 },
  { name: 'Coimbatore', dLat: -2.07, dLon: -3.31 },
  { name: 'Jaffna', dLat: -3.42, dLon: -0.25 }
];

const t0 = performance.now();

function calcSat(sat, elapsedSec) {
  const dLat = ((sat.dLat + sat.vLat * elapsedSec + 5.5) % 11.0 + 11.0) % 11.0 - 5.5;
  const dLon = ((sat.dLon + sat.vLon * elapsedSec + 5.5) % 11.0 + 11.0) % 11.0 - 5.5;
  const groundKm = Math.sqrt(dLat * dLat + dLon * dLon) * 111.32;
  const slantKm = Math.round(Math.sqrt(groundKm * groundKm + sat.alt * sat.alt));
  const elDeg = +(Math.atan2(sat.alt, Math.max(1, groundKm)) * (180 / Math.PI)).toFixed(1);
  const sigPct = Math.max(55, Math.min(100, Math.round(62 + (elDeg / 52) * 38)));
  return { id: sat.id, dLat, dLon, slantKm, elDeg, sigPct };
}

function tick() {
  const now = new Date();
  const elapsedSec = (performance.now() - t0) / 1000;
  sideUtcClock.textContent = now.toISOString().slice(11, 19) + ' UTC';
  sideHandoffTimer.textContent = ':' + String(59 - now.getUTCSeconds()).padStart(2, '0');

  const w = sideCanvas.width;
  const h = sideCanvas.height;
  const cx = w * 0.54;
  const cy = h * 0.50;
  const scale = 27.5;

  sctx.clearRect(0, 0, w, h);

  // Subtle lat/lon grid
  sctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  sctx.lineWidth = 1;
  for (let x = 0; x < w; x += 48) {
    sctx.beginPath(); sctx.moveTo(x, 0); sctx.lineTo(x, h); sctx.stroke();
  }
  for (let y = 0; y < h; y += 48) {
    sctx.beginPath(); sctx.moveTo(0, y); sctx.lineTo(w, y); sctx.stroke();
  }

  // Cities
  sctx.font = '10px sans-serif';
  sctx.fillStyle = 'rgba(203, 213, 225, 0.55)';
  for (const c of cities) {
    const x = cx + c.dLon * scale;
    const y = cy - c.dLat * scale;
    sctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    if (c.name !== 'Chennai') {
      sctx.fillText(c.name, x + 5, y + 3);
    }
  }

  // 3 Concentric Green Radar Rings + Crosshairs
  sctx.strokeStyle = 'rgba(34, 197, 94, 0.78)';
  sctx.lineWidth = 1.4;
  [45, 90, 135].forEach((r) => {
    sctx.beginPath();
    sctx.arc(cx, cy, r, 0, Math.PI * 2);
    sctx.stroke();
  });
  sctx.beginPath();
  sctx.moveTo(cx - 146, cy); sctx.lineTo(cx + 146, cy);
  sctx.moveTo(cx, cy - 146); sctx.lineTo(cx, cy + 146);
  sctx.stroke();

  const list = passSats.map((s) => calcSat(s, elapsedSec)).sort((a, b) => b.elDeg - a.elDeg);
  const primary = list[0];
  const candidates = list.slice(1, 9);

  // Golden candidate connection lines
  sctx.strokeStyle = 'rgba(245, 158, 11, 0.82)';
  sctx.lineWidth = 1.4;
  sctx.setLineDash([]);
  for (const sat of candidates) {
    sctx.beginPath();
    sctx.moveTo(cx, cy);
    sctx.lineTo(cx + sat.dLon * scale, cy - sat.dLat * scale);
    sctx.stroke();
  }

  // Primary cyan dashed connection beam
  if (primary) {
    sctx.strokeStyle = '#00f0ff';
    sctx.lineWidth = 2.5;
    sctx.setLineDash([6, 4]);
    sctx.beginPath();
    sctx.moveTo(cx, cy);
    sctx.lineTo(cx + primary.dLon * scale, cy - primary.dLat * scale);
    sctx.stroke();
    sctx.setLineDash([]);
  }

  // Satellite dots
  list.forEach((sat, idx) => {
    const sx = cx + sat.dLon * scale;
    const sy = cy - sat.dLat * scale;
    sctx.beginPath();
    sctx.arc(sx, sy, idx === 0 ? 4.5 : 3, 0, Math.PI * 2);
    sctx.fillStyle = idx === 0 ? '#00f0ff' : '#ffffff';
    sctx.fill();
  });

  // Home marker & label
  sctx.fillStyle = '#fde047';
  sctx.beginPath();
  sctx.arc(cx, cy, 4, 0, Math.PI * 2);
  sctx.fill();

  if (primary) {
    sctx.font = 'bold 12px Consolas, monospace';
    sctx.textAlign = 'center';
    sctx.fillStyle = '#ffffff';
    sctx.fillText('Home', cx, cy - 12);
    sctx.fillStyle = '#4ade80';
    sctx.fillText(`${primary.elDeg.toFixed(1)}° (${primary.slantKm}km)`, cx, cy + 16);
    sctx.fillStyle = '#38bdf8';
    sctx.fillText(`#${primary.id}`, cx, cy + 30);
    sctx.textAlign = 'left';
  }

  sideBestHeader.textContent = `Best: ${Math.min(8, list.length)}+`;
  sideBestBody.innerHTML = list.slice(0, 9).map((m, idx) => `
    <tr class="${idx === 0 ? 'active-row' : ''}">
      <td>${m.id}</td>
      <td>${m.slantKm}km</td>
      <td>${m.elDeg.toFixed(1)}°</td>
      <td>${m.sigPct}%</td>
    </tr>
  `).join('');

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
