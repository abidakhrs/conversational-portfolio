import type { IntentResult, IntentType } from '@/types/portfolio';

// ─── Intent keyword map ───────────────────────────────────────────────
//
// Keywords are matched against normalised text (lowercase, punctuation
// stripped). A single-word keyword matches a whole token; a multi-word
// keyword matches as a phrase.

const intentKeywords: Record<Exclude<IntentType, 'UNKNOWN'>, string[]> = {
  GREETING: [
    'hi', 'hello', 'hey', 'yo', 'hiya', 'howdy', 'greetings',
    'good morning', 'good afternoon', 'good evening', 'good day',
  ],
  EDUCATION: [
    'education', 'study', 'studied', 'degree', 'university',
    'college', 'school', 'graduate', 'graduation', 'academic',
    'qualification', 'qualifications', 'pahang',
  ],
  EXPERIENCE: [
    'experience', 'work', 'worked', 'career', 'job', 'jobs',
    'position', 'role', 'roles', 'company', 'employer', 'industry',
    'professional', 'intern', 'internship', 'qa', 'tester', 'engineer',
    'developer',
  ],
  PROJECTS: [
    'project', 'projects', 'built', 'build', 'made', 'created',
    'application', 'app', 'website', 'showcase', 'developed',
    'portfolio',
  ],
  SKILLS: [
    'skill', 'skills', 'stack', 'tech', 'tools', 'tool', 'technology',
    'technologies', 'know', 'languages', 'frameworks', 'proficient',
    'expertise', 'abilities', 'capable', 'aws', 'react', 'typescript',
    'java', 'docker', 'sql', 'power bi', 'machine learning', 'gen ai',
    'nest', 'nestjs',
  ],
  CONTACT: [
    'contact', 'email', 'reach', 'hire', 'available', 'connect',
    'message', 'talk', 'touch', 'linkedin', 'github', 'social',
    'opportunity', 'recruit', 'recruiter', 'phone', 'whatsapp',
  ],
  BACK: ['back', 'return', 'previous', 'prev'],
  HOME: ['home', 'start', 'restart', 'beginning', 'reset', 'menu'],
  HELP: [
    'help', 'assist', 'support', 'guide', 'instructions',
    'what can you do', 'what can i ask',
  ],
  EXP_COGNIZANT: [
    'cognizant', 'loadrunner', 'performance testing', 'performance tester',
    'load testing', 'stress testing', 'vba tool', 'nft',
  ],
  EXP_DELOITTE: [
    'deloitte', 'big four', 'micro front end', 'microfrontend',
    'spring boot', 'kafka', 'atomic design', 'next generation banking',
  ],
  EXP_FIFWAY: ['fifway', 'port', 'vessel', 'pelabuhan', 'kapal', 'maritime'],
  PROJ_NIKOH: ['nikoh', 'wedding', 'marketplace', 'resend', 'gemini ai', 'gemini'],
  PROJ_WARNA: ['warna', 'asmara', 'corporate'],
  PROJ_TRANSACTION: [
    'transaction generator', 'comparison tool', 'vba macro', 'name generator',
    'transaction tool',
  ],
  EDU_BACHELOR: ['bachelor', 'umpsa', 'computer system', 'networking', 'final year project'],
  EDU_DIPLOMA: ['diploma', 'cgpa'],
};

// ─── Entity resolution ────────────────────────────────────────────────
//
// Entity intents map 1:1 onto a concrete record. Keeping this next to the
// keyword map means the router never has to re-derive the record id.

const entityIds: Partial<Record<IntentType, { kind: 'edu' | 'exp' | 'project'; id: string }>> = {
  EXP_COGNIZANT: { kind: 'exp', id: 'cognizant-intern' },
  EXP_DELOITTE: { kind: 'exp', id: 'deloitte-intern' },
  EXP_FIFWAY: { kind: 'exp', id: 'fifway-dev' },
  PROJ_NIKOH: { kind: 'project', id: 'nikoh' },
  PROJ_WARNA: { kind: 'project', id: 'warna-asmara' },
  PROJ_TRANSACTION: { kind: 'project', id: 'transaction-generator' },
  EDU_BACHELOR: { kind: 'edu', id: 'bachelor' },
  EDU_DIPLOMA: { kind: 'edu', id: 'diploma' },
};

// ─── Tiers ────────────────────────────────────────────────────────────
//
// Category intents describe a section; entity intents name a specific
// record. Entity matches are strictly stronger, so a "work" query that
// also mentions "nikoh" resolves to the project rather than the section.
// The gap also breaks the degree/EDU_BACHELOR tie in favour of the entity.

const TIERS: Partial<Record<IntentType, 'category' | 'entity'>> = {
  EDUCATION: 'category',
  EXPERIENCE: 'category',
  PROJECTS: 'category',
  SKILLS: 'category',
  CONTACT: 'category',
  EXP_COGNIZANT: 'entity',
  EXP_DELOITTE: 'entity',
  EXP_FIFWAY: 'entity',
  PROJ_NIKOH: 'entity',
  PROJ_WARNA: 'entity',
  PROJ_TRANSACTION: 'entity',
  EDU_BACHELOR: 'entity',
  EDU_DIPLOMA: 'entity',
};

function tierOf(intent: IntentType): 'category' | 'entity' {
  return TIERS[intent] ?? 'category';
}

// ─── Normalise text ───────────────────────────────────────────────────

