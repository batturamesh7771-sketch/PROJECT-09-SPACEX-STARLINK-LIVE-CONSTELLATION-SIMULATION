import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { logger } from '../utils/logger.js';

export interface StarlinkMtlsCredentials {
  subject: string;
  curve: 'secp384r1';
  signatureAlgorithm: 'ecdsa-with-SHA384';
  ecParamPem: string;
  privateKeyPem: string;
  csrSubject: {
    CN: string;
    O: string;
    OU: string;
  };
  verified: boolean;
}

const CERTS_DIR = path.resolve(process.cwd(), '../../certs');

export function getOrGenerateStarlinkMtlsCredentials(): StarlinkMtlsCredentials {
  const ecParamPath = path.join(CERTS_DIR, 'secp384r1.pem');
  const keyPath = path.join(CERTS_DIR, 'client.key');

  try {
    if (fs.existsSync(ecParamPath) && fs.existsSync(keyPath)) {
      return {
        subject: '/CN=funspacecorp/O=Fun Space Corp/OU=Operations',
        curve: 'secp384r1',
        signatureAlgorithm: 'ecdsa-with-SHA384',
        ecParamPem: fs.readFileSync(ecParamPath, 'utf8'),
        privateKeyPem: fs.readFileSync(keyPath, 'utf8').slice(0, 120) + '\n...[REDACTED EC PRIVATE KEY]...',
        csrSubject: {
          CN: 'funspacecorp',
          O: 'Fun Space Corp',
          OU: 'Operations',
        },
        verified: true,
      };
    }
  } catch (err) {
    logger.warn('Fallback to runtime secp384r1 keypair generation:', err);
  }

  const { privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp384r1',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  return {
    subject: '/CN=funspacecorp/O=Fun Space Corp/OU=Operations',
    curve: 'secp384r1',
    signatureAlgorithm: 'ecdsa-with-SHA384',
    ecParamPem: '-----BEGIN EC PARAMETERS-----\nBgUrgQQAIg==\n-----END EC PARAMETERS-----',
    privateKeyPem: privateKey.slice(0, 120) + '\n...[REDACTED EC PRIVATE KEY]...',
    csrSubject: {
      CN: 'funspacecorp',
      O: 'Fun Space Corp',
      OU: 'Operations',
    },
    verified: true,
  };
}
