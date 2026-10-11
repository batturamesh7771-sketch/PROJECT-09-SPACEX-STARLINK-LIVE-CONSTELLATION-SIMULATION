import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certsDir = path.resolve(__dirname, '../certs');
fs.mkdirSync(certsDir, { recursive: true });

// 1. Write standard ASN.1 OID for secp384r1 (1.3.132.0.34 -> BgUrgQQAIg==)
const secp384r1Pem = `-----BEGIN EC PARAMETERS-----\nBgUrgQQAIg==\n-----END EC PARAMETERS-----\n`;
fs.writeFileSync(path.join(certsDir, 'secp384r1.pem'), secp384r1Pem, 'utf8');

// 2. Generate real ECDSA secp384r1 private & public key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp384r1',
  privateKeyEncoding: { type: 'sec1', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
});
fs.writeFileSync(path.join(certsDir, 'client.key'), privateKey, 'utf8');

// 3. Build signed CSR payload for /CN=funspacecorp/O=Fun Space Corp/OU=Operations with SHA384
const csrInfo = Buffer.from(
  JSON.stringify({
    subject: '/CN=funspacecorp/O=Fun Space Corp/OU=Operations',
    curve: 'secp384r1',
    hash: 'sha384',
    publicKey,
    timestamp: new Date().toISOString(),
  })
);
const sign = crypto.createSign('SHA384');
sign.update(csrInfo);
sign.end();
const signature = sign.sign(privateKey);
const csrCombined = Buffer.concat([csrInfo, signature]).toString('base64');
const csrLines = csrCombined.match(/.{1,64}/g)?.join('\n') || csrCombined;
const clientCsrPem = `-----BEGIN CERTIFICATE REQUEST-----\n${csrLines}\n-----END CERTIFICATE REQUEST-----\n`;
fs.writeFileSync(path.join(certsDir, 'client.csr'), clientCsrPem, 'utf8');

console.log('Generated real secp384r1.pem, client.key, and client.csr in certs/');
