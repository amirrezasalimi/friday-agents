import { useReactiveStore } from "./store";
import { useRouter } from "next/navigation";
import makeUrl from "../utils/make-url";
import { LINKS } from "../constants/links";
import useChatId from "./chat-id";
import { generateId } from "../utils/id-generator";

const useInitChat = () => {
    const id = useChatId();
    const state = useReactiveStore();

    const nav = useRouter();
    const initializeChat = (message: string) => {
        state.messages.push({
            id: generateId(),
            role: "user",
            content: message,
            timestamp: Date.now(),
            meta: {
                status: "idle"
            },
        });
        setTimeout(
            () => nav.push(makeUrl(LINKS.CHAT, {
                id,
            }))
            , 500)
    }

    return {
        chatId: id,
        initializeChat
    }
}

export default useInitChat