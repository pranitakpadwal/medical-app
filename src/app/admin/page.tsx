import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Admin — Sakshya",
  description: "Content curation: ingest vetted sources and review asked questions.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-bold tracking-tight">Admin</h1>
      <AdminPanel />
    </div>
  );
}
