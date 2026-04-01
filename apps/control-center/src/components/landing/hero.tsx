import Link from "next/link";

export function LandingHero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden px-5 pb-0 pt-[120px]"
      style={{ background: "#080808" }}
    >
      <div className="mx-auto max-w-[1100px]">

        {/* Big title — exact Linear style */}
        <h1
          style={{
            fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif",
            fontSize: "clamp(2.8rem, 7vw, 5.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.0,
            color: "rgba(255,255,255,0.93)",
            marginBottom: "20px",
          }}
        >
          <span className="block sm:hidden">
            Le logiciel de<br />gestion Vinted<br />pour les pros
          </span>
          <span className="hidden sm:block">
            Le logiciel de gestion<br />Vinted pour les pros
          </span>
        </h1>

        {/* Description row — same layout as Linear */}
        <div className="flex items-start justify-between gap-8">
          <p
            style={{
              fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif",
              fontSize: "15px",
              lineHeight: 1.65,
              color: "rgba(255,255,255,0.45)",
              maxWidth: "340px",
            }}
          >
            Conçu pour les vendeurs Vinted. Automatise ta gestion, suis tes marges réelles et scale ton business d&apos;achat-revente.
          </p>

          {/* Feature callout link — like "Issue tracking is dead" */}
          <Link
            href="#features"
            className="hidden items-center gap-3 md:flex"
            style={{ textDecoration: "none" }}
          >
            <div
              className="flex-shrink-0"
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#18CB96",
                boxShadow: "0 0 0 2px rgba(24,203,150,0.25)",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif",
                fontSize: "13px",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              L&apos;extension Chrome est morte
            </span>
            <span
              style={{
                fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif",
                fontSize: "13px",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              voyted.app/token →
            </span>
          </Link>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/register"
            className="inline-flex h-9 items-center rounded-[7px] px-4 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
            style={{ background: "#ffffff" }}
          >
            Commencer gratuitement
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center rounded-[7px] px-4 text-[13px] font-medium transition-colors"
            style={{
              color: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Se connecter
          </Link>
        </div>

        {/* Dashboard screenshot placeholder — same frame as Linear */}
        <div className="relative mt-16">
          {/* Gradient fade bottom */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-32"
            style={{ background: "linear-gradient(to top, #080808, transparent)" }}
          />

          {/* Frame */}
          <div
            className="relative overflow-hidden rounded-t-xl"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderBottom: "none",
              background: "rgba(255,255,255,0.02)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 -40px 100px -20px rgba(139,92,246,0.08)",
            }}
          >
            {/* Browser chrome */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}
            >
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div
                className="mx-auto flex h-5 w-48 items-center justify-center rounded-md text-[11px]"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}
              >
                app.voyted.app
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="flex h-[380px] items-center justify-center" style={{ background: "rgba(12,12,12,0.8)" }}>
              <div className="grid w-full max-w-2xl gap-3 px-8 pt-8 opacity-60">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Revenu ce mois", value: "1 247 €", color: "#18CB96" },
                    { label: "Articles en vente", value: "34", color: "rgba(255,255,255,0.7)" },
                    { label: "Ventes", value: "12", color: "rgba(255,255,255,0.7)" },
                  ].map((s, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
                      <p className="mt-1 text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                {/* Table rows */}
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                  {["T-shirt Nike • 18 €", "Jean Levi's • 35 €", "Veste Carhartt • 55 €", "Sneakers Vans • 28 €"].map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2" style={{ borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                      <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>{item}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: "rgba(24,203,150,0.1)", color: "#18CB96" }}>En vente</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(24,203,150,0.25); }
          50% { box-shadow: 0 0 0 5px rgba(24,203,150,0.1); }
        }
      `}</style>
    </section>
  );
}
