const { v4: uuidv4 } = require("uuid");
const Complaint = require("../models/Complaint");

// ── Stop-words to ignore during keyword extraction ──────────────────────────
const STOP_WORDS = new Set([
  "the","is","in","at","of","a","an","and","or","it","to","my","i",
  "was","has","have","not","with","for","on","are","this","that","be",
  "from","by","room","block","floor","hostel","college"
]);

const SIMILARITY_THRESHOLD = 0.25; // 25% keyword overlap triggers cluster match

// ── Extract meaningful keywords from text ───────────────────────────────────
const extractKeywords = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
};

// ── Jaccard similarity between two keyword sets ─────────────────────────────
const jaccardSimilarity = (setA, setB) => {
  const a = new Set(setA);
  const b = new Set(setB);
  const intersection = [...a].filter(x => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
};

// ── Main clustering function ─────────────────────────────────────────────────
// Compares new complaint against existing open complaints.
// Returns: { clusterId, keywords }
const clusterComplaint = async (title = "", description = "") => {
  try {
    const newKeywords = extractKeywords(`${title} ${description}`);

    // Only compare against recent, unresolved complaints (performance guard)
    const candidates = await Complaint.find({
      status: { $ne: "completed" },
      clusterId: { $ne: null }
    })
    .select("clusterId keywords category")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

    let bestMatch = null;
    let bestScore = 0;

    for (const candidate of candidates) {
      if (!candidate.keywords?.length) continue;
      const score = jaccardSimilarity(newKeywords, candidate.keywords);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    const clusterId =
      bestScore >= SIMILARITY_THRESHOLD
        ? bestMatch.clusterId
        : uuidv4(); // New cluster for unique complaint

    return { clusterId, keywords: newKeywords };
  } catch {
    // Non-blocking — return a new cluster on any error
    return { clusterId: uuidv4(), keywords: [] };
  }
};

module.exports = { clusterComplaint };
