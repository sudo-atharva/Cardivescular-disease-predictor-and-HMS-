#!/usr/bin/env node
/*
  Author: Atharva-Tikle
  Original Author: Atharva Tikle
  License: MIT
  Notice: No permission is granted to patent this code as yourself.
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const AUTHOR_TOKEN = 'Atharva-Tikle';

const DEFAULT_HEADER_LINES = [
  'Author: Atharva-Tikle',
  'Original Author: Atharva Tikle',
  'License: MIT',
  'Notice: No permission is granted to patent this code as yourself.'
];

const SUPPORTED_EXTS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.css', '.scss', '.sass',
  '.html', '.htm',
  '.md', '.markdown',
  '.yml', '.yaml',
  '.ino'
]);

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.next', '.turbo', '.vercel', 'dist', 'build', 'out', 'coverage'
]);

function makeHeaderForExt(ext) {
  const body = DEFAULT_HEADER_LINES.join('\n  ');
  switch (ext) {
    case '.css':
    case '.scss':
    case '.sass':
    case '.ts':
    case '.tsx':
    case '.js':
    case '.jsx':
    case '.mjs':
    case '.cjs':
    case '.ino':
      return `/*\n  ${body}\n*/\n`;
    case '.html':
    case '.htm':
    case '.md':
    case '.markdown':
      return `<!--\n  ${body}\n-->\n`;
    case '.yml':
    case '.yaml':
      return `# ${DEFAULT_HEADER_LINES.join('\n# ')}\n`;
    default:
      return null;
  }
}

function shouldSkipFile(filePath) {
  // Skip JSON, images, binaries, env files, lock files, configs that break with comments
  const basename = path.basename(filePath);
  const ext = path.extname(filePath);
  if (!SUPPORTED_EXTS.has(ext)) return true;
  if (basename.startsWith('.')) return false; // allow dot files if supported ext
  return false;
}

function walkDir(dir, files = []) {
  const ent = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of ent) {
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      files = walkDir(path.join(dir, e.name), files);
    } else if (e.isFile()) {
      const filePath = path.join(dir, e.name);
      if (!shouldSkipFile(filePath)) files.push(filePath);
    }
  }
  return files;
}

function hasAuthor(content) {
  return content.includes(AUTHOR_TOKEN);
}

function ensureHeader(filePath, strict = false) {
  const ext = path.extname(filePath);
  const header = makeHeaderForExt(ext);
  if (!header) return { changed: false, reason: 'unsupported' };
  const orig = fs.readFileSync(filePath, 'utf8');
  if (hasAuthor(orig)) return { changed: false, reason: 'present' };

  // Insert header at very top (comments before 'use client' are allowed)
  const updated = header + orig;
  fs.writeFileSync(filePath, updated, 'utf8');
  return { changed: true };
}

function verifyFile(filePath) {
  const ext = path.extname(filePath);
  if (!SUPPORTED_EXTS.has(ext)) return true; // ignore unsupported
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return hasAuthor(content);
  } catch {
    return false;
  }
}

function main() {
  const args = new Set(process.argv.slice(2));
  const doVerify = args.has('--verify');
  const doEnsure = args.has('--ensure') || !doVerify;
  const strict = args.has('--strict');

  const files = walkDir(ROOT);

  if (doEnsure) {
    let changed = 0;
    for (const f of files) {
      const res = ensureHeader(f, strict);
      if (res.changed) changed++;
    }
    console.log(`[ensure-author] Processed ${files.length} files. Updated ${changed}.`);
  }

  // Always verify at the end if --verify or --strict
  if (doVerify || strict) {
    const missing = [];
    for (const f of files) {
      if (!verifyFile(f)) missing.push(f);
    }
    if (missing.length) {
      console.error(`[ensure-author] ERROR: ${missing.length} files missing author token "${AUTHOR_TOKEN}"`);
      for (const m of missing.slice(0, 50)) {
        console.error(' - ' + path.relative(ROOT, m));
      }
      if (missing.length > 50) console.error(` ... and ${missing.length - 50} more`);
      process.exit(1);
    } else {
      console.log('[ensure-author] Verification passed.');
    }
  }
}

if (require.main === module) {
  main();
}
