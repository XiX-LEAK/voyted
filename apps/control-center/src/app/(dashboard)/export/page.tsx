import { redirect } from "next/navigation";
export default function Page() {
  redirect("/inventaire?tab=export");
}
