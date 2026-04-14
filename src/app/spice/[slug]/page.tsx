import spicesData from "@/data/spices.json";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Spice {
  name: string;
  slug: string;
  scientificName: string;
  alternateNames: string[];
  type: string;
  cuisines: string[];
  flavors: string[];
  pairings: string[];
  heatLevel: number;
  letter: string;
  description: string;
}

const spices = spicesData as Spice[];

export async function generateStaticParams() {
  return spices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spice = spices.find((s) => s.slug === slug);
  if (!spice) return { title: "Not Found" };
  return {
    title: `${spice.name} — Flavor Profile & Pairing Guide`,
    description: spice.description || `Learn about ${spice.name}: flavor profile, best pairings, and culinary uses.`,
  };
}

export const revalidate = 86400;

export default async function SpicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spice = spices.find((s) => s.slug === slug);
  if (!spice) notFound();

  // Find related spices (same letter or shared pairings)
  const related = spices
    .filter(
      (s) =>
        s.slug !== spice.slug &&
        (s.letter === spice.letter ||
          s.pairings?.some((p) => spice.pairings?.includes(p)))
    )
    .slice(0, 6);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/browse">Browse</Link></li>
          <li><Link href={`/browse?letter=${spice.letter}`}>{spice.letter}</Link></li>
          <li>{spice.name}</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-900 to-green-800 text-white rounded-box p-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-4xl mb-2 block">
                  {spice.type === "herb" ? "🌿" : "🌶️"}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold">{spice.name}</h1>
                {spice.scientificName && (
                  <p className="text-emerald-200 italic mt-1">
                    {spice.scientificName}
                  </p>
                )}
                {spice.alternateNames && spice.alternateNames.length > 0 && (
                  <p className="text-emerald-300 text-sm mt-2">
                    Also known as: {spice.alternateNames.join(", ")}
                  </p>
                )}
              </div>
              <span
                className={`badge badge-lg ${
                  spice.type === "herb"
                    ? "bg-green-500 text-white"
                    : "bg-orange-500 text-white"
                }`}
              >
                {spice.type}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">📖 About</h2>
              <p className="text-base-content/80 leading-relaxed">
                {spice.description}
              </p>
            </div>
          </div>

          {/* Flavor Profile */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">🎨 Flavor Profile</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {spice.flavors?.map((f) => (
                  <span
                    key={f}
                    className="badge badge-lg bg-emerald-100 text-emerald-800 border-emerald-300"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Heat Level */}
              {spice.heatLevel !== undefined && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Heat Level</h3>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full ${
                          i < spice.heatLevel
                            ? spice.heatLevel <= 3
                              ? "bg-yellow-400"
                              : spice.heatLevel <= 6
                              ? "bg-orange-500"
                              : "bg-red-600"
                            : "bg-base-200"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-base-content/60">
                      {spice.heatLevel === 0
                        ? "No heat"
                        : spice.heatLevel <= 3
                        ? "Mild"
                        : spice.heatLevel <= 6
                        ? "Medium"
                        : "Hot"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pairing Guide */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title">🍽️ Best Paired With</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {spice.pairings?.map((p) => {
                  const pairedSpice = spices.find(
                    (s) => s.name.toLowerCase() === p.toLowerCase()
                  );
                  return pairedSpice ? (
                    <Link
                      key={p}
                      href={`/spice/${pairedSpice.slug}`}
                      className="btn btn-outline btn-sm justify-start"
                    >
                      {pairedSpice.type === "herb" ? "🌿" : "🌶️"} {p}
                    </Link>
                  ) : (
                    <div
                      key={p}
                      className="btn btn-ghost btn-sm justify-start cursor-default"
                    >
                      🍴 {p}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-base">Quick Info</h2>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td className="font-medium">Type</td>
                    <td className="capitalize">{spice.type}</td>
                  </tr>
                  {spice.scientificName && (
                    <tr>
                      <td className="font-medium">Scientific Name</td>
                      <td className="italic">{spice.scientificName}</td>
                    </tr>
                  )}
                  {spice.cuisines && spice.cuisines.length > 0 && (
                    <tr>
                      <td className="font-medium">Cuisines</td>
                      <td>{spice.cuisines.join(", ")}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="font-medium">Heat Level</td>
                    <td>
                      {spice.heatLevel === 0
                        ? "None"
                        : "🌶️".repeat(Math.min(spice.heatLevel, 5))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Related Spices */}
          {related.length > 0 && (
            <div className="card bg-base-100 border border-base-300">
              <div className="card-body">
                <h2 className="card-title text-base">Related</h2>
                <div className="space-y-2">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/spice/${r.slug}`}
                      className="flex items-center gap-2 hover:bg-base-200 rounded-lg p-2 transition-colors"
                    >
                      <span>{r.type === "herb" ? "🌿" : "🌶️"}</span>
                      <div>
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-base-content/50">
                          {r.flavors?.slice(0, 2).join(", ")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
