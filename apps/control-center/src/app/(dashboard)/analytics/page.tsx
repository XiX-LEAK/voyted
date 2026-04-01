import { Metadata } from "next";
import { AnalyticsWrapper } from "./wrapper";

export const metadata: Metadata = {
  title: "Analytics | Voyted",
  description: "Tableau de bord analytique de vos ventes Vinted.",
};

export default function AnalyticsPage() {
  return <AnalyticsWrapper />;
}
