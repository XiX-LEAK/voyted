import { redirect } from "next/navigation";

export default function Page() {
  redirect("/automatisations?tab=planning");
}
