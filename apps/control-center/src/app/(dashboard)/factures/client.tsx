"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { FileText, Download, Calculator, RefreshCw, Package, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVintedAccount } from "@/components/account-provider";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Order = {
  conversation_id: number;
  transaction_id: number;
  title: string;
  price: { amount: string; currency_code: string };
  status: string;
  date: string;
  photo: string | null;
  transaction_user_status: string;
};

const VINTED_FEE_RATE = 0.05;

function getOrderAmount(order: Order): number {
  const amount = parseFloat(order.price.amount);
  return isNaN(amount) ? 0 : amount;
}

function formatEur(value: number): string {
  return value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC";
}

function getInvoiceNumber(index: number): string {
  const year = new Date().getFullYear();
  return `FAC-${year}-${String(index + 1).padStart(3, "0")}`;
}

function generateInvoicePDF(order: Order, index: number, purchasePrice?: number): jsPDF {
  const doc = new jsPDF();
  const amount = getOrderAmount(order);
  const fees = amount * VINTED_FEE_RATE;
  const net = amount - fees;
  const invoiceNumber = getInvoiceNumber(index);
  const date = order.date ? new Date(order.date).toLocaleDateString("fr-FR") : "—";
  const now = new Date().toLocaleString("fr-FR");

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", 20, 30);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(invoiceNumber, 20, 38);
  doc.text(`Date : ${date}`, 20, 45);

  // Seller info
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text("Vendeur :", 20, 60);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("@Vendeur Vinted", 20, 67);

  // Separator
  doc.setDrawColor(200);
  doc.line(20, 75, 190, 75);

  // Item details table
  const tableData = [
    [
      order.title,
      formatEur(amount),
      formatEur(fees),
      formatEur(net),
    ],
  ];

  autoTable(doc, {
    startY: 82,
    head: [["Article", "Prix de vente", "Frais Vinted (5%)", "Montant net"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [60, 60, 60], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 20, right: 20 },
  });

  // Totals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || 110;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sous-total HT :", 120, finalY + 15);
  doc.setFont("helvetica", "bold");
  doc.text(formatEur(net), 170, finalY + 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text("TVA (0%) :", 120, finalY + 23);
  doc.text(formatEur(0), 170, finalY + 23, { align: "right" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total TTC :", 120, finalY + 35);
  doc.text(formatEur(net), 170, finalY + 35, { align: "right" });

  // Margin section if purchase price provided
  if (purchasePrice !== undefined && purchasePrice > 0) {
    const margin = net - purchasePrice;
    const marginPct = amount > 0 ? (margin / amount) * 100 : 0;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Prix d'achat : ${formatEur(purchasePrice)}`, 20, finalY + 15);
    doc.text(`Marge nette : ${formatEur(margin)} (${marginPct.toFixed(1)}%)`, 20, finalY + 23);
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text(`Genere par Voyted - ${now}`, 105, 285, { align: "center" });

  return doc;
}

function loadPurchasePrices(): Record<string, number> {
  try {
    const raw = localStorage.getItem("voyted:purchase-prices");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePurchasePrices(prices: Record<string, number>) {
  localStorage.setItem("voyted:purchase-prices", JSON.stringify(prices));
}

export default function FacturesClient() {
  const { linked, loading: accountLoading } = useVintedAccount();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasePrices, setPurchasePrices] = useState<Record<string, number>>({});
  const [boostSpend, setBoostSpend] = useState(() => {
    try {
      return parseFloat(localStorage.getItem("voyted:boost-spend") || "0") || 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    setPurchasePrices(loadPurchasePrices());
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/sold", { cache: "no-store" });
      const data = await res.json();
      setOrders(data.my_orders || data.orders || []);
    } catch {
      toast.error("Impossible de charger les ventes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (linked) fetchOrders();
  }, [linked]);

  function handlePurchasePriceChange(transactionId: number, value: string) {
    const num = parseFloat(value);
    const updated = { ...purchasePrices };
    if (isNaN(num) || num <= 0) {
      delete updated[String(transactionId)];
    } else {
      updated[String(transactionId)] = num;
    }
    setPurchasePrices(updated);
    savePurchasePrices(updated);
  }

  function handleBoostSpendChange(value: string) {
    const num = parseFloat(value) || 0;
    setBoostSpend(num);
    localStorage.setItem("voyted:boost-spend", String(num));
  }

  function downloadInvoice(order: Order, index: number) {
    const pp = purchasePrices[String(order.transaction_id)];
    const doc = generateInvoicePDF(order, index, pp);
    doc.save(`${getInvoiceNumber(index)}.pdf`);
    toast.success(`Facture ${getInvoiceNumber(index)} telechargee`);
  }

  function downloadAllInvoices() {
    if (orders.length === 0) return;

    // Merge all invoices into a single PDF
    const doc = new jsPDF();
    let firstPage = true;

    orders.forEach((order, index) => {
      if (!firstPage) doc.addPage();
      firstPage = false;

      const amount = getOrderAmount(order);
      const fees = amount * VINTED_FEE_RATE;
      const net = amount - fees;
      const invoiceNumber = getInvoiceNumber(index);
      const date = order.date ? new Date(order.date).toLocaleDateString("fr-FR") : "—";
      const now = new Date().toLocaleString("fr-FR");
      const pp = purchasePrices[String(order.transaction_id)];

      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("FACTURE", 20, 30);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(invoiceNumber, 20, 38);
      doc.text(`Date : ${date}`, 20, 45);

      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text("Vendeur :", 20, 60);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("@Vendeur Vinted", 20, 67);

      doc.setDrawColor(200);
      doc.line(20, 75, 190, 75);

      autoTable(doc, {
        startY: 82,
        head: [["Article", "Prix de vente", "Frais Vinted (5%)", "Montant net"]],
        body: [[
          order.title,
          formatEur(amount),
          formatEur(fees),
          formatEur(net),
        ]],
        theme: "grid",
        headStyles: { fillColor: [60, 60, 60], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 9 },
        margin: { left: 20, right: 20 },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable?.finalY || 110;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.text("Sous-total HT :", 120, finalY + 15);
      doc.setFont("helvetica", "bold");
      doc.text(formatEur(net), 170, finalY + 15, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.text("TVA (0%) :", 120, finalY + 23);
      doc.text(formatEur(0), 170, finalY + 23, { align: "right" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Total TTC :", 120, finalY + 35);
      doc.text(formatEur(net), 170, finalY + 35, { align: "right" });

      if (pp && pp > 0) {
        const margin = net - pp;
        const marginPct = amount > 0 ? (margin / amount) * 100 : 0;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(`Prix d'achat : ${formatEur(pp)}`, 20, finalY + 15);
        doc.text(`Marge nette : ${formatEur(margin)} (${marginPct.toFixed(1)}%)`, 20, finalY + 23);
      }

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150);
      doc.text(`Genere par Voyted - ${now}`, 105, 285, { align: "center" });
    });

    doc.save("Factures-Voyted.pdf");
    toast.success(`${orders.length} facture${orders.length > 1 ? "s" : ""} generee${orders.length > 1 ? "s" : ""}`);
  }

  const marginStats = useMemo(() => {
    let totalRevenue = 0;
    let totalFees = 0;
    let totalNet = 0;
    let totalPurchase = 0;
    let itemsWithPurchase = 0;

    orders.forEach((order) => {
      const amount = getOrderAmount(order);
      const fees = amount * VINTED_FEE_RATE;
      const net = amount - fees;
      totalRevenue += amount;
      totalFees += fees;
      totalNet += net;

      const pp = purchasePrices[String(order.transaction_id)];
      if (pp && pp > 0) {
        totalPurchase += pp;
        itemsWithPurchase++;
      }
    });

    const totalMargin = totalNet - totalPurchase - boostSpend;
    const marginPct = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalFees,
      totalNet,
      totalPurchase,
      totalMargin,
      marginPct,
      itemsWithPurchase,
    };
  }, [orders, purchasePrices, boostSpend]);

  if (accountLoading) return <div className="h-96 animate-pulse rounded-lg bg-muted" />;

  if (!linked) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <FileText className="h-12 w-12 text-foreground/24" />
      <div>
        <h2 className="text-base font-semibold">Compte Vinted non connecte</h2>
        <p className="mt-1 text-sm text-foreground/48">Connectez votre compte pour generer vos factures.</p>
      </div>
      <Button asChild size="sm">
        <Link href="/account">Connecter mon compte</Link>
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold">Factures</h1>
          <p className="text-sm text-foreground/48 mt-1">{orders.length} vente{orders.length !== 1 ? "s" : ""} disponible{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadAllInvoices} disabled={orders.length === 0} className="gap-2" size="sm">
            <Download className="h-4 w-4" />
            Generer toutes les factures
          </Button>
          <Button onClick={fetchOrders} disabled={loading} variant="ghost" className="gap-2 text-foreground/48 hover:text-foreground/72">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Margin Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-foreground/32" />
            <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Revenu total</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">{formatEur(marginStats.totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-foreground/32" />
            <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Frais Vinted</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground/48">{formatEur(marginStats.totalFees)}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-foreground/32" />
            <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Net apres frais</p>
          </div>
          <p className="mt-3 text-2xl font-semibold text-foreground">{formatEur(marginStats.totalNet)}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-foreground/32" />
            <p className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Marge nette</p>
          </div>
          <p className={`mt-3 text-2xl font-semibold ${marginStats.totalMargin >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatEur(marginStats.totalMargin)}
          </p>
          <p className="text-xs text-foreground/48 mt-0.5">{marginStats.marginPct.toFixed(1)}% de marge</p>
        </div>
      </div>

      {/* Boost / Promotion expenses */}
      <div className="rounded-xl border border-border/50 bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="h-4 w-4 text-foreground/32" />
          <h2 className="text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Depenses Boost / Promotions (mensuel)</h2>
        </div>
        <div className="flex items-center gap-3 max-w-xs">
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={boostSpend || ""}
            onChange={(e) => handleBoostSpendChange(e.target.value)}
            className="h-9"
          />
          <span className="text-sm text-foreground/48 whitespace-nowrap">EUR / mois</span>
        </div>
      </div>

      {/* Orders list with margin calculation */}
      {loading && orders.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <Package className="h-12 w-12 text-foreground/24" />
          <p className="text-foreground/48">Aucune vente pour le moment</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Facture</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Article</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider hidden sm:table-cell">Conversation</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Prix</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider hidden md:table-cell">Frais (5%)</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider hidden md:table-cell">Net</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider hidden lg:table-cell">Prix d&apos;achat</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium text-foreground/36 uppercase tracking-wider hidden lg:table-cell">Marge</th>
                <th className="px-4 py-3 text-right text-[11px] font-medium text-foreground/36 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const amount = getOrderAmount(order);
                const fees = amount * VINTED_FEE_RATE;
                const net = amount - fees;
                const pp = purchasePrices[String(order.transaction_id)] || 0;
                const margin = pp > 0 ? net - pp : null;
                const date = order.date ? new Date(order.date).toLocaleDateString("fr-FR") : "—";

                return (
                  <tr key={order.transaction_id} className="border-t border-border/30 hover:bg-accent/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-xs font-mono text-foreground/48">{getInvoiceNumber(index)}</div>
                      <div className="text-xs text-foreground/36">{date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium line-clamp-1">{order.title}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground/48 hidden sm:table-cell">
                      #{order.conversation_id}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground/90">{formatEur(amount)}</td>
                    <td className="px-4 py-3 text-sm text-foreground/48 hidden md:table-cell">{formatEur(fees)}</td>
                    <td className="px-4 py-3 text-sm font-medium hidden md:table-cell">{formatEur(net)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={purchasePrices[String(order.transaction_id)] || ""}
                        onChange={(e) => handlePurchasePriceChange(order.transaction_id, e.target.value)}
                        className="h-7 w-20 text-xs"
                      />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {margin !== null ? (
                        <span className={`text-sm font-semibold ${margin >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {formatEur(margin)}
                        </span>
                      ) : (
                        <span className="text-xs text-foreground/36">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        onClick={() => downloadInvoice(order, index)}
                        size="sm"
                        variant="ghost"
                        className="gap-1.5 text-xs text-foreground/48 hover:text-foreground/72"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Generer facture
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
