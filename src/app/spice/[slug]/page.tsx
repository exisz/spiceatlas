import spicesData from "@/data/spices.json";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";

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
  usedPart?: string;
  culinaryContext?: string;
  howToUse?: string;
  substitutes?: string[];
  sourceName?: string;
  sourceUrl?: string;
}

const spices = spicesData as Spice[];
const fallbackSource = "https://en.wikipedia.org/wiki/List_of_culinary_herbs_and_spices";

export async function generateStaticParams() {
  return spices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const spice = spices.find((s) => s.slug === slug);
  if (!spice) return { title: "Not Found" };
  return {
    title: `${spice.name} — Flavor Profile & Pairing Guide`,
    description: spice.description || `Learn about ${spice.name}: flavor profile, best pairings, and culinary uses.`,
  };
}

export const revalidate = 86400;

export default async function SpicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const spice = spices.find((s) => s.slug === slug);
  if (!spice) notFound();
  const related = getRelatedSpices(spice);

  return (
    <div className="container mx-auto px-4 py-8">
      <SpiceJsonLd spice={spice} />
      <Breadcrumb spice={spice} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 space-y-6">
          <Hero spice={spice} />
          <About spice={spice} />
          <CulinaryStructure spice={spice} />
          <FlavorProfile spice={spice} />
          <AmazonCard spice={spice} />
          <PairingGuide spice={spice} />
        </main>
        <aside className="space-y-6">
          <QuickInfo spice={spice} />
          <RelatedSpices related={related} />
        </aside>
      </div>
    </div>
  );
}

function getRelatedSpices(spice: Spice) {
  return spices
    .filter((s) => s.slug !== spice.slug && (s.letter === spice.letter || s.pairings?.some((p) => spice.pairings?.includes(p))))
    .slice(0, 6);
}

