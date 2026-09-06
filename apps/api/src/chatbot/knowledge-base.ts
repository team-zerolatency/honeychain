export interface KnowledgeEntry {
  topic: string;
  keywords: string[];
  content: string;
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    topic: "what is honey chain",
    keywords: ["what", "honey", "chain", "about", "project", "does"],
    content:
      "Honey Chain is a blockchain-based honey traceability and smart beekeeping management platform, built for SIH 2026 (problem statement SIH26021), in the context of the Ministry of MSME and KVIC's Honey Mission. It tracks honey from hive to consumer using QR + scratch code verification, IoT hive sensors, and blockchain-recorded lifecycle events.",
  },
  {
    topic: "how verification works",
    keywords: ["verify", "verification", "qr", "scratch", "code", "scan", "check"],
    content:
      "To verify a bottle, scan the QR code on the label or enter its code manually, then enter the scratch code found under the bottle's scratch panel. The system checks the scratch code against a securely stored hash, checks the bottle's lifecycle status, and checks scan history, then returns one of three outcomes: GREEN, YELLOW, or RED.",
  },
  {
    topic: "verification outcomes meaning",
    keywords: ["green", "yellow", "red", "outcome", "result", "mean", "caution"],
    content:
      "GREEN means the product record is verified with no anomaly detected. YELLOW means the scratch code was correct but something warrants caution — for example the bottle hasn't reached the 'available for sale' stage yet, or it's been scanned unusually often or in rapid succession. RED means the QR code or scratch code is invalid, or doesn't match. A YELLOW result is not proof of counterfeiting by itself — genuine bottles can be scanned by multiple people.",
  },
  {
    topic: "lifecycle stages",
    keywords: ["lifecycle", "stage", "stages", "harvested", "extracted", "packed", "dispatched", "received", "sale", "journey"],
    content:
      "Every batch and bottle moves through six stages in strict order: Harvested, Extracted, Packed, Dispatched, Received, and Available for sale. Stages cannot be skipped — the system rejects any attempt to jump ahead or go backward.",
  },
  {
    topic: "roles and accounts",
    keywords: ["account", "beekeeper", "role", "admin", "kvic", "store", "owner", "register", "login", "id", "password"],
    content:
      "Honey Chain has four roles. Admin/KVIC issues Beekeeper accounts, giving each beekeeper a unique Beekeeper ID and a temporary password. Beekeepers, in turn, issue Store Owner accounts the same way, providing the store's name and location. Both Beekeepers and Store Owners log in using their issued ID and password rather than an email — there is no public self-registration. Consumers need no account at all to verify a product.",
  },
  {
    topic: "blockchain",
    keywords: ["blockchain", "chain", "on-chain", "hash", "tx", "transaction", "audit", "besu"],
    content:
      "Critical lifecycle events (batch/bottle registration, stage transitions, quality certificates) are recorded on a blockchain for tamper-evident audit purposes. Raw sensor data and everyday application data stay off-chain in the main database for performance. The prototype targets Hyperledger Besu; production deployment would use a permissioned government blockchain network, chosen in consultation with MSME/KVIC stakeholders.",
  },
  {
    topic: "hive sensors and AI",
    keywords: ["sensor", "hive", "temperature", "humidity", "weight", "ai", "anomaly", "yield", "prediction", "esp32"],
    content:
      "Each hive can be fitted with a sensor node (ESP32 with a BME280 temperature/humidity sensor and a load cell) that reports readings automatically. An AI model analyzes these readings to flag possible anomalies (like unusual temperature spikes) and to estimate expected honey yield over the next week.",
  },
  {
    topic: "who built this",
    keywords: ["who", "built", "team", "made", "developer", "zerolatency"],
    content:
      "Honey Chain is built by Team ZeroLatency for Smart India Hackathon 2026.",
  },
];

const STOPWORDS = new Set(["the", "a", "an", "is", "are", "do", "does", "how", "what", "of", "to", "in", "for", "on", "it", "and"]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

export function retrieveRelevantContext(question: string, topN = 3): string {
  const questionTokens = new Set(tokenize(question));
  const scored = KNOWLEDGE_BASE.map((entry) => {
    const entryTokens = tokenize(entry.topic + " " + entry.keywords.join(" ") + " " + entry.content);
    const overlap = entryTokens.filter((t) => questionTokens.has(t)).length;
    return { entry, score: overlap };
  });

  const relevant = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((s) => s.entry);

  // No keyword hit at all — still ground the model in the general overview rather than
  // letting it answer from nothing.
  const overview = KNOWLEDGE_BASE[0];
  const chosen = relevant.length > 0 ? relevant : overview ? [overview] : [];
  return chosen.map((e) => `[${e.topic}]\n${e.content}`).join("\n\n");
}