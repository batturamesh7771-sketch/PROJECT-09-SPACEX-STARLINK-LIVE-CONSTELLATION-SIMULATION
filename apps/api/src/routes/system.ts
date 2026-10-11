import { Router } from 'express';
import { keyManager } from '../utils/keyManager.js';
import {
  generateOfflineSnapshotManifest,
  EMBEDDED_OFFLINE_TLES,
} from '../services/system/offlineArchiver.js';
import { logger } from '../utils/logger.js';

const router = Router();

// GET /api/system/key-vault
router.get('/key-vault', (_req, res) => {
  try {
    const stats = keyManager.getVaultStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error in GET /api/system/key-vault:', error);
    res.status(500).json({
      success: false,
      error: { code: 'KEY_VAULT_ERROR', message: 'Failed to retrieve API Key Vault status' },
    });
  }
});

// POST /api/system/key-vault
router.post('/key-vault', (req, res) => {
  try {
    const { provider, key, label, bulk } = req.body || {};

    if (Array.isArray(bulk)) {
      const added = keyManager.registerKeysBulk(bulk);
      return res.json({
        success: true,
        data: {
          added,
          vaultStats: keyManager.getVaultStats(),
        },
      });
    }

    if (!provider || !key) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'provider and key are required' },
      });
    }

    const created = keyManager.registerKey(provider, key, label);
    res.json({
      success: true,
      data: {
        created,
        vaultStats: keyManager.getVaultStats(),
      },
    });
  } catch (error) {
    logger.error('Error in POST /api/system/key-vault:', error);
    res.status(500).json({
      success: false,
      error: { code: 'KEY_REGISTER_ERROR', message: 'Failed to register API key' },
    });
  }
});

// POST /api/system/key-vault/simulate-scale
router.post('/key-vault/simulate-scale', (req, res) => {
  try {
    const count = Number(req.body?.count) || 2500;
    const result = keyManager.provisionHighThroughputCluster(count);
    res.json({
      success: true,
      data: {
        ...result,
        vaultStats: keyManager.getVaultStats(),
      },
    });
  } catch (error) {
    logger.error('Error in POST /api/system/key-vault/simulate-scale:', error);
    res.status(500).json({
      success: false,
      error: { code: 'KEY_CLUSTER_ERROR', message: 'Failed to provision key cluster' },
    });
  }
});

// GET /api/system/offline-snapshot
router.get('/offline-snapshot', async (_req, res) => {
  try {
    const manifest = await generateOfflineSnapshotManifest();
    res.json({
      success: true,
      data: manifest,
    });
  } catch (error) {
    logger.error('Error in GET /api/system/offline-snapshot:', error);
    res.status(500).json({
      success: false,
      error: { code: 'OFFLINE_SNAPSHOT_ERROR', message: 'Failed to build offline snapshot' },
    });
  }
});

// GET /api/system/embedded-tles
router.get('/embedded-tles', (_req, res) => {
  res.json({
    success: true,
    data: EMBEDDED_OFFLINE_TLES,
  });
});

export default router;
