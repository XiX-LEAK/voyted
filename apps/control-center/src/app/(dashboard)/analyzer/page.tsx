import { Metadata } from "next";
import { AnalyzerWrapper } from "./wrapper";

export const metadata: Metadata = {
  title: "Analyseur | Voyted",
  description: "Analysez n'importe quel vendeur Vinted.",
};

export default function AnalyzerPage() {
  return <AnalyzerWrapper />;
}
