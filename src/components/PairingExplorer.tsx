"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Spice {
  name: string;
  slug: string;
  type: string;
  flavors: string[];
  pairings: string[];
  heatLevel: number;
  description: string;
}

export function PairingExplorer({ spices }: { spices: Spice[] }) {
  const [selected, setSelected] = useState<string>("");
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return spices.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 10);
  }, [query, spices]);

  const selectedSpice = useMemo(
    () => spices.find((s) => s.slug === selected),
    [selected, spices]
  );

  const pairingMatches = useMemo(() => {
    if (!selectedSpice) return [];
    // Find spices that share pairings
    return spices
      .filter((s) => s.slug !== selected)
      .map((s) => {
        const shared = s.pairings?.filter((p) =>
          selectedSpice.pairings?.includes(p)
        ) || [];
        return { ...s, sharedPairings: shared, score: shared.length };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [selectedSpice, selected, spices]);

  return (
    <div className="space-y-6">
      {/* Search & Select */}
      <div className="relative max-w-md">
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
          <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-box shadow-lg z-50 max-h-60 overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s.slug}
                className="w-full text-left px-4 py-2 hover:bg-base-200 transition-colors flex items-center gap-2"
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

      {/* Selected Spice Info */}
      {selectedSpice && (
        <div className="card bg-gradient-to-r from-emerald-900 to-green-800 text-white">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {selectedSpice.type === "herb" ? "🌿" : "🌶️"}
              </span>
              <div>
                <h2 className="text-2xl font-bold">{selectedSpice.name}</h2>
                <div className="flex gap-2 mt-1">
                  {selectedSpice.flavors?.map((f) => (
                    <span key={f} className="badge badge-sm bg-white/20 border-0 text-white">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-emerald-200 mt-2">
              Pairs with: {selectedSpice.pairings?.join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Pairing Results */}
      {pairingMatches.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">
            Best Flavor Companions ({pairingMatches.length} matches)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pairingMatches.map((s) => (
              <Link
                key={s.slug}
                href={`/spice/${s.slug}`}
                className="card bg-base-100 border border-base-300 hover:shadow-md transition-shadow"
              >
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <span>{s.type === "herb" ? "🌿" : "🌶️"}</span>
                      {s.name}
                    </h4>
                    <span className="badge badge-primary badge-sm">
                      {s.score} shared
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.sharedPairings.map((p: string) => (
                      <span key={p} className="badge badge-xs badge-success badge-outline">
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.flavors?.slice(0, 3).map((f: string) => (
                      <span key={f} className="badge badge-xs badge-ghost">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {selected && pairingMatches.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          <p className="text-4xl mb-4">🤷</p>
          <p>No flavor companions found for this selection.</p>
        </div>
      )}

      {!selected && (
        <div className="text-center py-12 text-base-content/50">
          <p className="text-4xl mb-4">🔍</p>
          <p>Start typing a spice name above to explore pairings</p>
        </div>
      )}
    </div>
  );
}
