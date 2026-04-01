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

        {/* Subtitle */}
        <p style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Inter',sans-serif", fontSize: "15px", lineHeight: 1.65, color: "rgba(255,255,255,0.45)", maxWidth: "460px", marginBottom: "32px" }}>
          Conçu pour les vendeurs Vinted. Automatise ta gestion, suis tes marges réelles et scale ton business d&apos;achat-revente.
        </p>

        {/* Single CTA */}
        <Link
          href="/register"
          className="inline-flex h-9 items-center rounded-[7px] px-4 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
          style={{ background: "#ffffff" }}
        >
          Commencer gratuitement
        </Link>
      </div>

      {/* Frame */}
      <div className="relative mt-14" style={{ marginLeft: "-20px", marginRight: "-20px" }}>
        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-40" style={{ background: "linear-gradient(to top, #080808 20%, transparent)" }} />

        {/* App window — fond noir comme demandé, image à ajouter après */}
        <div className="relative mx-auto overflow-hidden rounded-t-xl" style={{ maxWidth: "1100px", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none", background: "#000" }}>
          <div className="relative flex h-[460px]">

            {/* Sidebar */}
            <nav style={{ width: "220px", flexShrink: 0, background: "#0d0d0d", borderRight: "1px solid rgba(255,255,255,0.07)", padding: "12px 0", display: "flex", flexDirection: "column", gap: "2px" }}>
              {/* Workspace header */}
              <div style={{ padding: "0 12px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "4px" }}>
                <div className="flex items-center justify-between">
                  <button style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "4px 6px", borderRadius: "6px", fontSize: "13px", fontWeight: 500 }}>
                    <div style={{ width: "13px", height: "13px", borderRadius: "3px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", flexShrink: 0 }} />
                    Voyted
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="rgba(255,255,255,0.3)"><path d="M4.53 5.47a.75.75 0 0 0-1.06 1.06l4 4a.75.75 0 0 0 1.054.007l4-3.903a.75.75 0 0 0-1.048-1.073l-3.47 3.385L4.53 5.47Z" /></svg>
                  </button>
                  <div className="flex items-center gap-1">
                    <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "3px", borderRadius: "4px" }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M7 2C9.76142 2 12 4.23858 12 7C12 8.11012 11.6375 9.13519 11.0254 9.96484L13.7803 12.7197C14.0725 13.0118 14.0725 13.4882 13.7803 13.7803C13.4882 14.0725 13.0118 14.0725 12.7197 13.7803L9.96484 11.0254C9.13519 11.6375 8.11012 12 7 12C4.23858 12 2 9.76142 2 7C2 4.23858 4.23858 2 7 2ZM7 3.5C5.067 3.5 3.5 5.067 3.5 7C3.5 8.933 5.067 10.5 7 10.5C8.933 10.5 10.5 8.933 10.5 7C10.5 5.067 8.933 3.5 7 3.5Z" /></svg>
                    </button>
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
                { label: "Projets", active: false, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="#9c9da1"><path d="m11.927 13.232-1.354.78c-.937.54-1.406.811-1.904.917a3.22 3.22 0 0 1-1.338 0c-.498-.106-.967-.376-1.904-.917l-1.354-.78c-.937-.541-1.406-.811-1.747-1.19a3.212 3.212 0 0 1-.669-1.157C1.5 10.401 1.5 9.861 1.5 8.78V7.22c0-1.082 0-1.622.157-2.106.14-.429.368-.823.67-1.157.34-.379.809-.649 1.746-1.19l1.354-.78c.937-.54 1.406-.811 1.904-.917a3.22 3.22 0 0 1 1.338 0c.498.106.967.376 1.904.917l1.354.78c.937.541 1.406.811 1.747 1.19.301.334.53.728.669 1.157.157.484.157 1.024.157 2.106v1.56c0 1.082 0 1.622-.157 2.106-.14.429-.368.823-.67 1.157-.34.379-.809.649-1.746 1.19Zm-5.751-.52c.542.313.862.492 1.075.598V9.853a2.25 2.25 0 0 0-1.224-2.002l-3.02-1.51c-.005.217-.007.5-.007.878v1.56c0 1.183.017 1.438.084 1.642.074.229.196.439.356.617.144.16.358.303 1.383.894l1.353.78Zm2.575.597c.212-.105.532-.284 1.073-.596l1.353-.78c1.026-.592 1.239-.735 1.383-.895.16-.178.282-.389.356-.617.066-.204.084-.459.084-1.642V7.22c0-.378-.002-.661-.006-.878l-3 1.5-.007.003a2.25 2.25 0 0 0-1.236 2.009v3.456Zm3.757-8.402c-.15-.144-.42-.316-1.33-.841l-1.354-.78c-1.025-.592-1.256-.705-1.467-.75a1.72 1.72 0 0 0-.714 0c-.211.045-.442.158-1.467.75l-1.353.78c-.91.525-1.18.697-1.33.84L6.677 6.5l.026.013.29.145a2.25 2.25 0 0 0 2.013 0l.308-.154.009-.004 3.184-1.592Z" /></svg> },
                { label: "Plus", active: false, icon: <svg width="14" height="14" viewBox="0 0 16 16" fill="#9c9da1"><path d="M3 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm5 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" /></svg> },
              ].map((item) => (
                <button key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 12px", margin: "0 4px", borderRadius: "6px", background: item.active ? "rgba(255,255,255,0.08)" : "none", border: "none", color: item.active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: "13px", textAlign: "left" }}>
                  <span style={{ color: item.active ? "rgba(255,255,255,0.7)" : "#9c9da1" }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}

              {/* Favoris */}
              <div style={{ margin: "4px 0 0", padding: "0 4px" }}>
                <button style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "4px 8px", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "11px", fontWeight: 500, borderRadius: "5px" }}>
                  <span>Favoris</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.00194 10.6239C6.66861 10.8183 6.25 10.5779 6.25 10.192V5.80802C6.25 5.42212 6.66861 5.18169 7.00194 5.37613L10.7596 7.56811C11.0904 7.76105 11.0904 8.23895 10.7596 8.43189L7.00194 10.6239Z" /></svg>
                </button>
                {[
                  { label: "Stock en vente", color: "#f5c842", active: true },
                  { label: "Tâches auto-relist", color: "#9c9da1", active: false },
                  { label: "Suivi commandes", color: "#4ade80", active: false },
                  { label: "Messages clients", color: "#ef4444", active: false },
                ].map((fav, i) => (
                  <button key={i} style={{ display: "flex", alignItems: "center", gap: "7px", width: "100%", padding: "4px 8px", background: fav.active ? "rgba(255,255,255,0.06)" : "none", border: "none", borderRadius: "5px", color: fav.active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "12px", textAlign: "left" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <rect x="1" y="1" width="12" height="12" rx="6" stroke={fav.color} strokeWidth="1.5" fill="none" />
                      <path fill={fav.color} stroke="none" d="M 3.5,3.5 L3.5,0 A3.5,3.5 0 0,1 3.5, 7 z" transform="translate(3.5,3.5)" />
                    </svg>
                    {fav.label}
                  </button>
                ))}
              </div>
            </nav>

            {/* Main content — fond noir, image à ajouter après */}
            <div className="flex-1" style={{ background: "#000" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
