import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import NuestrosRituales from "@/components/NuestrosRituales";
import Rituales from "@/components/Rituales";
import EncontraRitual from "@/components/EncontraRitual";
import Timeline from "@/components/Timeline";
import Ciencia from "@/components/Ciencia";
import Testimonios from "@/components/Testimonios";
import GaleriaMujeres from "@/components/GaleriaMujeres";
import CarruselCiencia from "@/components/CarruselCiencia";
import BannerSuscripcion from "@/components/BannerSuscripcion";
import DondeComprar from "@/components/DondeComprar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        {/* Stack 1 (Hero → Productos). `isolate` mantiene el z-index local y
            los sticky se liberan al salir del contenedor. */}
        <div className="relative isolate">
          <Hero />
          {/* Spacer: mantiene el Hero fijo y VISIBLE (el intro lo revela limpio
              acá) antes de que Productos empiece a deslizarse por encima. */}
          <div className="h-[100svh]" aria-hidden />
          <Rituales />
        </div>
        <EncontraRitual />
        {/* Grilla NUESTROS RITUALES debajo del quiz */}
        <NuestrosRituales />
        <Timeline />
        <Ciencia />
        {/* Stack 2 (Carrusel mujeres → Testimonios → Mujeres Geneo) */}
        <div className="relative isolate">
          <section
            aria-label="Galería editorial Geneo"
            className="sticky top-0 z-[10] h-[100svh] overflow-hidden"
          >
            <CarruselCiencia />
          </section>
          <Testimonios />
          <GaleriaMujeres />
        </div>
        <BannerSuscripcion />
        <DondeComprar />
      </main>
      <Footer />
    </>
  );
}
