/**
 * ASL Grammar Restructure
 * Converts English sentences into ASL-style word order and vocabulary.
 * Used after speech recognition: "I am going to class" → "ME GO CLASS"
 * No LLM required for hackathon; rule-based is enough for demo.
 */

const REPLACEMENTS: [RegExp, string][] = [
  // Pronouns and subject → ASL equivalents
  [/\bI\s+am\b/gi, "ME"],
  [/\bI'm\b/gi, "ME"],
  [/\bI\b/g, "ME"],
  [/\bmy\s+name\s+is\b/gi, "NAME ME"],
  [/\bmy\s+name's\b/gi, "NAME ME"],
  [/\bwhat\s+is\s+your\s+name\b/gi, "YOUR NAME"],
  [/\byour\s+name\b/gi, "YOUR NAME"],
  [/\bgoing\s+to\b/gi, "GO"],
  [/\bgoing\b/gi, "GO"],
  [/\bam\s+going\b/gi, "GO"],
  [/\bclass\b/gi, "CLASS"],
  [/\bschool\b/gi, "SCHOOL"],
  [/\bwork\b/gi, "WORK"],
  [/\bneed\s+help\b/gi, "HELP"],
  [/\bneed\s+assistance\b/gi, "ASSISTANCE"],
  [/\bi\s+need\b/gi, "ME NEED"],
  [/\bplease\s+help\b/gi, "PLEASE HELP"],
  [/\bthank\s+you\s+very\s+much\b/gi, "THANK YOU"],
  [/\bthanks\s+so\s+much\b/gi, "THANK YOU"],
  [/\bnice\s+to\s+meet\s+you\b/gi, "NICE MEET YOU"],
  [/\bhow\s+are\s+you\b/gi, "HOW YOU"],
  [/\bhow\s+are\s+ya\b/gi, "HOW YOU"],
  [/\bgood\s+morning\b/gi, "GOOD MORNING"],
  [/\bgood\s+night\b/gi, "GOOD NIGHT"],
  [/\bcall\s+911\b/gi, "EMERGENCY"],
  [/\bemergency\b/gi, "EMERGENCY"],
  [/\bi\s+am\s+deaf\b/gi, "DEAF"],
  [/\bdeaf\s+\/\s+hard\s+of\s+hearing\b/gi, "DEAF"],
  [/\bhard\s+of\s+hearing\b/gi, "DEAF"],
];

/** Drop articles and common filler words */
const DROP_WORDS = new Set(
  "a an the to is are was were be been being have has had do does did will would could should can may might must shall of in on at by for with about into through during".split(
    " "
  )
);

/**
 * Restructure English text into ASL-style word sequence.
 * Example: "I am going to class" → "ME GO CLASS"
 */
export function restructureToASLGrammar(text: string): string {
  if (!text || !text.trim()) return "";

  let out = text.trim();

  // Apply phrase replacements (order matters; longer first)
  for (const [re, replacement] of REPLACEMENTS) {
    out = out.replace(re, replacement);
  }

  // Normalize: uppercase for consistency, split, drop articles/filler, rejoin
  const words = out
    .toUpperCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\w]/g, ""))
    .filter((w) => w.length > 0 && !DROP_WORDS.has(w.toLowerCase()));

  return words.join(" ");
}
