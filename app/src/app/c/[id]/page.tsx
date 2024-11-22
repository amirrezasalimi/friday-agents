'use client';
import Chat from "@/modules/chat";
import { StoreProvider } from "@/shared/hooks/store";
import { useParams } from "next/navigation";

const ChatPage = () => {
    const params = useParams();
    const id = params["id"] as string;
    return (
        <StoreProvider roomId={id}>
            <Chat />
        </StoreProvider>
    );
}
export default ChatPage;