"use client";

const items = ["T-shirt Nike +8€", "Jean Levi's +18€", "Veste Carhartt +32€", "Sneakers Vans +12€", "Pull Ralph Lauren +25€"];
const invoices = ["FAC-2024-001 35€", "FAC-2024-002 28€", "FAC-2024-003 55€", "FAC-2024-004 42€", "FAC-2024-005 19€"];

const notifs = [
  { icon: "⚠️", color: "rgb(255,107,107)", title: "Stock faible", sub: "Jean Levi's : 2 restants", time: "il y a 10m" },
  { icon: "📄", color: "rgb(30,134,255)", title: "Facture générée", sub: "FAC-2024-0142 créée", time: "il y a 5m" },
  { icon: "✅", color: "rgb(255,184,0)", title: "Import terminé", sub: "12 articles synchronisés", time: "il y a 2m" },
  { icon: "💰", color: "rgb(0,201,167)", title: "Nouvelle vente", sub: "T-shirt Nike vendu +15€", time: "à l'instant" },
];

const cardClass = "group relative flex flex-col justify-between overflow-hidden rounded-xl bg-zinc-900 border border-white/10";

export function LandingFeatures() {
  return (
    <section id="features" className="content-auto">
      <div className="py-24">
        <div className="relative container mx-auto px-4 py-16 max-w-7xl">
          <div className="text-center space-y-4 pb-6 mx-auto">
            <h2 className="text-lg text-white/60 font-mono font-medium tracking-wider uppercase">L&apos;arsenal ultime</h2>
            <h3 className="text-4xl font-bold lg:text-5xl tracking-tight text-white">Tout ce qu&apos;il te faut pour dominer Vinted</h3>
          </div>

          <div className="grid w-full auto-rows-[22rem] grid-cols-3 gap-4 max-w-5xl mx-auto mt-12 px-4">

            {/* Card 1 — Marquee articles + 10h */}
            <div className={`${cardClass} col-span-3 lg:col-span-1`}>
              <div>
                <div className="group flex overflow-hidden p-2 gap-4 flex-row absolute top-10" style={{ maskImage: "linear-gradient(to top, transparent 40%, #000 100%)", WebkitMaskImage: "linear-gradient(to top, transparent 40%, #000 100%)" }}>
                  {[0, 1, 2, 3].map(k => (
                    <div key={k} className="flex shrink-0 justify-around gap-4 flex-row" style={{ animation: "marquee 20s linear infinite" }}>
                      {items.map((item, i) => (
                        <figure key={i} className="relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4 border-white/10 bg-white/10 hover:bg-white/15 blur-[1px] transition-all duration-300 ease-out hover:blur-none">
                          <div className="flex flex-col">
                            <figcaption className="text-sm font-medium text-white">{item.split(" ").slice(0, -1).join(" ")}</figcaption>
                            <span className="text-xs text-emerald-500 font-bold">{item.split(" ").slice(-1)[0]}</span>
                          </div>
                        </figure>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="pointer-events-none z-10 flex flex-col gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80" aria-hidden="true"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
                  <h3 className="text-xl font-semibold text-white">10h gagnées par mois</h3>
                  <p className="max-w-lg text-neutral-400">Automatise ta gestion de A à Z.</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-white/[.03]" />
            </div>

            {/* Card 2 — Notifications + Sync Token */}
            <div className={`${cardClass} col-span-3 lg:col-span-2`}>
              <div>
                <div className="flex flex-col overflow-hidden p-2 absolute right-2 top-4 h-[300px] w-full scale-75 border-none transition-all duration-300 ease-out group-hover:scale-90" style={{ maskImage: "linear-gradient(to top, transparent 10%, #000 100%)", WebkitMaskImage: "linear-gradient(to top, transparent 10%, #000 100%)" }}>
                  <div className="flex flex-col items-center gap-4">
                    {notifs.map((n, i) => (
                      <div key={i} className="mx-auto w-full" style={{ opacity: 1 }}>
                        <figure className="relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4 transition-all duration-200 ease-in-out hover:scale-[103%] bg-transparent backdrop-blur-md border border-white/10" style={{ boxShadow: "0 -20px 80px -20px rgba(255,255,255,0.05) inset" }}>
                          <div className="flex flex-row items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl" style={{ backgroundColor: n.color }}>
                              <span className="text-lg">{n.icon}</span>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium text-white">
                                <span className="text-sm sm:text-lg">{n.title}</span>
                                <span className="mx-1">·</span>
                                <span className="text-xs text-gray-500">{n.time}</span>
                              </figcaption>
                              <p className="text-sm font-normal text-white/60">{n.sub}</p>
                            </div>
                          </div>
                        </figure>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="pointer-events-none z-10 flex flex-col gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
                  <h3 className="text-xl font-semibold text-white">Synchronisation Token</h3>
                  <p className="max-w-lg text-neutral-400">Récupère photos, statuts et bordereaux en temps réel.</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-white/[.03]" />
            </div>

            {/* Card 3 — Beam diagram + Calcul de Marge */}
            <div className={`${cardClass} col-span-3 lg:col-span-2`}>
              <div>
                <div className="flex w-full items-center justify-center overflow-hidden p-10 absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out group-hover:scale-105" style={{ maskImage: "linear-gradient(to top, transparent 10%, #000 100%)", WebkitMaskImage: "linear-gradient(to top, transparent 10%, #000 100%)" }}>
                  <div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
                    {/* Left icons */}
                    <div className="flex flex-col justify-center gap-2">
                      {[
                        <svg key="mail" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>,
                        <svg key="pkg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>,
                        <svg key="chart" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
                      ].map((icon, i) => (
                        <div key={i} className="z-10 flex size-12 items-center justify-center rounded-full border-2 border-white/20 bg-zinc-900 p-3 shadow-lg">
                          <span className="text-white">{icon}</span>
                        </div>
                      ))}
                    </div>
                    {/* Center */}
                    <div className="flex flex-col justify-center">
                      <div className="z-10 flex items-center justify-center rounded-full border-2 border-white/20 bg-zinc-900 p-3 shadow-lg size-16">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
                      </div>
                    </div>
                    {/* Right icons */}
                    <div className="flex flex-col justify-center gap-2">
                      {[
                        <svg key="file" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>,
                        <svg key="chart2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
                        <svg key="pkg2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>,
                      ].map((icon, i) => (
                        <div key={i} className="z-10 flex size-12 items-center justify-center rounded-full border-2 border-white/20 bg-zinc-900 p-3 shadow-lg">
                          <span className="text-white">{icon}</span>
                        </div>
                      ))}
                    </div>
                    {/* SVG beams */}
                    <svg fill="none" width="654" height="300" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-0 top-0 stroke-2" viewBox="0 0 654 300">
                      {[[95,94],[95,150],[95,206]].map(([y1], i) => (
                        <g key={i}>
                          <path d={`M 95,${y1} Q 211,${y1} 327,150`} stroke="gray" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round"/>
                          <path d={`M 95,${y1} Q 211,${y1} 327,150`} strokeWidth="2" stroke="url(#beam-l-${i})" strokeOpacity="1" strokeLinecap="round"/>
                          <defs>
                            <linearGradient id={`beam-l-${i}`} gradientUnits="userSpaceOnUse" x1="109%" x2="99%" y1="0%" y2="0%">
                              <stop stopColor="#ffaa40" stopOpacity="0"/>
                              <stop stopColor="#ffaa40"/>
                              <stop offset="32.5%" stopColor="#9c40ff"/>
                              <stop offset="100%" stopColor="#9c40ff" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                        </g>
                      ))}
                      {[[94],[150],[206]].map(([y2], i) => (
                        <g key={i}>
                          <path d={`M 327,150 Q 443,150 559,${y2}`} stroke="gray" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round"/>
                          <path d={`M 327,150 Q 443,150 559,${y2}`} strokeWidth="2" stroke="url(#beam-r-${i})" strokeOpacity="1" strokeLinecap="round"/>
                          <defs>
                            <linearGradient id={`beam-r-${i}`} gradientUnits="userSpaceOnUse" x1="110%" x2="100%" y1="0%" y2="0%">
                              <stop stopColor="#ffaa40" stopOpacity="0"/>
                              <stop stopColor="#ffaa40"/>
                              <stop offset="32.5%" stopColor="#9c40ff"/>
                              <stop offset="100%" stopColor="#9c40ff" stopOpacity="0"/>
                            </linearGradient>
                          </defs>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="pointer-events-none z-10 flex flex-col gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/></svg>
                  <h3 className="text-xl font-semibold text-white">Calcul de Marge</h3>
                  <p className="max-w-lg text-neutral-400">Frais Vinted, boosts et charges sociales inclus.</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-white/[.03]" />
            </div>

            {/* Card 4 — Marquee invoices + Factures */}
            <div className={`${cardClass} col-span-3 lg:col-span-1`}>
              <div>
                <div className="group flex overflow-hidden p-2 gap-4 flex-col absolute top-10 w-full" style={{ maskImage: "linear-gradient(to top, transparent 40%, #000 100%)", WebkitMaskImage: "linear-gradient(to top, transparent 40%, #000 100%)" }}>
                  {[0, 1, 2].map(k => (
                    <div key={k} className="flex shrink-0 justify-around gap-4 flex-row" style={{ animation: "marquee 25s linear infinite reverse" }}>
                      {invoices.map((inv, i) => (
                        <figure key={i} className="relative w-36 cursor-pointer overflow-hidden rounded-xl border p-4 border-white/10 bg-white/10 hover:bg-white/15 blur-[1px] transition-all duration-300 ease-out hover:blur-none">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                            <div className="flex flex-col">
                              <figcaption className="text-xs font-medium text-neutral-500">{inv.split(" ")[0]}</figcaption>
                              <span className="text-sm font-bold text-white">{inv.split(" ")[1]}</span>
                            </div>
                          </div>
                        </figure>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="pointer-events-none z-10 flex flex-col gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                  <h3 className="text-xl font-semibold text-white">Factures &amp; Documents</h3>
                  <p className="max-w-lg text-neutral-400">Ventes et achats. Conformes et horodatés.</p>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-white/[.03]" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
