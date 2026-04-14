import spicesData from "@/data/spices.json";
import Link from "next/link";
import { SpiceSearch } from "@/components/SpiceSearch";

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

const spices = spicesData as Spice[];

export const revalidate = 86400;

const CATEGORIES = [
  { name: "Herbs", emoji: "🌿", filter: "herb" },
  { name: "Spices", emoji: "🌶️", filter: "spice" },
];

const POPULAR = [
  "basil", "cinnamon", "cumin", "turmeric", "rosemary", "ginger",
  "paprika", "oregano", "thyme", "saffron", "vanilla", "garlic",
];

export default function Home() {
  const herbs = spices.filter((s) => s.type === "herb");
  const spicesList = spices.filter((s) => s.type === "spice");
  const popularSpices = spices.filter((s) =>
    POPULAR.some((p) => s.slug.includes(p))
  ).slice(0, 12);

  const letters = [...new Set(spices.map((s) => s.letter))].sort();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            🌿 SpiceAtlas
          </h1>
          <p className="text-lg md:text-xl text-emerald-200 mb-8 max-w-2xl mx-auto">
            Explore {spices.length}+ herbs and spices from around the world.
            Discover flavor profiles, pairing guides, and culinary origins.
          </p>
          <SpiceSearch spices={spices} />
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="stats stats-vertical md:stats-horizontal shadow-lg w-full bg-base-100 border border-base-300">
          <div className="stat">
            <div className="stat-figure text-emerald-500 text-3xl">🌿</div>
            <div className="stat-title">Total Varieties</div>
            <div className="stat-value text-emerald-600">{spices.length}</div>
            <div className="stat-desc">From Wikipedia</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-emerald-500 text-3xl">🌱</div>
            <div className="stat-title">Herbs</div>
            <div className="stat-value text-green-600">{herbs.length}</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-emerald-500 text-3xl">🌶️</div>
            <div className="stat-title">Spices</div>
            <div className="stat-value text-orange-600">{spicesList.length}</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-emerald-500 text-3xl">🔤</div>
            <div className="stat-title">A to Z</div>
            <div className="stat-value">{letters.length}</div>
            <div className="stat-desc">Letter categories</div>
          </div>
        </div>
      </section>

      {/* Popular Spices */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">🔥 Popular Herbs & Spices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {popularSpices.map((spice) => (
            <Link
              key={spice.slug}
              href={`/spice/${spice.slug}`}
              className="card bg-base-100 border border-base-300 hover:shadow-lg hover:border-emerald-500 transition-all"
            >
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="card-title text-base">{spice.name}</h3>
                    {spice.scientificName && (
                      <p className="text-xs italic text-base-content/50">
                        {spice.scientificName}
                      </p>
                    )}
                  </div>
                  <span
                    className={`badge badge-sm ${
                      spice.type === "herb" ? "badge-success" : "badge-warning"
                    }`}
                  >
                    {spice.type}
                  </span>
                </div>
                <p className="text-sm text-base-content/70 line-clamp-2 mt-1">
                  {spice.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {spice.flavors.slice(0, 3).map((f) => (
                    <span key={f} className="badge badge-xs badge-outline">
                      {f}
                    </span>
                  ))}
                </div>
                {spice.heatLevel > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-base-content/50">Heat:</span>
                    {Array.from({ length: Math.min(spice.heatLevel, 5) }).map(
                      (_, i) => (
                        <span key={i} className="text-xs">🌶️</span>
                      )
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by Letter */}
      <section className="container mx-auto px-4 py-12 bg-base-200/50">
        <h2 className="text-2xl font-bold mb-6">🔤 Browse by Letter</h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {letters.map((letter) => {
            const count = spices.filter((s) => s.letter === letter).length;
            return (
              <Link
                key={letter}
                href={`/browse?letter=${letter}`}
                className="btn btn-outline btn-sm hover:btn-primary"
              >
                {letter}{" "}
                <span className="badge badge-xs badge-ghost">{count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Browse by Type */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">📂 Browse by Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((cat) => {
            const items = spices.filter((s) => s.type === cat.filter);
            return (
              <Link
                key={cat.filter}
                href={`/browse?type=${cat.filter}`}
                className="card bg-base-100 border border-base-300 hover:shadow-lg transition-shadow"
              >
                <div className="card-body">
                  <h3 className="card-title text-2xl">
                    {cat.emoji} {cat.name}
                  </h3>
                  <p className="text-base-content/60">
                    {items.length} varieties to explore
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {items.slice(0, 8).map((s) => (
                      <span key={s.slug} className="badge badge-sm badge-ghost">
                        {s.name}
                      </span>
                    ))}
                    <span className="badge badge-sm">+{items.length - 8} more</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
