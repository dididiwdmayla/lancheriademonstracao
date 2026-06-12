"use client";

import { useEffect, useState } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { usePathname } from "next/navigation";

export default function SiteGuard({ children }: { children: React.ReactNode }) {
  const [siteAtivo, setSiteAtivo] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Admin routes bypass the global kill switch
    if (pathname?.startsWith("/admin")) {
      setSiteAtivo(true);
      return;
    }

    const unsub = onSnapshot(doc(db, "config", "site"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSiteAtivo(data.siteAtivo ?? true); // Default to true if missing
      } else {
        setSiteAtivo(true);
      }
    });

    return () => unsub();
  }, [pathname]);

  if (siteAtivo === null) {
    return <div className="min-h-screen bg-marrom-900" />; // Empty state until we know
  }

  if (siteAtivo === false) {
    return (
      <main className="min-h-screen bg-marrom-900 flex flex-col items-center justify-center p-4">
        <h1 className="font-display text-4xl text-amarelo italic uppercase mb-2">Voltamos já! 🍔</h1>
        <p className="font-body text-creme/80 max-w-sm text-center">
          Estamos em manutenção ou nossa cozinha precisou de uma pausa. Voltaremos com tudo em breve!
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
