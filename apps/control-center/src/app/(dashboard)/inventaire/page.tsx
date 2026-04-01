import { Metadata } from "next";
import { InventaireWrapper } from "./wrapper";

export const metadata: Metadata = { title: "Inventaire | Voyted" };
export default function InventairePage() {
  return <InventaireWrapper />;
}
