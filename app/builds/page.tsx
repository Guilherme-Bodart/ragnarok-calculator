"use client";

import dynamic from "next/dynamic";

const BuildsHubPage = dynamic(
  () =>
    import("@/components/builds/builds-hub-page").then(
      (mod) => mod.BuildsHubPage,
    ),
  { ssr: false },
);

export default function BuildsPage() {
  return <BuildsHubPage />;
}