function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Score one intent ─────────────────────────────────────────────────

const EXACT = 2;
const PARTIAL = 1;

// Cheap typo tolerance: two strings within one edit (transposition counts
// as one) are treated as the same word. Used only for near-misses so real
// matches always win.
function nearMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;

  // Same length: allow a single substitution or transposition.
  if (a.length === b.length) {
    let diff = -1;
    for (let i = 0; i < a.length; i++) {
      if (a[i] === b[i]) continue;
      if (diff !== -1) {
        // Second difference must be an adjacent swap of the first.
        return (
          diff === i - 1 &&
          a[diff] === b[i] &&
          a[i] === b[diff]
        );
      }
      diff = i;
    }
    return true;
  }

  // Length differs by one: one insertion or deletion.
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let skipped = false;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) {
      i++;
      j++;
      continue;
    }
    if (skipped) return false;
    skipped = true;
    j++;
  }
  return true;
}

function scoreIntent(tokens: string[], fullText: string, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    if (kw.includes(' ')) {
      // Multi-word keyword — match as a phrase anywhere in the text.
      if (fullText.includes(kw)) score += EXACT;
      continue;
    }
    if (tokens.includes(kw)) {
      score += EXACT;
      continue;
    }
    // Allow a near-miss so small typos and plurals still match
    // ("skils" -> "skills", "sklils" -> "skills", "frameworks" -> "framework").
    if (kw.length > 3 && tokens.some((t) => t.length > 3 && nearMatch(t, kw))) {
      score += PARTIAL;
    }
  }
  return score;
}

// ─── Short commands ───────────────────────────────────────────────────

const SHORT_COMMANDS: Partial<Record<string, IntentType>> = {
  back: 'BACK',
  'go back': 'BACK',
  previous: 'BACK',
  prev: 'BACK',
  home: 'HOME',
  start: 'HOME',
  restart: 'HOME',
  reset: 'HOME',
  menu: 'HOME',
  help: 'HELP',
  'what can you do': 'HELP',
  'what can i ask': 'HELP',
};

// ─── Main detectIntent ────────────────────────────────────────────────

export function detectIntent(input: string): IntentResult {
  const normalised = normalise(input);
  const tokens = normalised.split(' ').filter(Boolean);

  // A bare command word should never be outvoted by keyword scoring, but
  // only when the whole message is the command ("menu", not "back up your
  // data" or "the start of my career").
  const command = SHORT_COMMANDS[normalised];
  if (command) return { intent: command, confidence: 1 };

  const normalisedScores: Partial<Record<IntentType, number>> = {};

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    const score = scoreIntent(tokens, normalised, keywords);
    // Normalise into 0..1 so a long keyword list cannot simply accumulate
    // its way past a precise match. Each additional hit adds evidence but
    // with diminishing weight, capped at 1.
    const hits = score / EXACT;
    normalisedScores[intent as IntentType] = hits <= 0 ? 0 : 1 - 0.5 ** hits;
  }

  // Rank by normalised score. This is what lets "transaction generator"
  // (one phrase hit, normalised 1.0) beat a generic "project"/"tool" hit,
  // and what breaks the "degree" tie in favour of the entity intent.
  const sorted = Object.entries(normalisedScores).sort(([aIntent, a], [bIntent, b]) => {
    if (b !== a) return (b as number) - (a as number);
    const aEntity = tierOf(aIntent as IntentType) === 'entity' ? 1 : 0;
    const bEntity = tierOf(bIntent as IntentType) === 'entity' ? 1 : 0;
    return bEntity - aEntity;
  });

  const [topIntent, topScore = 0] = (sorted[0] ?? ['UNKNOWN', 0]) as [IntentType, number];
  const secondScore = (sorted[1]?.[1] as number) ?? 0;

  if (topScore === 0) return { intent: 'UNKNOWN', confidence: 0 };

  // Prefer a named record over a generic section when the two are close.
  // "transaction generator tool" matches PROJECTS twice generically and
  // PROJ_TRANSACTION once precisely; the specific project is the better
  // answer, and "what about your degree" prefers the bachelor record over
  // the education section. The entity must still be in the running (within
  // one partial hit of the leader) so an unrelated section never wins.
  const ENTITY_TOLERANCE = 0.2;
  let resolvedIntent = topIntent;
  if (tierOf(topIntent) === 'category') {
    for (let i = 1; i < sorted.length; i++) {
      const [candidate, candidateScore] = sorted[i] as [IntentType, number];
      if (topScore - candidateScore > ENTITY_TOLERANCE) break;
      if (tierOf(candidate) === 'entity') {
        resolvedIntent = candidate;
        break;
      }
    }
  }

  // Confidence combines evidence strength with decisiveness. A single
  // exact hit is decent (0.6) but not certain; more matching keywords raise
  // it, and a clear lead over second place raises it further. This keeps
  // the score meaningful instead of pinning every real match to 1.
  const evidence = Math.min(0.6 + (topScore - 1) * 0.25, 1);
  const margin = (topScore - secondScore) / Math.max(topScore, 1);
  const confidence = Math.min(evidence + margin * 0.2, 1);
  if (confidence < 0.15) return { intent: 'UNKNOWN', confidence };

  const entity = entityIds[resolvedIntent];

  return {
    intent: resolvedIntent,
    confidence: Math.round(confidence * 100) / 100,
    entityId: entity?.id,
  };
}
