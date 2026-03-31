import { Metadata } from "next";
import { ChatsWrapper } from "./wrapper";

export const metadata: Metadata = {
  title: "Chats | Voyted",
  description: "Gérez vos messages Vinted depuis Voyted.",
};

export default function ChatsPage() {
  return <ChatsWrapper />;
}
