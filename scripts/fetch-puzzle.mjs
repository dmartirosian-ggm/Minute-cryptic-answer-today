// Fetches today's Minute Cryptic puzzle and saves it to src/data/puzzles/YYYY-MM-DD.json.
//
// Usage:
//   node scripts/fetch-puzzle.mjs                 fetch today's puzzle (US Eastern time)
//   node scripts/fetch-puzzle.mjs --tz Europe/London
//   node scripts/fetch-puzzle.mjs --from raw.json  normalize a saved API response instead of fetching
//
// Exits 0 whether or not the puzzle was new. Exits 1 on a failed fetch so the
// GitHub Action fails loudly (and emails you) instead of silently skipping a day.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src', 'data', 'puzzles');

const args = process.argv.slice(2);
const argVal = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const tz = argVal('--tz') || 'America/New_York';
const fromFile = argVal('--from');

// The clue-type wording in the source hints is mapped to our own labels and
// explanations, so the site's text is written by us rather than copied.
const INDICATOR_TYPES = [
  ['hidden', /hidden|hiding/i],
  ['anagram', /anagram/i],
  ['homophone', /homophone|sounds? like|soundalike/i],
  ['container', /contain|packing|pack some|inside|insertion|insert/i],
  ['reversal', /revers|backwards/i],
  ['deletion', /delet|remov|drop/i],
  ['initials', /first letters|initial letters|acrostic/i],
  ['finals', /last letters|final letters/i],
  ['alternate', /alternat|every other|odd letters|even letters/i],
  ['selection', /select|take some letters|selection/i],
  ['charade', /charade|combin|put together|join/i],
  ['double', /double definition/i],
];

function detectTypes(text) {
  if (!text) return [];
  return INDICATOR_TYPES.filter(([, re]) => re.test(text)).map(([name]) => name);
}

function normalize(raw) {
  if (!raw || !raw.date || !raw.answer || !Array.isArray(raw.clue)) {
    throw new Error('Unexpected API response shape');
  }
  const clue = raw.clue.map((w) => w.text).join(' ');
  const spansFor = (type) =>
    (raw.hints || [])
      .filter((h) => h.type === type)
      .flatMap((h) => (h.highlighting || []).map(([a, b]) => clue.slice(a, b).trim()))
      .filter(Boolean);
  const indicatorHint = (raw.hints || []).find((h) => h.type === 'indicators');

  return {
    date: raw.date,
    clue,
    answer: String(raw.answer).toUpperCase(),
    enumeration: Array.isArray(raw.config) ? raw.config : [String(raw.answer).length],
    par: raw.par ?? null,
    setter: (raw.setterName || '').replace(/^Member:\s*/i, '') || null,
    definition: spansFor('definition'),
    indicators: spansFor('indicators'),
    fodder: spansFor('fodder'),
    clueTypes: detectTypes(indicatorHint?.text),
    video: raw.explainerVideo || null,
    solveCount: raw.parDetails?.solveCount ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchRaw() {
  const url = `https://www.minutecryptic.com/api/daily_puzzle/today?tz=${encodeURIComponent(tz)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status}`);
  return res.json();
}

try {
  const raw = fromFile ? JSON.parse(fs.readFileSync(fromFile, 'utf8')) : await fetchRaw();
  const puzzle = normalize(raw);
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${puzzle.date}.json`);

  if (fs.existsSync(file)) {
    const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (existing.answer === puzzle.answer && existing.clue === puzzle.clue) {
      console.log(`No change: ${puzzle.date} already saved (${puzzle.answer}).`);
      process.exit(0);
    }
  }
  fs.writeFileSync(file, JSON.stringify(puzzle, null, 2) + '\n');
  console.log(`Saved ${puzzle.date}: ${puzzle.answer}`);
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}
