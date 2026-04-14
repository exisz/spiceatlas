import spicesData from "@/data/spices.json";
import { BrowseClient } from "@/components/BrowseClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse All Herbs & Spices",
  description: "Browse our complete encyclopedia of 600+ herbs and spices. Filter by type, flavor, and search by name.",
};

export const revalidate = 86400;

export default function BrowsePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Browse All Herbs & Spices</h1>
      <p className="text-base-content/60 mb-8">
        {spicesData.length} varieties from around the world
      </p>
      <BrowseClient spices={spicesData as any[]} />
    </div>
  );
}
