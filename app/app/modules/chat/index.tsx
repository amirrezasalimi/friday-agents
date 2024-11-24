import useChat from "~/shared/hooks/chat";
import AgentsView from "./components/agents";
import { useRef } from "react";
import { MessageList } from "./components/message-list";
import { ChatInput } from "./components/chat-input";

const Chat = () => {
    const chat = useChat();
    const messageListRef = useRef<{ scrollToBottom: () => void }>(null);

    const sendMessage = async (content: string) => {
        chat.sendMessage(content).then(() => {
            // Add a small delay to ensure the message is rendered before scrolling
            setTimeout(() => {
                messageListRef.current?.scrollToBottom();
            }, 100);
        });
        setTimeout(() => {
            messageListRef.current?.scrollToBottom();
        }, 50);
    };

    return (
        <div className="w-full relative">
            {/* Desktop Agents View */}
            <div className="absolute -left-48 top-1/2 -translate-y-1/2 w-40 hidden md:block">
                <AgentsView items={chat.agentsView()} />
            </div>

            <div className="w-full h-full flex flex-col py-4">
                <MessageList
                    ref={messageListRef}
                    messages={chat.state.messages}
                    onDeleteMessage={chat.delMessage}
                />
                {/* Mobile Agents View */}
                <div className="md:hidden w-full p-2">
                    <AgentsView items={chat.agentsView()} />
                </div>
                <ChatInput
                    isProcessing={chat.isProcessing}
                    onSend={sendMessage}
                />
            </div>
        </div>
    );
};

export default Chat;