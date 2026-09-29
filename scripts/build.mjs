import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');

if (existsSync(join(root, '.env.local'))) {
  for (const line of readFileSync(join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2');
    }
  }
}

const fields = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
  measurementId: 'FIREBASE_MEASUREMENT_ID'
};
const missing = Object.values(fields).filter(name => !process.env[name]);
if (missing.length) {
  throw new Error(`Firebase environment variables missing: ${missing.join(', ')}`);
}

const firebaseConfig = Object.fromEntries(
  Object.entries(fields).map(([field, name]) => [field, process.env[name]])
);
mkdirSync(join(output, 'css'), { recursive: true });
mkdirSync(join(output, 'js'), { recursive: true });
for (const name of readdirSync(root).filter(name => name.endsWith('.html'))) {
  copyFileSync(join(root, name), join(output, name));
}
copyFileSync(join(root, 'css', 'style.css'), join(output, 'css', 'style.css'));
for (const name of ['app.js', 'auth.js', 'mock-data.js', 'validation.js']) {
  copyFileSync(join(root, 'js', name), join(output, 'js', name));
}
writeFileSync(join(output, 'js', 'firebase-config.js'),
  `export const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};\n`);
console.log(`Built ${output}`);
