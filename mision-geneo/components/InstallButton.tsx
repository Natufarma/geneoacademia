"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Check, Share, Plus } from "lucide-react";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Estado del navegador (standalone / iOS) leído como store externo: getSnapshot
// corre en el cliente, getServerSnapshot devuelve false → sin mismatch de hidratación
// y sin setState síncrono en efecto (regla del React Compiler).
const noSubscribe = () => () => {};
function useClientFlag(read: () => boolean): boolean {
  return useSyncExternalStore(noSubscribe, read, () => false);
}

/**
 * Botón "Instalar app" (PWA).
 * - Chrome/Android/desktop: usa el evento beforeinstallprompt.
 * - iOS/Safari: no hay evento → muestra instrucciones (Compartir → Agregar a inicio).
 * - Ya instalada / standalone: chip "App instalada".
 */
export default function InstallButton() {
  const isStandalone = useClientFlag(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true,
  );
  const isIOS = useClientFlag(() => /iphone|ipad|ipod/i.test(window.navigator.userAgent));

  const [deferred, setDeferred] = useState<InstallPrompt | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPrompt);
    };
    const onInstalled = () => {
      setJustInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const installed = isStandalone || justInstalled;

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      return;
    }
    // Sin prompt nativo (iOS o navegador que instala desde su menú): ayuda.
    setShowHelp((v) => !v);
  };

  if (installed) {
    return (
      <div className="inline-flex items-center gap-2 min-h-11 rounded-full bg-rosa-suave/60 text-geneo font-bold text-sm px-5">
        <Check size={16} />
        App instalada
      </div>
    );
  }

  const steps = isIOS
    ? [
        { icon: Share, node: <>Tocá <strong>Compartir</strong> en la barra de Safari.</> },
        { icon: Plus, node: <>Elegí <strong>Agregar a inicio</strong>.</> },
      ]
    : [
        { icon: Plus, node: <>Abrí el menú del navegador (⋮).</> },
        {
          icon: Download,
          node: (
            <>
              Elegí <strong>Instalar app</strong> o <strong>Agregar a pantalla de inicio</strong>.
            </>
          ),
        },
      ];

  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        type="button"
        onClick={onClick}
        className="w-full inline-flex items-center justify-center gap-2 min-h-11 rounded-full bg-geneo hover:bg-geneo-hover active:bg-geneo-hover text-white font-bold uppercase tracking-wide text-sm px-6 py-3 transition-colors"
      >
        <Download size={18} />
        Instalar app
      </button>

      <AnimatePresence initial={false}>
        {showHelp && !deferred && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: "auto",
              transition: { type: "spring", stiffness: 260, damping: 30 },
            }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2.5 rounded-2xl bg-rosa-suave/50 px-4 py-3.5">
              {steps.map(({ icon: Icon, node }, i) => (
                <p key={i} className="flex items-center gap-2.5 text-ink text-sm leading-snug">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-paper text-geneo shrink-0">
                    <Icon size={15} />
                  </span>
                  <span>{node}</span>
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
