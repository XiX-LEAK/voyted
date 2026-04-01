import { Metadata } from "next";
import { SpreadsheetWrapper } from "./wrapper";

export const metadata: Metadata = { title: "Spreadsheet | Voyted" };

export default function SpreadsheetPage() {
  return <SpreadsheetWrapper />;
}
