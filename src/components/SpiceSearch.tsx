"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Spice {
  name: string;
  slug: string;
  scientificName: string;
  type: string;
  flavors: string[];
  letter: string;
}

export function SpiceSearch({ spices }: { spices: Spice[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return spices
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.scientificName?.toLowerCase().includes(q) ||
          s.flavors?.some((f) => f.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, spices]);

  return (
    <div className="w-full max-w-lg mx-auto relative">
      <input
        type="text"
        placeholder="Search herbs & spices..."
        className="input input-lg w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 rounded-box shadow-xl z-50 max-h-80 overflow-y-auto border border-base-300">
          {results.map((s) => (
            <Link
              key={s.slug}
              href={`/spice/${s.slug}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors text-left text-base-content"
            >
              <span className="text-lg">{s.type === "herb" ? "🌿" : "🌶️"}</span>
              <div>
                <p className="font-medium">{s.name}</p>
                {s.scientificName && (
                  <p className="text-xs italic text-base-content/50">
                    {s.scientificName}
                  </p>
                )}
              </div>
              <div className="ml-auto flex gap-1">
                {s.flavors?.slice(0, 2).map((f) => (
                  <span key={f} className="badge badge-xs badge-outline">
                    {f}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
