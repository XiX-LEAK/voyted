import { Metadata } from "next";
import { ExpeditionsWrapper } from "./wrapper";

export const metadata: Metadata = { title: "Expeditions | Voyted" };
export default function ExpeditionsPage() {
  return <ExpeditionsWrapper />;
}
