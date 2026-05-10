/**
 * Firebase Storage CORS Setup Script
 * Run: node setup-cors.mjs
 * Requirements: place service-account.json in this folder first
 */

import { existsSync, readFileSync } from 'fs';
import { config } from 'dotenv';

// Load .env
config();

// Check service account file
if (!existsSync('./service-account.json')) {
  console.error(`
❌ service-account.json not found!

Steps to get it:
1. Go to: https://console.firebase.google.com/project/portfolio-hamza7/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Save the file as "service-account.json" in this folder
4. Run this script again: node setup-cors.mjs
`);
  process.exit(1);
}

// Dynamic import of @google-cloud/storage
let Storage;
try {
  ({ Storage } = await import('@google-cloud/storage'));
} catch {
  console.log('📦 Installing @google-cloud/storage...');
  const { execSync } = await import('child_process');
  execSync('npm install @google-cloud/storage --no-save', { stdio: 'inherit' });
  ({ Storage } = await import('@google-cloud/storage'));
}

const storage = new Storage({ keyFilename: './service-account.json' });

const serviceAccount = JSON.parse(readFileSync('./service-account.json', 'utf8'));
const projectId = serviceAccount.project_id;

// Use bucket from .env or fallback to common formats
const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`;

console.log(`🚀 Setting up CORS for bucket: ${bucketName}...`);

const corsConfig = [
  {
    origin: [
      'https://for-hamza-alasd-q1n9.vercel.app',
      'https://for-hamza-alasd.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    maxAgeSeconds: 3600,
    responseHeader: [
      'Content-Type',
      'Authorization',
      'Content-Length',
      'User-Agent',
      'x-goog-resumable',
    ],
  },
];

async function setup() {
  const bucketCandidates = [
    process.env.VITE_FIREBASE_STORAGE_BUCKET,
    `${projectId}.appspot.com`,
    `${projectId}.firebasestorage.app`,
    projectId
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  console.log(`🔍 Checking candidates: ${bucketCandidates.join(', ')}`);

  let successCount = 0;

  for (const name of bucketCandidates) {
    try {
      console.log(`⏳ Attempting CORS for bucket: ${name}...`);
      const bucket = storage.bucket(name);
      await bucket.setCorsConfiguration(corsConfig);
      console.log(`✅ SUCCESS: CORS configured for gs://${name}`);
      successCount++;
    } catch (err) {
      if (err.code === 404) {
        console.log(`❌ SKIP: Bucket "${name}" not found.`);
      } else if (err.code === 403) {
        console.error(`🚫 PERMISSION DENIED for "${name}": Service account needs "Storage Admin" role.`);
      } else {
        console.error(`⚠️ ERROR for "${name}": ${err.message}`);
      }
    }
  }

  if (successCount === 0) {
    console.error('\n❌ Failed to configure CORS for any bucket.');
    console.error('Please visit Firebase Console > Storage and ensure you have a bucket created.');
    process.exit(1);
  } else {
    console.log(`\n🎉 Completed! CORS applied to ${successCount} bucket(s).`);
    console.log('Allowed origins:', corsConfig[0].origin);
  }
}

setup();
