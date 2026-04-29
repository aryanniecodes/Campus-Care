// ── Rule-based AI suggestion service ────────────────────────────────────────
// No external API required. Uses keyword matching to provide contextually
// relevant suggestions while typing a complaint.

const CATEGORY_RULES = [
  {
    category: "electric",
    keywords: ["light","bulb","fan","switch","socket","wire","power","current","electricity","shock","circuit","fuse","tube"],
    prompts: ["Is the light completely dead or just flickering?","Which room/area is affected?","Did you notice any burning smell?","Is it a single fitting or the whole area?"]
  },
  {
    category: "plumbing",
    keywords: ["water","leak","pipe","tap","drain","flush","toilet","sink","overflow","blockage","sewage","washroom","bathroom"],
    prompts: ["Is it a leak or a blockage?","Is there water on the floor?","Which floor/room is affected?","Is the issue in the washroom or kitchen area?"]
  },
  {
    category: "cleaning",
    keywords: ["dirty","garbage","waste","smell","odor","clean","sweep","dust","trash","litter","pest","cockroach","mosquito","rats"],
    prompts: ["How long has the issue been present?","Is it a specific room or a common area?","Is there a pest or just general uncleanliness?"]
  },
  {
    category: "civil",
    keywords: ["wall","crack","ceiling","roof","floor","door","window","glass","paint","broken","damage","leak","seepage"],
    prompts: ["Is there visible damage to the structure?","Is it affecting safety or just aesthetics?","Which specific location is affected?"]
  },
  {
    category: "internet",
    keywords: ["wifi","internet","network","router","connection","slow","signal","ethernet","cable","port"],
    prompts: ["Which room/lab is experiencing the issue?","Is it completely down or just slow?","Has it worked before in this location?"]
  }
];

const STOP_WORDS = new Set([
  "the","is","in","at","of","a","an","and","or","it","to","my","i",
  "was","has","not","with","for","on","are","this","that","be"
]);

const tokenize = (text = "") =>
  text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

// ── Generate suggestion based on typed text ──────────────────────────────────
const generateSuggestion = (text = "") => {
  const tokens = new Set(tokenize(text));

  let bestCategory = null;
  let bestScore = 0;
  let bestRule = null;

  for (const rule of CATEGORY_RULES) {
    const matches = rule.keywords.filter(k => tokens.has(k)).length;
    const score = matches / rule.keywords.length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = rule.category;
      bestRule = rule;
    }
  }

  if (!bestCategory || bestScore === 0) {
    return {
      detected: false,
      category: null,
      improvedDescription: null,
      prompts: [
        "Can you describe where exactly the issue is located?",
        "How long have you noticed this problem?",
        "Is this affecting your daily routine?"
      ]
    };
  }

  // Build an improved description template
  const improvedDescription = `There is a ${bestCategory} issue that requires attention. The problem involves: ${text.trim()}. Please inspect and resolve at the earliest.`;

  return {
    detected: true,
    category: bestCategory,
    improvedDescription,
    prompts: bestRule.prompts.slice(0, 3) // Return top 3 prompts
  };
};

module.exports = { generateSuggestion };
