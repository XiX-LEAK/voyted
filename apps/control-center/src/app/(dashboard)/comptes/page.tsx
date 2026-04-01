import { Metadata } from "next";
import { ComptesWrapper } from "./wrapper";

export const metadata: Metadata = {
  title: "Mes Comptes | Voyted",
  description: "Gestion multi-comptes Vinted.",
};

export default function ComptesPage() {
  return <ComptesWrapper />;
}
