import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingClients } from "@/components/landing/clients";

export default function Home() {
  return (
    <>
      <a
        href="#skip-nav"
        className="fixed -top-full left-4 z-[100] rounded-md bg-white px-4 py-2 text-sm font-semibold text-black focus:top-4"
      >
        Passer au contenu →
      </a>
      <LandingHeader />
      <main id="skip-nav" style={{ background: "#080808" }}>
        <LandingHero />
        <LandingClients />
        {/* Sections suivantes à ajouter */}
      </main>
    </>
  );
}
