import { LandingHeader } from "@/components/landing/header";

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
      <main id="skip-nav" className="pt-14">
        {/* Hero section — à remplir */}
        <div className="flex min-h-[90vh] items-center justify-center">
          <p className="text-zinc-600">En cours de construction...</p>
        </div>
      </main>
    </>
  );
}
