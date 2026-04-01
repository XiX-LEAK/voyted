import Link from "next/link";

export function LandingHero() {
  return (
    <section id="hero" className="relative overflow-hidden px-5 pb-0 pt-[120px]" style={{ background: "#080808" }}>
      <div className="mx-auto max-w-[1100px]">

        {/* Big title */}
        <h1 style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif", fontSize: "clamp(2.8rem,7vw,5.5rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.0, color: "rgba(255,255,255,0.93)", marginBottom: "20px" }}>
          <span className="block sm:hidden">Le logiciel de<br />gestion Vinted<br />pour les pros</span>
          <span className="hidden sm:block">Le logiciel de gestion<br />Vinted pour les pros</span>
        </h1>

        {/* Description row */}
        <div className="flex items-start justify-between gap-8">
          <p style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif", fontSize: "15px", lineHeight: 1.65, color: "rgba(255,255,255,0.45)", maxWidth: "340px" }}>
            Conçu pour les vendeurs Vinted. Automatise ta gestion, suis tes marges réelles et scale ton business d&apos;achat-revente.
          </p>
          <Link href="#features" className="hidden items-center gap-3 md:flex" style={{ textDecoration: "none" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#18CB96", boxShadow: "0 0 0 3px rgba(24,203,150,0.2)", animation: "pulse 2s infinite", flexShrink: 0 }} />
            <span style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>L&apos;extension Chrome est morte</span>
            <span style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>voyted.app/token →</span>
          </Link>
        </div>

        {/* CTA */}
        <div className="mt-8 flex items-center gap-3">
          <Link href="/register" className="inline-flex h-9 items-center rounded-[7px] px-4 text-[13px] font-semibold text-black transition-opacity hover:opacity-90" style={{ background: "#ffffff" }}>Commencer gratuitement</Link>
          <Link href="/login" className="inline-flex h-9 items-center rounded-[7px] px-4 text-[13px] font-medium transition-colors" style={{ color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}>Se connecter</Link>
        </div>
      </div>

      {/* Frame — exact Linear layout */}
      <div className="relative mt-14" style={{ marginLeft: "-20px", marginRight: "-20px" }}>
        {/* Grain background image from Linear CDN */}
        <img src="https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/c7b144b7-4ef0-4991-9bcb-617c6a37d200/f=auto,dpr=2,q=95,fit=scale-down,metadata=none" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity: 0.08 }} />
        {/* Shadow overlay */}
        <img src="https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/6600ca96-e49b-4fd9-c03a-7979faddad00/f=auto,dpr=2,q=95,fit=scale-down,metadata=none" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
        <img src="https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/c7fa8f5f-d439-4329-6a65-de549b51e300/f=auto,dpr=2,q=95,fit=scale-down,metadata=none" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-40" style={{ background: "linear-gradient(to top, #080808 20%, transparent)" }} />

        {/* App window */}
        <div className="relative mx-auto overflow-hidden rounded-t-xl" style={{ maxWidth: "1100px", border: "1px solid rgba(255,255,255,0.1)", borderBottom: "none", background: "#111113" }}>
          {/* Grain overlay inside */}
          <div className="pointer-events-none absolute inset-0 z-0" style={{ background: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")", opacity: 0.5 }} />

          <div className="relative flex h-[460px]">
            {/* Sidebar — exact Linear style */}
            <nav style={{ width: "220px", flexShrink: 0, background: "#111113", borderRight: "1px solid rgba(255,255,255,0.07)", padding: "12px 0", display: "flex", flexDirection: "column", gap: "2px" }}>
              {/* Workspace header */}
              <div style={{ padding: "0 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "4px" }}>
                <div className="flex items-center justify-between">
                  <button style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "4px 6px", borderRadius: "6px", fontSize: "13px", fontWeight: 500 }}>
                    <div style={{ width: "13px", height: "13px", borderRadius: "3px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", flexShrink: 0 }} />
                    Voyted
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="rgba(255,255,255,0.3)"><path d="M4.53 5.47a.75.75 0 0 0-1.06 1.06l4 4a.75.75 0 0 0 1.054.007l4-3.903a.75.75 0 0 0-1.048-1.073l-3.47 3.385L4.53 5.47Z" /></svg>
                  </button>
                  <div className="flex items-center gap-1">
                    {/* Search icon */}
                    <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "3px", borderRadius: "4px" }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M7 2C9.76142 2 12 4.23858 12 7C12 8.11012 11.6375 9.13519 11.0254 9.96484L13.7803 12.7197C14.0725 13.0118 14.0725 13.4882 13.7803 13.7803C13.4882 14.0725 13.0118 14.0725 12.7197 13.7803L9.96484 11.0254C9.13519 11.6375 8.11012 12 7 12C4.23858 12 2 9.76142 2 7C2 4.23858 4.23858 2 7 2ZM7 3.5C5.067 3.5 3.5 5.067 3.5 7C3.5 8.933 5.067 10.5 7 10.5C8.933 10.5 10.5 8.933 10.5 7C10.5 5.067 8.933 3.5 7 3.5Z" /></svg>
                    </button>
                    {/* New issue icon */}
                    <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "3px", borderRadius: "4px" }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M7.25 1C7.66414 1 7.99988 1.33589 8 1.75C8 2.16421 7.66421 2.5 7.25 2.5H4.75C3.50745 2.5 2.50012 3.50744 2.5 4.75V11.25C2.5 12.4926 3.50736 13.5 4.75 13.5H11.25C12.4926 13.5 13.5 12.4926 13.5 11.25V8.75C13.5001 8.33589 13.8359 8 14.25 8C14.6641 8 14.9999 8.33589 15 8.75V11.25C15 13.3211 13.3211 15 11.25 15H4.75C2.67893 15 1 13.3211 1 11.25V4.75C1.00012 2.67905 2.67899 1 4.75 1H7.25Z" /><path fillRule="evenodd" clipRule="evenodd" d="M13.4326 1.26953C13.7913 0.910937 14.3728 0.910883 14.7314 1.26953C15.0897 1.6282 15.0899 2.20981 14.7314 2.56836L9.2373 8.06152C8.68101 8.6177 7.94043 8.95161 7.15527 9C7.06754 9.0052 6.99468 8.93248 7 8.84473C7.04847 8.05961 7.38232 7.31897 7.93848 6.7627L13.4326 1.26953Z" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Nav items */}
              {[
                { label: "Inbox", active: false, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M11.0069 1.00879C12.0235 1.09224 12.8967 1.78967 13.1944 2.78027L14.8907 8.42871C15.0034 8.80411 15.0258 9.20103 14.9571 9.58691L14.5069 12.1143C14.2007 13.7187 12.7952 14.9052 11.1619 14.9941L11.0625 15H4.92875C3.23559 15 1.79892 13.8137 1.49329 12.1143L1.03422 9.58691C0.912571 8.90234 1.0271 8.19971 1.35645 7.59375L1.1016 8.42871L2.79691 2.78027C3.09453 1.78948 3.96862 1.09214 4.98539 1.00879L5.19047 1H10.8018L11.0069 1.00879ZM2.96098 11.8516C3.13119 12.8053 3.96043 13.4999 4.92875 13.5H11.0625C12.031 13.5 12.8611 12.8054 13.0313 11.8516L13.2715 10.5H11.6211C11.2249 10.5 10.8512 10.6738 10.5957 10.9697L10.4932 11.1035C10.1201 11.6634 9.49195 11.9999 8.81938 12H7.17191C6.54154 11.9998 5.95019 11.7042 5.57133 11.2061L5.49809 11.1035C5.24687 10.7266 4.82396 10.5 4.37113 10.5H2.71977L2.96098 11.8516Z" /></svg> },
                { label: "Mon Stock", active: true, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9Zm4.5 1a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Zm0 3a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Zm0 3a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" /></svg> },
                { label: "Mes Ventes", active: false, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm.75 3.75a.75.75 0 0 0-1.5 0v3.5c0 .414.336.75.75.75h2.5a.75.75 0 0 0 0-1.5H8.75v-2.75Z" /></svg> },
                { label: "Messages", active: false, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11ZM2.5 4.5h11l-5.5 4-5.5-4Z" /></svg> },
                { label: "Analytics", active: false, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 11.5V13h14v-1.5H1ZM3 9V7.5h2V9H3Zm4-4.5V9H5.5V4.5H7ZM9 6V9H7.5V6H9Zm2-2.5V9h-1.5V3.5H11Zm2 1V9h-1.5V4.5H13Z" /></svg> },
                { label: "Auto-Reply", active: false, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h11A1.5 1.5 0 0 1 15 3.5v6A1.5 1.5 0 0 1 13.5 11H9l-3 3v-3H2.5A1.5 1.5 0 0 1 1 9.5v-6Z" /></svg> },
              ].map((item) => (
                <button key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 12px", margin: "0 4px", borderRadius: "6px", background: item.active ? "rgba(255,255,255,0.08)" : "none", border: "none", color: item.active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: "13px", textAlign: "left" }}>
                  <span style={{ color: item.active ? "rgba(255,255,255,0.7)" : "#9c9da1" }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Main content */}
            <div className="flex-1 overflow-hidden" style={{ background: "#111113" }}>
              {/* Top bar */}
              <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Mon Stock</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["Filtrer", "Trier"].map(btn => (
                    <button key={btn} style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "5px", padding: "3px 8px", cursor: "pointer" }}>{btn}</button>
                  ))}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", padding: "10px 16px" }}>
                {[{ l: "Revenu", v: "1 247 €", c: "#18CB96" }, { l: "Articles", v: "34", c: "rgba(255,255,255,0.7)" }, { l: "Ventes", v: "12", c: "rgba(255,255,255,0.7)" }, { l: "Marge", v: "+28%", c: "#18CB96" }].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "8px 10px" }}>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{s.l}</p>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: s.c, margin: "2px 0 0" }}>{s.v}</p>
                  </div>
                ))}
              </div>

              {/* Items list */}
              <div style={{ margin: "0 16px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "8px", padding: "6px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  {["Article", "Prix", "Statut"].map(h => <span key={h} style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>)}
                </div>
                {[["T-shirt Nike", "18 €"], ["Jean Levi's", "35 €"], ["Veste Carhartt", "55 €"], ["Sneakers Vans", "28 €"], ["Pull Ralph Lauren", "22 €"]].map(([name, price], i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "8px", alignItems: "center", padding: "7px 12px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>{name}</span>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>{price}</span>
                    <span style={{ fontSize: "10px", background: "rgba(24,203,150,0.1)", color: "#18CB96", borderRadius: "20px", padding: "2px 7px" }}>En vente</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 2px rgba(24,203,150,0.25); }
          50% { box-shadow: 0 0 0 5px rgba(24,203,150,0.1); }
        }
      `}</style>
    </section>
  );
}
