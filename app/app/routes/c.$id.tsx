import { useParams } from "@remix-run/react";
import Chat from "~/modules/chat";
import { StoreProvider } from "~/shared/hooks/store";

export default function ChatPage() {
  const params = useParams();
  const id = params.id as string;
  
  return (
    <StoreProvider roomId={id}>
      <Chat />
    </StoreProvider>
  );
}
