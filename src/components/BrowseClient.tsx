"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Spice {
  name: string;
  slug: string;
  scientificName: string;
  type: string;
  flavors: string[];
  pairings: string[];
  heatLevel: number;
  letter: string;
  description: string;
}

type SortKey = "name" | "type" | "heatLevel";
type SortDir = "asc" | "desc";

export function BrowseClient({ spices }: { spices: Spice[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [letterFilter, setLetterFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const letters = [...new Set(spices.map((s) => s.letter))].sort();

  const filtered = useMemo(() => {
    let result = spices;
    if (query.length >= 2) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.scientificName?.toLowerCase().includes(q) ||
          s.flavors?.some((f) => f.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((s) => s.type === typeFilter);
    }
    if (letterFilter !== "all") {
      result = result.filter((s) => s.letter === letterFilter);
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "type") cmp = a.type.localeCompare(b.type);
      else if (sortKey === "heatLevel") cmp = (a.heatLevel || 0) - (b.heatLevel || 0);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [spices, query, typeFilter, letterFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return "↕️";
    return sortDir === "asc" ? "↑" : "↓";
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, scientific name, or flavor..."
          className="input input-bordered flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="herb">🌿 Herbs</option>
          <option value="spice">🌶️ Spices</option>
        </select>
        <select
          className="select select-bordered"
          value={letterFilter}
          onChange={(e) => setLetterFilter(e.target.value)}
        >
          <option value="all">All Letters</option>
          {letters.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-base-content/60 mb-4">
        Showing {filtered.length} of {spices.length} varieties
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr>
              <th
                className="cursor-pointer hover:bg-base-200"
                onClick={() => toggleSort("name")}
              >
                Name {sortIcon("name")}
              </th>
              <th
                className="cursor-pointer hover:bg-base-200"
                onClick={() => toggleSort("type")}
              >
                Type {sortIcon("type")}
              </th>
              <th>Flavors</th>
              <th
                className="cursor-pointer hover:bg-base-200"
                onClick={() => toggleSort("heatLevel")}
              >
                Heat {sortIcon("heatLevel")}
              </th>
              <th>Pairings</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.slug} className="hover">
                <td>
                  <Link
                    href={`/spice/${s.slug}`}
                    className="link link-hover font-medium"
                  >
                    {s.name}
                  </Link>
                  {s.scientificName && (
                    <p className="text-xs italic text-base-content/40">
                      {s.scientificName}
                    </p>
                  )}
                </td>
                <td>
                  <span
                    className={`badge badge-sm ${
                      s.type === "herb" ? "badge-success" : "badge-warning"
                    }`}
                  >
                    {s.type}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {s.flavors?.slice(0, 3).map((f) => (
                      <span key={f} className="badge badge-xs badge-outline">
                        {f}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  {s.heatLevel > 0
                    ? "🌶️".repeat(Math.min(s.heatLevel, 5))
                    : "-"}
                </td>
                <td className="text-xs text-base-content/60">
                  {s.pairings?.slice(0, 3).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
