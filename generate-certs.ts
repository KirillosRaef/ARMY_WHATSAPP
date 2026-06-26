/**
 * generate-certs.ts — Self-signed SSL certificate generator for offline LAN deployment.
 * 
 * Usage: bunx ts-node generate-certs.ts   OR   bun run generate-certs.ts
 *
 * Generates a CA + server certificate pair using OpenSSL. The server cert
 * includes SANs for the machine's local IP and localhost, enabling HTTPS
 * on the LAN without any internet connection.
 *
 * OpenSSL is typically available via Git for Windows at:
 *   C:\Program Files\Git\usr\bin\openssl.exe
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

function findOpenSSL(): string {
  // Try common locations on Windows
  const candidates = [
    'openssl',                                           // In PATH
    'C:\\Program Files\\Git\\usr\\bin\\openssl.exe',     // Git for Windows
    'C:\\Program Files (x86)\\Git\\usr\\bin\\openssl.exe',
    'C:\\OpenSSL-Win64\\bin\\openssl.exe',
    'C:\\OpenSSL-Win32\\bin\\openssl.exe',
  ];

  for (const candidate of candidates) {
    try {
      execSync(`"${candidate}" version`, { stdio: 'pipe' });
      return candidate;
    } catch {
      // Not found, try next
    }
  }

  throw new Error(
    'OpenSSL not found! Please install Git for Windows (includes OpenSSL) or add OpenSSL to your PATH.\n' +
    'Download Git: https://git-scm.com/download/win'
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

const certsDir = path.resolve(import.meta.dir, 'certs');
const localIp = getLocalIp();

console.log(`\n🔐 SSL Certificate Generator (Offline)`);
console.log(`   Local IP: ${localIp}`);
console.log(`   Output:   ${certsDir}\n`);

// Create certs directory
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const openssl = findOpenSSL();
console.log(`✅ Found OpenSSL: ${openssl}\n`);

const run = (cmd: string) => {
  // Set OPENSSL_CONF to prevent it from looking for configs in unexpected places (e.g. PostgreSQL)
  const opensslDir = path.dirname(openssl);
  const opensslCnfCandidates = [
    path.resolve(opensslDir, '..', 'ssl', 'openssl.cnf'),           // Git for Windows layout
    path.resolve(opensslDir, '..', 'etc', 'ssl', 'openssl.cnf'),
    path.resolve(opensslDir, 'openssl.cnf'),
  ];
  let opensslCnf = '';
  for (const c of opensslCnfCandidates) {
    if (fs.existsSync(c)) { opensslCnf = c; break; }
  }

  const env = { ...process.env };
  if (opensslCnf) {
    env.OPENSSL_CONF = opensslCnf;
  } else {
    // If we can't find the config, create a minimal one
    const minimalConf = path.join(certsDir, '_minimal_openssl.cnf');
    fs.writeFileSync(minimalConf, '# Minimal OpenSSL config\n[req]\ndistinguished_name = req_dn\n[req_dn]\n');
    env.OPENSSL_CONF = minimalConf;
  }

  execSync(cmd, { cwd: certsDir, stdio: 'pipe', env });
};

// 1. Generate CA private key
console.log('📋 Step 1/4: Generating CA private key...');
run(`"${openssl}" genrsa -out ca-key.pem 2048`);

// 2. Generate CA certificate (self-signed, valid 10 years)
console.log('📋 Step 2/4: Generating CA certificate...');
run(
  `"${openssl}" req -new -x509 -key ca-key.pem -out ca.pem -days 3650 ` +
  `-subj "/C=EG/ST=Cairo/L=Cairo/O=Army WhatsApp/OU=IT/CN=Army WhatsApp CA"`
);

// 3. Generate server private key + CSR with SANs
console.log('📋 Step 3/4: Generating server key and CSR...');
run(`"${openssl}" genrsa -out server-key.pem 2048`);

// Create an OpenSSL config file with SANs
const opensslConf = `[req]
distinguished_name = req_dn
req_extensions = v3_req
prompt = no

[req_dn]
C = EG
ST = Cairo
L = Cairo
O = Army WhatsApp
OU = IT
CN = ${localIp}

[v3_req]
subjectAltName = @alt_names

[alt_names]
IP.1 = ${localIp}
IP.2 = 127.0.0.1
DNS.1 = localhost
`;

fs.writeFileSync(path.join(certsDir, 'openssl.cnf'), opensslConf);

run(
  `"${openssl}" req -new -key server-key.pem -out server.csr ` +
  `-config openssl.cnf`
);

// 4. Sign the server certificate with the CA (valid 1 year)
console.log('📋 Step 4/4: Signing server certificate with CA...');

const extConf = `subjectAltName = IP:${localIp},IP:127.0.0.1,DNS:localhost`;
fs.writeFileSync(path.join(certsDir, 'ext.cnf'), extConf);

run(
  `"${openssl}" x509 -req -in server.csr -CA ca.pem -CAkey ca-key.pem ` +
  `-CAcreateserial -out server.pem -days 365 -extfile ext.cnf`
);

// Clean up temporary files
fs.unlinkSync(path.join(certsDir, 'server.csr'));
fs.unlinkSync(path.join(certsDir, 'openssl.cnf'));
fs.unlinkSync(path.join(certsDir, 'ext.cnf'));
fs.unlinkSync(path.join(certsDir, 'ca.srl'));

console.log('\n✅ Certificates generated successfully!');
console.log(`\n   📁 ${certsDir}`);
console.log(`   ├── ca-key.pem      (CA private key — keep secret)`);
console.log(`   ├── ca.pem          (CA certificate — import into browsers to trust)`);
console.log(`   ├── server-key.pem  (Server private key)`);
console.log(`   └── server.pem      (Server certificate)\n`);
console.log(`💡 To avoid browser warnings, import ca.pem into the Trusted Root`);
console.log(`   Certificate Authorities on each client machine.\n`);
console.log(`   Windows: certmgr.msc → Trusted Root Certification Authorities → Import`);
console.log(`   Or just click "Advanced" → "Proceed" in the browser warning.\n`);
