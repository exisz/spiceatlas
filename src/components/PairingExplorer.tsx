"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface Spice {
  name: string;
  slug: string;
  type: string;
  cuisines?: string[];
  flavors: string[];
  pairings: string[];
  heatLevel: number;
  description: string;
  substitutes?: string[];
}

type PairingMatch = Spice & {
  sharedPairings: string[];
  sharedFlavors: string[];
  sharedCuisines: string[];
  substituteHits: string[];
  score: number;
  strength: "strong" | "good" | "light";
};

const QUICK_SLUGS = [
  "basil",
  "black-pepper",
  "cinnamon",
  "cardamom",
  "cumin",
  "coriander-leaf",
  "ginger",
  "turmeric",
  "oregano",
  "rosemary",
  "thyme",
  "paprika",
  "cayenne",
  "saffron",
  "nutmeg",
  "cloves",
];

const normalize = (value: string) => value.trim().toLowerCase();

function cuisineLabel(cuisine: string) {
  return cuisine === "all" ? "All cuisines" : cuisine;
}

function getStrength(score: number): PairingMatch["strength"] {
  if (score >= 8) return "strong";
  if (score >= 4) return "good";
  return "light";
}

function explainMatch(match: PairingMatch, selectedName: string) {
  const reasons = [];

  if (match.sharedPairings.length > 0) {
    reasons.push(`both work with ${match.sharedPairings.slice(0, 3).join(", ")}`);
  }

  if (match.sharedFlavors.length > 0) {
    reasons.push(`shared ${match.sharedFlavors.slice(0, 2).join("/")} flavor notes`);
  }

  if (match.sharedCuisines.length > 0) {
    reasons.push(`common in ${match.sharedCuisines.slice(0, 2).join(" and ")} cooking`);
  }

  if (match.substituteHits.length > 0) {
    reasons.push(`can substitute in ${match.substituteHits[0]}-style dishes`);
  }

  return reasons.length > 0
    ? reasons.join("; ")
    : `${match.name} has a compatible profile with ${selectedName}.`;
}

