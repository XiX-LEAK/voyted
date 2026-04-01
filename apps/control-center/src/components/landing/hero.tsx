import Link from "next/link";

const tickerItems = [
  "T-shirt Nike +8€",
  "Jean Levi's +18€",
  "Veste Carhartt +32€",
  "Sneakers Vans +12€",
  "Pull Ralph Lauren +25€",
  "Sac Gucci +85€",
  "Veste Zara +12€",
  "Chaussures Adidas +22€",
];

export function LandingHero() {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center overflow-hidden px-4 pb-0 pt-28 text-center"
      style={{ background: "linear-gradient(to bottom, #0d0d0d 0%, #080808 100%)" }}
    >
      {/* Badge */}
      <div
        className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-medium"
        style={{
          background: "rgba(24, 203, 150, 0.1)",
          border: "1px solid rgba(24, 203, 150, 0.2)",
          color: "#18CB96",
        }}
      >
        <span>✨ L&apos;Outil Vinted pour les Pros</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        </svg>
      </div>

      {/* H1 */}
      <h1
        className="mb-6 max-w-[700px] text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.05] tracking-[-0.03em]"
        style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif" }}
      >
        <span className="text-white">Domine Vinted.</span>
        <br />
        <span style={{ color: "#18CB96" }}>Maximise tes profits.</span>
      </h1>

      {/* Subtitle */}
      <p
        className="mb-8 max-w-[520px] text-[15px] leading-[1.7]"
        style={{ color: "rgba(255,255,255,0.5)", fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif" }}
      >
        Arrête de perdre de l&apos;argent avec des tableaux Excel. Automatise ta comptabilité,
        suis tes marges réelles et scale ton business d&apos;achat-revente.
      </p>

      {/* CTA */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/register"
          className="inline-flex h-10 items-center gap-2 rounded-[8px] px-5 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
          style={{ background: "#18CB96" }}
        >
          Commencer gratuitement
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Social proof */}
      <div className="mb-12 flex items-center gap-3">
        {/* Avatars */}
        <div className="flex -space-x-2">
          {["#7c3aed", "#059669", "#dc2626", "#d97706"].map((color, i) => (
            <div
              key={i}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#080808] text-[10px] font-bold text-white"
              style={{ background: color }}
            >
              {["J", "M", "A", "T"][i]}
            </div>
          ))}
        </div>
        <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span className="font-semibold text-white">+1300</span> vendeurs pro nous font confiance
        </p>
      </div>

      {/* Ticker */}
      <div
        className="group relative w-full overflow-hidden py-4"
        style={{ maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)" }}
      >
        <div className="flex animate-[marquee_25s_linear_infinite] gap-3 group-hover:[animation-play-state:paused]"
          style={{ width: "max-content" }}>
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              className="inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium whitespace-nowrap"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

    </section>
  );
}
