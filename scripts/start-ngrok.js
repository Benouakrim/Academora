/**
 * ngrok tunnel script for local development
 * Exposes local server on port 3001 to the internet for webhook testing
 * 
 * Usage: node scripts/start-ngrok.js
 * 
 * Note: This script uses the ngrok binary directly via child_process.
 * Make sure ngrok is installed: https://ngrok.com/download
 * Or use: npm install -g ngrok
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3001;

// Note: Authtoken should be configured via 'ngrok config add-authtoken'
// We check for it in .env but it's already saved to ngrok config
console.log('💡 Note: Authtoken is saved to ngrok config file');

console.log('🚀 Starting ngrok tunnel...');
console.log(`📡 Exposing local server on port ${PORT}...\n`);

// Try to find ngrok in common locations

let ngrokPath = 'ngrok'; // Try PATH first

// Check common ngrok locations if not in PATH
const userHome = homedir();
const possiblePaths = [
  join(userHome, 'ngrok', 'ngrok.exe'), // Windows user install
  join(userHome, 'ngrok', 'ngrok'),      // Linux/Mac
  'ngrok.exe',                           // Current directory
  'ngrok',                               // Current directory
];

for (const path of possiblePaths) {
  if (existsSync(path)) {
    ngrokPath = path;
    break;
  }
}

// Build command - authtoken is already configured via 'ngrok config add-authtoken'
const args = ['http', PORT.toString()];

// Spawn ngrok process
const ngrokProcess = spawn(ngrokPath, args, {
  stdio: 'inherit',
  shell: true,
});

let urlFound = false;

// Listen for ngrok output (it prints the URL to stderr/stdout)
ngrokProcess.stdout?.on('data', (data) => {
  const output = data.toString();
  if (output.includes('https://') && output.includes('.ngrok')) {
    extractAndDisplayUrl(output);
  }
});

ngrokProcess.stderr?.on('data', (data) => {
  const output = data.toString();
  // ngrok prints to stderr
  if (output.includes('https://') && output.includes('.ngrok')) {
    extractAndDisplayUrl(output);
  }
  // Also print errors
  if (output.toLowerCase().includes('error')) {
    console.error('\n❌ ngrok error:', output);
  }
});

ngrokProcess.on('error', (error) => {
  if (error.code === 'ENOENT') {
    console.error('\n❌ ngrok not found!');
    console.error('\n📦 To install ngrok:');
    console.error('   Option 1 (Recommended): Download from https://ngrok.com/download');
    console.error('   Option 2: npm install -g ngrok');
    console.error('\n   Then add ngrok to your PATH or run from its directory\n');
  } else {
    console.error('\n❌ Error starting ngrok:', error.message);
  }
  process.exit(1);
});

ngrokProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\n❌ ngrok exited with code ${code}`);
  }
});

function extractAndDisplayUrl(output) {
  if (urlFound) return;
  
  // Try to extract URL from ngrok output
  const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.(ngrok|ngrok-free|ngrok\.io)[^\s]*/i);
  if (urlMatch) {
    const url = urlMatch[0];
    urlFound = true;
    
    console.log('\n✅ ngrok tunnel is active!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Public URL: ${url}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📋 Clerk Webhook Configuration:');
    console.log(`   Endpoint URL: ${url}/api/clerk-webhook\n`);
    
    console.log('⚠️  IMPORTANT:');
    console.log('   1. Copy the Endpoint URL above');
    console.log('   2. Go to Clerk Dashboard → Webhooks');
    console.log('   3. Create a new webhook with the URL above');
    console.log('   4. Subscribe to: user.created, user.updated, user.deleted');
    console.log('   5. Copy the webhook signing secret and add to .env as CLERK_WEBHOOK_SECRET\n');
    
    console.log('🛑 Press Ctrl+C to stop ngrok\n');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping ngrok...');
  ngrokProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  ngrokProcess.kill('SIGTERM');
  process.exit(0);
});
