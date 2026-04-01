import { Metadata } from "next";
import { AutomatisationsWrapper } from "./wrapper";

export const metadata: Metadata = { title: "Automatisations | Voyted" };

export default function AutomatisationsPage() {
  return <AutomatisationsWrapper />;
}