function SpiceJsonLd({ spice }: { spice: Spice }) {
  return <JsonLd data={{
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${spice.name} flavor profile and pairing guide`,
    description: spice.description,
    about: spice.name,
    mainEntityOfPage: `/spice/${spice.slug}`,
    citation: spice.sourceUrl || fallbackSource,
  }} />;
}

function Breadcrumb({ spice }: { spice: Spice }) {
  return <div className="text-sm breadcrumbs mb-6"><ul>
    <li><Link href="/">Home</Link></li>
    <li><Link href="/browse">Browse</Link></li>
    <li><Link href={`/browse?letter=${spice.letter}`}>{spice.letter}</Link></li>
    <li>{spice.name}</li>
  </ul></div>;
}

function Hero({ spice }: { spice: Spice }) {
  return <div className="bg-gradient-to-br from-emerald-900 to-green-800 text-white rounded-box p-8">
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="text-4xl mb-2 block">{spice.type === "herb" ? "🌿" : "🌶️"}</span>
        <h1 className="text-3xl md:text-4xl font-bold">{spice.name}</h1>
        {spice.scientificName && <p className="text-emerald-200 italic mt-1">{spice.scientificName}</p>}
        {spice.alternateNames?.length > 0 && <p className="text-emerald-300 text-sm mt-2">Also known as: {spice.alternateNames.join(", ")}</p>}
      </div>
      <span className={`badge badge-lg ${spice.type === "herb" ? "bg-green-500" : "bg-orange-500"} text-white`}>{spice.type}</span>
    </div>
  </div>;
}

function About({ spice }: { spice: Spice }) {
  return <Card title="📖 About"><p className="text-base-content/80 leading-relaxed">{spice.description}</p></Card>;
}

function CulinaryStructure({ spice }: { spice: Spice }) {
  const source = spice.sourceUrl || fallbackSource;
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Card title="🧭 Culinary Context"><dl className="space-y-3 text-sm">
      <Info label="Used part" value={spice.usedPart || "culinary ingredient"} capitalize />
      <Info label="Typical cuisines" value={spice.cuisines?.length ? spice.cuisines.join(", ") : spice.culinaryContext || "Used across global cooking traditions."} />
      <div><dt className="font-semibold text-base-content">Source</dt><dd><a href={source} target="_blank" rel="noopener noreferrer" className="link link-primary">{spice.sourceName || "Wikipedia culinary herb and spice references"}</a></dd></div>
    </dl></Card>
    <Card title="🍳 How to Use"><p className="text-sm leading-relaxed text-base-content/75">{spice.howToUse || `Use ${spice.name} in small amounts, taste, and balance it with salt, fat, or acidity.`}</p><Substitutes items={spice.substitutes || []} /></Card>
  </div>;
}

function FlavorProfile({ spice }: { spice: Spice }) {
  return <Card title="🎨 Flavor Profile">
    <div className="flex flex-wrap gap-2 mt-2">{spice.flavors?.map((f) => <span key={f} className="badge badge-lg bg-emerald-100 text-emerald-800 border-emerald-300">{f}</span>)}</div>
    {spice.heatLevel !== undefined && <div className="mt-4"><h3 className="font-medium mb-2">Heat Level</h3><HeatDots level={spice.heatLevel} /></div>}
  </Card>;
}

function HeatDots({ level }: { level: number }) {
  const label = level === 0 ? "No heat" : level <= 3 ? "Mild" : level <= 6 ? "Medium" : "Hot";
  return <div className="flex items-center gap-1">{Array.from({ length: 10 }).map((_, i) => <div key={i} className={`w-6 h-6 rounded-full ${i < level ? level <= 3 ? "bg-yellow-400" : level <= 6 ? "bg-orange-500" : "bg-red-600" : "bg-base-200"}`} />)}<span className="ml-2 text-sm text-base-content/60">{label}</span></div>;
}

function AmazonCard({ spice }: { spice: Spice }) {
  const tag = process.env.NEXT_PUBLIC_AMAZON_AU_TAG;
  if (!tag) return null;
  const href = `https://www.amazon.com.au/s?k=${encodeURIComponent(spice.name)}&tag=${tag}`;
  return <Card title={`🛒 Buy ${spice.name}`}><p className="text-sm text-base-content/70">Find {spice.name} on Amazon Australia. As an Amazon Associate we earn from qualifying purchases.</p><a href={href} target="_blank" rel="sponsored noopener noreferrer" className="btn btn-primary btn-sm w-fit mt-2">Shop {spice.name} on Amazon AU →</a></Card>;
}

function PairingGuide({ spice }: { spice: Spice }) {
  return <Card title="🍽️ Best Paired With"><div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">{spice.pairings?.map((p) => <PairingItem key={p} name={p} />)}</div></Card>;
}

function PairingItem({ name }: { name: string }) {
  const paired = spices.find((s) => s.name.toLowerCase() === name.toLowerCase());
  if (!paired) return <div className="btn btn-ghost btn-sm justify-start cursor-default">🍴 {name}</div>;
  return <Link href={`/spice/${paired.slug}`} className="btn btn-outline btn-sm justify-start">{paired.type === "herb" ? "🌿" : "🌶️"} {name}</Link>;
}

function QuickInfo({ spice }: { spice: Spice }) {
  return <Card title="Quick Info" small><table className="table table-sm"><tbody>
    <Row label="Type" value={spice.type} capitalize />
    {spice.scientificName && <Row label="Scientific Name" value={spice.scientificName} italic />}
    <Row label="Used Part" value={spice.usedPart || "culinary ingredient"} capitalize />
    {spice.cuisines?.length > 0 && <Row label="Cuisines" value={spice.cuisines.join(", ")} />}
    <Row label="Heat Level" value={spice.heatLevel === 0 ? "None" : "🌶️".repeat(Math.min(spice.heatLevel, 5))} />
  </tbody></table></Card>;
}

function RelatedSpices({ related }: { related: Spice[] }) {
  if (related.length === 0) return null;
  return <Card title="Related" small><div className="space-y-2">{related.map((r) => <Link key={r.slug} href={`/spice/${r.slug}`} className="flex items-center gap-2 hover:bg-base-200 rounded-lg p-2 transition-colors"><span>{r.type === "herb" ? "🌿" : "🌶️"}</span><div><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-base-content/50">{r.flavors?.slice(0, 2).join(", ")}</p></div></Link>)}</div></Card>;
}

function Card({ title, children, small = false }: { title: string; children: React.ReactNode; small?: boolean }) {
  return <div className="card bg-base-100 border border-base-300"><div className="card-body"><h2 className={`card-title ${small ? "text-base" : ""}`}>{title}</h2>{children}</div></div>;
}

function Info({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return <div><dt className="font-semibold text-base-content">{label}</dt><dd className={`text-base-content/75 ${capitalize ? "capitalize" : ""}`}>{value}</dd></div>;
}

function Row({ label, value, capitalize = false, italic = false }: { label: string; value: string; capitalize?: boolean; italic?: boolean }) {
  return <tr><td className="font-medium">{label}</td><td className={`${capitalize ? "capitalize" : ""} ${italic ? "italic" : ""}`}>{value}</td></tr>;
}

function Substitutes({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return <div className="mt-3"><h3 className="font-semibold text-sm mb-2">Substitutes</h3><div className="flex flex-wrap gap-2">{items.map((item) => <span key={item} className="badge badge-outline">{item}</span>)}</div></div>;
}
