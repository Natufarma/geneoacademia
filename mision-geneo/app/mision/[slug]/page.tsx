"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import MissionPlayer from "@/components/MissionPlayer";
import { useApp } from "@/lib/store";

export default function MisionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { ready, user } = useApp();
  const router = useRouter();

  // El player es pantalla completa (sin tab bar), pero igual exige registro.
  useEffect(() => {
    if (ready && !user) router.replace("/");
  }, [ready, user, router]);

  if (!ready || !user) return <div className="min-h-dvh bg-surface" />;

  return <MissionPlayer slug={slug} />;
}
