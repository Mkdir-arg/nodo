"use client";

import { useClientGuard } from "@/lib/useClientGuard";

export default function HomePage() {
  useClientGuard();

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Home</h1>
    </main>
  );
}