export function PairingExplorer({ spices }: { spices: Spice[] }) {
  const [selected, setSelected] = useState<string>("");
  const [query, setQuery] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [heatFilter, setHeatFilter] = useState("all");

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = normalize(query);
    return spices.filter((s) => normalize(s.name).includes(q)).slice(0, 10);
  }, [query, spices]);

  const selectedSpice = useMemo(
    () => spices.find((s) => s.slug === selected),
    [selected, spices]
  );

  const cuisines = useMemo(() => {
    const values = new Set<string>();
    spices.forEach((spice) => spice.cuisines?.forEach((cuisine) => values.add(cuisine)));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [spices]);

  const quickPicks = useMemo(
    () => QUICK_SLUGS.map((quickSlug) => spices.find((s) => s.slug === quickSlug)).filter((s): s is Spice => Boolean(s)),
    [spices]
  );

  const pairingMatches = useMemo<PairingMatch[]>(() => {
    if (!selectedSpice) return [];

    const selectedPairings = new Set(selectedSpice.pairings?.map(normalize) || []);
    const selectedFlavors = new Set(selectedSpice.flavors?.map(normalize) || []);
    const selectedCuisines = new Set(selectedSpice.cuisines || []);
    const selectedSubstitutes = new Set(selectedSpice.substitutes?.map(normalize) || []);
    const selectedName = normalize(selectedSpice.name);

    return spices
      .filter((s) => s.slug !== selected)
      .map((s) => {
        const sharedPairings = (s.pairings || []).filter((p) => selectedPairings.has(normalize(p)));
        const sharedFlavors = (s.flavors || []).filter((f) => selectedFlavors.has(normalize(f)));
        const sharedCuisines = (s.cuisines || []).filter((c) => selectedCuisines.has(c));
        const substituteHits = (s.substitutes || []).filter((sub) =>
          selectedSubstitutes.has(normalize(sub)) || normalize(sub).includes(selectedName)
        );
        const reverseSubstitute = selectedSpice.substitutes?.some((sub) => normalize(sub).includes(normalize(s.name))) ? 1 : 0;
        const heatDistance = Math.abs((s.heatLevel || 0) - (selectedSpice.heatLevel || 0));
        const heatScore = heatDistance <= 1 ? 1 : 0;
        const cuisinePenalty = cuisineFilter !== "all" && !(s.cuisines || []).includes(cuisineFilter) ? -2 : 0;
        const heatPenalty = heatFilter !== "all" && String(s.heatLevel || 0) !== heatFilter ? -2 : 0;
        const score =
          sharedPairings.length * 3 +
          sharedFlavors.length * 2 +
          sharedCuisines.length * 2 +
          substituteHits.length * 3 +
          reverseSubstitute * 3 +
          heatScore +
          cuisinePenalty +
          heatPenalty;

        return {
          ...s,
          sharedPairings,
          sharedFlavors,
          sharedCuisines,
          substituteHits,
          score,
          strength: getStrength(score),
        };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 24);
  }, [selectedSpice, selected, spices, cuisineFilter, heatFilter]);

  const directPairings = useMemo(() => {
    if (!selectedSpice) return [];
    const names = new Map(spices.map((s) => [normalize(s.name), s]));
    return selectedSpice.pairings
      .map((pairing) => names.get(normalize(pairing)))
      .filter((spice): spice is Spice => Boolean(spice))
      .slice(0, 8);
  }, [selectedSpice, spices]);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
        <div className="relative">
          <input
            type="text"
            placeholder="Type a spice name..."
            className="input input-bordered w-full"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected("");
            }}
          />
          {suggestions.length > 0 && !selected && (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-box border border-base-300 bg-base-100 shadow-lg">
              {suggestions.map((s) => (
                <button
                  key={s.slug}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-base-200"
                  onClick={() => {
                    setSelected(s.slug);
                    setQuery(s.name);
                  }}
                >
                  <span>{s.type === "herb" ? "🌿" : "🌶️"}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          className="select select-bordered w-full"
          value={cuisineFilter}
          onChange={(event) => setCuisineFilter(event.target.value)}
          aria-label="Filter pairings by cuisine"
        >
          <option value="all">All cuisines</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine} value={cuisine}>{cuisine}</option>
          ))}
        </select>

        <select
          className="select select-bordered w-full"
          value={heatFilter}
          onChange={(event) => setHeatFilter(event.target.value)}
          aria-label="Filter pairings by heat level"
        >
          <option value="all">Any heat level</option>
          {[0, 1, 2, 3, 4, 5].map((heat) => (
            <option key={heat} value={heat}>{heat === 0 ? "No heat" : `Heat ${heat}/5`}</option>
          ))}
        </select>
      </div>

      {selectedSpice && (
        <div className="card bg-gradient-to-r from-emerald-950 via-green-900 to-lime-900 text-white shadow-xl">
          <div className="card-body">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedSpice.type === "herb" ? "🌿" : "🌶️"}</span>
                <div>
                  <h2 className="text-2xl font-bold">{selectedSpice.name}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedSpice.flavors?.map((f) => (
                      <span key={f} className="badge border-0 bg-white/20 text-white">{f}</span>
                    ))}
                    {(selectedSpice.cuisines || []).slice(0, 3).map((cuisine) => (
                      <span key={cuisine} className="badge badge-outline border-white/50 text-white">{cuisine}</span>
                    ))}
                  </div>
                </div>
              </div>
              <Link href={`/spice/${selectedSpice.slug}`} className="btn btn-sm border-white/40 bg-white/10 text-white hover:bg-white/20">
                Open detail page
              </Link>
            </div>
            <p className="mt-3 text-emerald-100">
              Pairs with: {selectedSpice.pairings?.join(", ")}
            </p>
          </div>
        </div>
      )}

      {selectedSpice && directPairings.length > 0 && (
        <section className="rounded-box border border-base-300 bg-base-100 p-5">
          <h3 className="text-lg font-bold">Direct two-way matches</h3>
          <p className="mt-1 text-sm text-base-content/60">
            These entries exist in the encyclopedia and are named directly in {selectedSpice.name}&apos;s pairing list.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {directPairings.map((spice) => (
              <button
                key={spice.slug}
                onClick={() => { setSelected(spice.slug); setQuery(spice.name); }}
                className="btn btn-sm btn-outline"
              >
                {spice.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {pairingMatches.length > 0 && selectedSpice && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold">Compatibility matrix</h3>
              <p className="text-sm text-base-content/60">
                Ranked by shared pairings, flavor notes, cuisine overlap, substitute signals, and heat compatibility.
              </p>
            </div>
            <div className="stats stats-horizontal bg-base-200 shadow-sm">
              <div className="stat px-4 py-2">
                <div className="stat-title text-xs">Matches</div>
                <div className="stat-value text-lg">{pairingMatches.length}</div>
              </div>
              <div className="stat px-4 py-2">
                <div className="stat-title text-xs">Filter</div>
                <div className="stat-value text-sm">{cuisineLabel(cuisineFilter)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pairingMatches.map((s) => (
              <Link
                key={s.slug}
                href={`/spice/${s.slug}`}
                className="card border border-base-300 bg-base-100 transition-shadow hover:shadow-md"
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <span>{s.type === "herb" ? "🌿" : "🌶️"}</span>
                      {s.name}
                    </h4>
                    <span className={`badge badge-sm ${s.strength === "strong" ? "badge-success" : s.strength === "good" ? "badge-primary" : "badge-ghost"}`}>
                      {s.score} pts
                    </span>
                  </div>
                  <p className="text-sm text-base-content/70">
                    {explainMatch(s, selectedSpice.name)}.
                  </p>
                  <div className="space-y-2">
                    {s.sharedPairings.length > 0 && (
                      <TagRow label="Shared pairings" values={s.sharedPairings} tone="success" />
                    )}
                    {s.sharedFlavors.length > 0 && (
                      <TagRow label="Flavor bridge" values={s.sharedFlavors} tone="ghost" />
                    )}
                    {s.substitutes?.length ? (
                      <TagRow label="Substitutes" values={s.substitutes.slice(0, 3)} tone="warning" />
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {selected && pairingMatches.length === 0 && (
        <div className="py-12 text-center text-base-content/50">
          <p className="mb-4 text-4xl">🤷</p>
          <p>No flavor companions found for this selection. Try clearing the cuisine or heat filter.</p>
        </div>
      )}

      {!selected && (
        <div className="py-8">
          <div className="mb-6 text-center text-base-content/60">
            <p className="mb-2 text-4xl">🔍</p>
            <p>Start typing a spice name above, or pick one of these popular spices:</p>
          </div>
          <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
            {quickPicks.map((s) => (
              <button
                key={s.slug}
                onClick={() => { setSelected(s.slug); setQuery(s.name); }}
                className="btn btn-sm btn-outline"
              >
                <span>{s.type === "herb" ? "🌿" : "🌶️"}</span>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TagRow({ label, values, tone }: { label: string; values: string[]; tone: "success" | "ghost" | "warning" }) {
  const badgeClass = tone === "success" ? "badge-success badge-outline" : tone === "warning" ? "badge-warning badge-outline" : "badge-ghost";

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-base-content/50">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1">
        {values.slice(0, 5).map((value) => (
          <span key={value} className={`badge badge-xs ${badgeClass}`}>{value}</span>
        ))}
      </div>
    </div>
  );
}
