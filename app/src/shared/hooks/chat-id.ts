import { useStore } from "./store"

const useChatId = () => {
    const { roomId } = useStore();

    return roomId;
}

export default useChatId