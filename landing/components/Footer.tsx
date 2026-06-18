import Image from "next/image";
import { InstagramIcon, FacebookIcon, LinkedinIcon } from "@/components/SocialIcons";
import { SOCIAL, NAV_LINKS } from "@/lib/site";

const NATUFARMA_URL = "https://www.natufarma.com.ar/";

const socials = [
  { Icon: InstagramIcon, label: "Instagram", href: SOCIAL.instagram },
  { Icon: FacebookIcon, label: "Facebook", href: SOCIAL.facebook },
  { Icon: LinkedinIcon, label: "LinkedIn", href: SOCIAL.linkedin },
];

export default function Footer() {
  return (
    <footer className="relative z-[90] bg-[#2A2A2E] text-white py-16 px-4 sm:px-6">
      <div className="max-w-[1440px] mx-auto">
        {/* Fila superior: logo Geneo + redes */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Image
            src="/img/logo-white.webp"
            alt="Geneo"
            width={110}
            height={44}
            className="h-9 w-auto"
          />
          <div className="flex items-center gap-4">
            {socials.map((s) => {
              const Icon = s.Icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-11 h-11 flex items-center justify-center -m-2.5 text-white/75 hover:text-white transition-colors"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>

        {/* Navegación — mismos links que el menú */}
        <nav
          aria-label="Navegación del sitio"
          className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-3 mt-10"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="inline-flex items-center min-h-[44px] text-white/80 text-sm font-medium hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Fila inferior: marca madre + legal */}
        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a
            href={NATUFARMA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="text-xs uppercase tracking-widest">Una marca de</span>
            {/* TODO: reemplazar por <Image src="/img/natufarma-white.webp" .../> cuando esté el logo */}
            <span className="text-sm font-semibold tracking-tight">Natufarma</span>
          </a>
          <p className="text-white/60 text-xs text-center sm:text-right">
            Suplemento dietario. Consulte a su médico. No reemplaza una dieta equilibrada.
          </p>
        </div>
      </div>
    </footer>
  );
}
