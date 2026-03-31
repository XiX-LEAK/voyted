import { Metadata } from "next";
import { StockWrapper } from "./wrapper";

export const metadata: Metadata = {
  title: "Mon Stock | Voyted",
  description: "Gérez vos articles en vente sur Vinted.",
};

export default function StockPage() {
  return <StockWrapper />;
}
