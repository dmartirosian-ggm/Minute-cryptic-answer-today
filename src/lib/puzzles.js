// Loads every saved puzzle and exposes helpers the pages share.

const modules = import.meta.glob('../data/puzzles/*.json', { eager: true });

/** Today's date in US Eastern time, as YYYY-MM-DD. */
export function todayEastern() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// Never publish a puzzle before its day has started in the US.
// Some build runtimes freeze the clock at 1970 outside a request; if the clock
// looks wrong, skip the date check rather than hiding every puzzle.
const now = todayEastern();
const cutoff = now >= '2026-01-01' ? now : '9999-12-31';

export const puzzles = Object.values(modules)
  .map((m) => m.default ?? m)
  .filter((p) => p.date <= cutoff)
  .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

export const latest = puzzles[0];

export function neighbours(date) {
  const i = puzzles.findIndex((p) => p.date === date);
  return {
    newer: i > 0 ? puzzles[i - 1] : null,
    older: i >= 0 && i < puzzles.length - 1 ? puzzles[i + 1] : null,
  };
}

const asUTC = (date) => new Date(`${date}T12:00:00Z`);

export function longDate(date) {
  return asUTC(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function shortDate(date) {
  return asUTC(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function monthKey(date) {
  return asUTC(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export const enumeration = (p) => `(${p.enumeration.join(', ')})`;

export function letterCount(p) {
  return p.enumeration.reduce((a, b) => a + b, 0);
}

export function lengthPhrase(p) {
  const total = letterCount(p);
  if (p.enumeration.length === 1) return `a single ${total}-letter word`;
  return `${p.enumeration.length} words (${p.enumeration.join(' + ')} letters, ${total} in total)`;
}

/** The answer split into words to match the enumeration, e.g. ["CASH", "REGISTER"]. */
export function answerWords(p) {
  const letters = p.answer.replace(/[^A-Z]/g, '');
  const out = [];
  let i = 0;
  for (const n of p.enumeration) {
    out.push(letters.slice(i, i + n));
    i += n;
  }
  return out;
}

export const quote = (parts) => parts.map((s) => `“${s}”`).join(' and ');

// Plain-English notes for each kind of wordplay. Our own wording.
export const CLUE_TYPES = {
  hidden: {
    label: 'Hidden word',
    note: 'The answer is sitting inside the clue, spelled out in a row across one or more words. Ignore the spaces and punctuation and look for it.',
  },
  anagram: {
    label: 'Anagram',
    note: 'Some of the letters in the clue need to be rearranged to spell the answer.',
  },
  homophone: {
    label: 'Homophone',
    note: 'Part of the answer sounds like a word in the clue, even though it is spelled differently.',
  },
  container: {
    label: 'Container',
    note: 'One piece of the answer goes inside another piece.',
  },
  reversal: {
    label: 'Reversal',
    note: 'A word or string of letters is read backwards to form part of the answer.',
  },
  deletion: {
    label: 'Deletion',
    note: 'Letters are taken away from a word to leave part of the answer.',
  },
  initials: {
    label: 'First letters',
    note: 'The first letters of several words in the clue spell out part of the answer.',
  },
  finals: {
    label: 'Last letters',
    note: 'The last letters of several words in the clue spell out part of the answer.',
  },
  alternate: {
    label: 'Alternate letters',
    note: 'Every other letter of a stretch of the clue spells out part of the answer.',
  },
  selection: {
    label: 'Letter selection',
    note: 'Only some of the letters of a word in the clue are used.',
  },
  charade: {
    label: 'Charade',
    note: 'The answer is built by joining smaller pieces together, one after another.',
  },
  double: {
    label: 'Double definition',
    note: 'The clue gives two separate definitions of the same answer.',
  },
};

export function typeLabels(p) {
  return (p.clueTypes || []).map((t) => CLUE_TYPES[t]?.label).filter(Boolean);
}
