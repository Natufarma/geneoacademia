"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import { InstagramIcon, FacebookIcon, LinkedinIcon } from "@/components/SocialIcons";
import { SOCIAL, TIENDA_URL, NAV_LINKS } from "@/lib/site";

const socials = [
  { Icon: InstagramIcon, label: "Instagram", href: SOCIAL.instagram },
  { Icon: FacebookIcon, label: "Facebook", href: SOCIAL.facebook },
  { Icon: LinkedinIcon, label: "LinkedIn", href: SOCIAL.linkedin },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Foco atrapado dentro del diálogo mientras está abierto: mueve el foco al
  // menú al abrir y hace loop del Tab entre el primer y último elemento.
  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const getFocusable = () =>
      Array.from(
        overlay.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    getFocusable()[0]?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    overlay.addEventListener("keydown", onKeyDown);
    return () => overlay.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Al cerrar, devolvemos el foco al botón que abrió el menú.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) menuButtonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cerrar el menú con Escape (accesibilidad de diálogo modal).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Barra mínima */}
      <nav
        className={`fixed top-0 z-[100] w-full pt-[env(safe-area-inset-top)] transition-colors duration-300 ${
          scrolled ? "bg-white shadow-soft" : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 flex items-center justify-between h-16">
          <a href="#" aria-label="Geneo — inicio" className="flex items-center shrink-0 p-2 -m-2">
            <Image
              src="/img/logo-fuxia.webp"
              alt="Geneo"
              width={95}
              height={32}
              className="h-7 w-auto"
              priority
            />
          </a>

          <div className="flex items-center gap-3">
            <a
              href={TIENDA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 -m-3 text-ink hover:text-geneo active:text-geneo transition-colors"
              aria-label="Ir a la tienda online"
            >
              <ShoppingBag size={20} aria-hidden="true" />
            </a>
            <button
              ref={menuButtonRef}
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="nav-overlay"
              aria-label="Abrir menú de navegación"
              className="group inline-flex items-center gap-2 min-h-[44px] rounded-full border border-ink/15 bg-white/40 backdrop-blur-md pl-4 pr-3.5 py-2 text-sm font-medium text-ink hover:bg-ink hover:text-white hover:border-ink active:bg-ink active:text-white active:border-ink transition-colors duration-300"
            >
              Menú
              <Menu size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay full-screen */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            id="nav-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Navegación principal"
            initial={reduced ? { opacity: 0 } : { y: "-100%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "-100%" }}
            transition={reduced ? { duration: 0.15 } : { duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[110] bg-geneo text-white flex flex-col"
          >
            {/* Top del overlay */}
            <div className="max-w-[1440px] mx-auto w-full px-6 sm:px-10 lg:px-16 flex items-center justify-between h-16 shrink-0">
              <Image
                src="/img/logo-white.webp"
                alt="Geneo"
                width={110}
                height={44}
                className="h-7 w-auto"
              />
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú de navegación"
                className="group inline-flex items-center gap-2 min-h-[44px] rounded-full border border-white/20 pl-4 pr-3.5 py-2 text-sm font-medium text-white hover:bg-white hover:text-ink active:bg-white active:text-ink transition-colors duration-300"
              >
                Cerrar
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Links gigantes */}
            <div className="flex-1 flex flex-col justify-center max-w-[1440px] mx-auto w-full px-6 sm:px-10 lg:px-16">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={reduced ? { duration: 0.15 } : { delay: 0.25 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex items-baseline gap-4 sm:gap-6 py-3 sm:py-4 border-b border-white/10"
                >
                  <span className="text-xs sm:text-sm font-medium text-white/75 w-7 shrink-0">
                    0{i + 1}
                  </span>
                  <span className="text-3xl sm:text-6xl md:text-7xl font-medium tracking-tight text-white/90 group-hover:text-white group-hover:translate-x-2 sm:group-hover:translate-x-3 group-active:text-white group-active:translate-x-2 transition-all duration-300 ease-out">
                    {link.label}
                  </span>
                  <ArrowRight
                    className="hidden sm:block ml-auto self-center text-white/0 group-hover:text-white transition-all duration-300 -translate-x-3 group-hover:translate-x-0"
                    size={28}
                  />
                </motion.a>
              ))}
            </div>

            {/* Footer del overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="max-w-[1440px] mx-auto w-full px-6 sm:px-10 lg:px-16 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shrink-0 border-t border-white/10"
            >
              <a
                href="#ritual-finder"
                onClick={() => setOpen(false)}
                className="group inline-flex items-center gap-2 bg-white text-geneo rounded-full pl-6 pr-5 py-3 text-sm font-medium hover:bg-white/90 active:bg-white/90 transition-colors duration-300 w-fit"
              >
                Encontrá tu ritual
                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <div className="flex items-center gap-3">
                {socials.map((s) => {
                  const Icon = s.Icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-11 h-11 rounded-full border border-white/15 flex items-center justify-center text-white hover:bg-white hover:text-ink transition-colors duration-300"
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
