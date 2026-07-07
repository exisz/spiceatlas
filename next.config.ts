import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

type SpiceRecord = {
  name: string;
  type: string;
  description?: string;
  pairings?: string[];
  substitutes?: string[];
};

const dataPath = path.join(process.cwd(), "src/data/spices.json");
const spices = JSON.parse(fs.readFileSync(dataPath, "utf8")) as SpiceRecord[];
const names = new Set(spices.map((spice) => spice.name.toLowerCase()));
const badHerbSubstitutes = new Set(["cinnamon", "nutmeg", "allspice", "black pepper"]);
const foodOnlySubstitutes = new Set(["ham", "salmon", "cucumber", "yogurt", "lamb", "lemon", "salt", "butter", "apple"]);
const duplicateLimit = 8;
const bannedDescriptionFragments = [
  "It is included in SpiceAtlas because",
  "rather than a generic Wikipedia navigation entry",
  "Start with a small amount, taste as the aroma opens up",
  "SpiceAtlas treats",
  "distinct seasoning note",
  "If a recipe needs a substitute",
];
const countBy = (values: string[][]) =>
  values.reduce<Record<string, number>>((counts, value) => {
    const key = value.join("|").toLowerCase();
    counts[key] = key ? (counts[key] ?? 0) + 1 : 0;
    return counts;
  }, {});
const reusedTooOften = (counts: Record<string, number>) =>
  Object.entries(counts).filter(([, count]) => count > duplicateLimit).map(([key, count]) => `${key} (${count}x)`);
const duplicateDescriptions = (records: SpiceRecord[]) => {
  const counts = records.reduce<Record<string, number>>((acc, spice) => {
    const key = (spice.description ?? "").replace(/\s+/g, " ").trim().toLowerCase();
    if (key) acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).filter(([, count]) => count > 1).map(([key, count]) => `${key.slice(0, 80)}... (${count}x)`);
};
const dataErrors = [
  ...["bell pepper", "cinnamon sugar", "garlic salt"].filter((name) => names.has(name)).map((name) => `${name} is a boundary item, not a main-index spice.`),
  ...spices
    .filter((spice) => spice.type === "herb")
    .filter((spice) => (spice.substitutes ?? []).some((item) => badHerbSubstitutes.has(item.toLowerCase())))
    .map((spice) => `${spice.name} has cross-category herb substitutes.`),
  ...spices
    .filter((spice) => (spice.substitutes ?? []).some((item) => foodOnlySubstitutes.has(item.toLowerCase())))
    .map((spice) => `${spice.name} uses food-only substitute entries.`),
  ...spices
    .filter((spice) => bannedDescriptionFragments.some((fragment) => (spice.description ?? "").includes(fragment)))
    .map((spice) => `${spice.name} still has self-referential template description text.`),
  ...duplicateDescriptions(spices).map((item) => `duplicate description: ${item}`),
  ...reusedTooOften(countBy(spices.map((spice) => spice.pairings ?? []))).map((item) => `pairings reused too often: ${item}`),
  ...reusedTooOften(countBy(spices.map((spice) => spice.substitutes ?? []))).map((item) => `substitutes reused too often: ${item}`),
];

if (dataErrors.length > 0) {
  throw new Error(`Spice data validation failed:\n- ${dataErrors.join("\n- ")}`);
}

const nextConfig: NextConfig = {
  // ISR: 600+ spice pages > 500 threshold, must use ISR
  async redirects() {
    return [
      {
        source: "/pairing",
        destination: "/pairings",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
