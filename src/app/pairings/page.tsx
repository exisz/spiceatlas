import spicesData from "@/data/spices.json";
import { PairingExplorer } from "@/components/PairingExplorer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spice & Herb Pairing Guide",
  description: "Discover which herbs and spices pair best together. Interactive flavor pairing explorer for better cooking.",
};

export const revalidate = 86400;

export default function PairingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">🍽️ Pairing Guide</h1>
      <p className="text-base-content/60 mb-8">
        Select a herb or spice to see what pairs well with it
      </p>
      <PairingExplorer spices={spicesData as any[]} />
    </div>
  );
}
