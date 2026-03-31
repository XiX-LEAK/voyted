import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Chats | Voyted",
  description: "Gérez vos messages Vinted depuis Voyted.",
};

// Chargement côté client uniquement — évite les erreurs d'hydratation avec extensions Chrome
const ChatsClient = dynamic(() => import("./client").then(m => ({ default: m.ChatsClient })), {
  ssr: false,
  loading: () => (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="h-96 animate-pulse rounded-3xl bg-muted" />
      <div className="h-96 animate-pulse rounded-3xl bg-muted" />
    </div>
  ),
});

export default function ChatsPage() {
  return <ChatsClient />;
}
