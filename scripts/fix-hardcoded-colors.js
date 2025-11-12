/**
 * Script to replace hardcoded Tailwind color classes with CSS variable references
 * This fixes the issue where hardcoded classes override the theme system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define replacements
const replacements = [
  // Background colors
  { pattern: /className="([^"]*)\bbg-black\b([^"]*)"/g, replace: 'className="$1bg-[var(--color-bg-primary)]$2"' },
  { pattern: /className='([^']*)\bbg-black\b([^']*)'/g, replace: "className='$1bg-[var(--color-bg-primary)]$2'" },
  
  { pattern: /className="([^"]*)\bbg-gray-900\b([^"]*)"/g, replace: 'className="$1bg-[var(--color-bg-secondary)]$2"' },
  { pattern: /className='([^']*)\bbg-gray-900\b([^']*)'/g, replace: "className='$1bg-[var(--color-bg-secondary)]$2'" },
  
  // Text colors (only replace standalone text-white, not hover/focus states)
  { pattern: /className="([^"]*)\btext-white\b(?!\S)/g, replace: 'className="$1text-[var(--color-text-primary)]' },
  { pattern: /className='([^']*)\btext-white\b(?!\S)/g, replace: "className='$1text-[var(--color-text-primary)]" },
  
  // Border colors
  { pattern: /\bborder-white\/(\d+)\b/g, replace: 'border-[var(--color-border-primary)]/opacity-$1' },
  { pattern: /\bborder-gray-800\b/g, replace: 'border-[var(--color-border-secondary)]' },
  { pattern: /\bborder-gray-700\b/g, replace: 'border-[var(--color-border-tertiary)]' },
];

// Files to process
const targetDirs = [
  'src/pages',
  'src/components'
];

let totalChanges = 0;

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let fileChanges = 0;

  replacements.forEach(({ pattern, replace }) => {
    const matches = newContent.match(pattern);
    if (matches) {
      fileChanges += matches.length;
      newContent = newContent.replace(pattern, replace);
    }
  });

  if (fileChanges > 0) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ ${path.relative(process.cwd(), filePath)}: ${fileChanges} changes`);
    totalChanges += fileChanges;
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) {
      processFile(fullPath);
    }
  }
}

console.log('🔍 Scanning for hardcoded color classes...\n');

targetDirs.forEach(dir => {
  const fullPath = path.resolve(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    processDirectory(fullPath);
  }
});

console.log(`\n✨ Complete! Made ${totalChanges} replacements across the codebase.`);
console.log('\n⚠️  IMPORTANT: Review changes manually and test thoroughly!');
console.log('   Some hardcoded colors may be intentional (modals, overlays).');
