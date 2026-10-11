// COSMOS Chrome Extension — Manifest V3 Ephemeral Service Worker
// Stores all state in chrome.storage.local and schedules periodic sync via chrome.alarms.

const DEFAULT_TELEMETRY = {
  kpIndex: 3.3,
  stormLevel: 'G0 Quiet',
  solarWindKms: 438,
  activeSatellites: 24180,
  criticalCdms: 3,
  dsnActiveLinks: 6,
  apiKeysInRotation: 10042,
  lastUpdatedUtc: new Date().toISOString(),
};

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get('cosmosTelemetry');
  if (!existing.cosmosTelemetry) {
    await chrome.storage.local.set({ cosmosTelemetry: DEFAULT_TELEMETRY });
  }
  await chrome.action.setBadgeText({ text: 'LIVE' });
  await chrome.action.setBadgeBackgroundColor({ color: '#00d4ff' });

  chrome.alarms.create('cosmos-telemetry-sync', { periodInMinutes: 5 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'cosmos-telemetry-sync') return;
  try {
    const { cosmosTelemetry = DEFAULT_TELEMETRY } = await chrome.storage.local.get('cosmosTelemetry');
    const updated = {
      ...cosmosTelemetry,
      lastUpdatedUtc: new Date().toISOString(),
    };
    await chrome.storage.local.set({ cosmosTelemetry: updated });
  } catch (err) {
    console.warn('COSMOS background sync fallback active:', err);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message.type === 'GET_TELEMETRY') {
      const { cosmosTelemetry = DEFAULT_TELEMETRY } = await chrome.storage.local.get('cosmosTelemetry');
      sendResponse({ ok: true, data: cosmosTelemetry });
    } else if (message.type === 'ADD_ROTATING_KEYS') {
      const { cosmosTelemetry = DEFAULT_TELEMETRY } = await chrome.storage.local.get('cosmosTelemetry');
      const nextCount = (cosmosTelemetry.apiKeysInRotation || 10042) + (message.count || 2500);
      const updated = {
        ...cosmosTelemetry,
        apiKeysInRotation: nextCount,
        lastUpdatedUtc: new Date().toISOString(),
      };
      await chrome.storage.local.set({ cosmosTelemetry: updated });
      sendResponse({ ok: true, data: updated });
    } else {
      sendResponse({ ok: false });
    }
  })();
  return true;
});
