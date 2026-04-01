import { Metadata } from "next";
import { CalendrierWrapper } from "./wrapper";

export const metadata: Metadata = { title: "Calendrier | Voyted" };
export default function CalendrierPage() {
  return <CalendrierWrapper />;
}
