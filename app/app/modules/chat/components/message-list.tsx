import { Button } from "@nextui-org/react";
import { IoArrowDown } from "react-icons/io5";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  memo,
} from "react";
import { ChatMessage } from "./message";
import { Message } from "~/shared/types/message";

interface MessageListProps {
  messages: Message[];
  onDeleteMessage: (id: string) => void;
  ref?: React.ForwardedRef<{ scrollToBottom: () => void }>;
}

export const MessageList = memo(
  forwardRef<{ scrollToBottom: () => void }, MessageListProps>(
    ({ messages, onDeleteMessage }, ref) => {
      const messagesEndRef = useRef<HTMLDivElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);
      const isFirstLoad = useRef(true);
      const [userScrolled, setUserScrolled] = useState(false);
      const [showScrollButton, setShowScrollButton] = useState(false);

      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
          behavior: isFirstLoad.current ? "instant" : "smooth",
        });
        isFirstLoad.current = false;
        setUserScrolled(false);
        setShowScrollButton(false);
      };

      useImperativeHandle(ref, () => ({
        scrollToBottom,
      }));

      const handleScroll = () => {
        if (containerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } =
            containerRef.current;
          const isScrolledToBottom =
            Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
          setUserScrolled(!isScrolledToBottom);
          setShowScrollButton(!isScrolledToBottom);
        }
      };

      useEffect(() => {
        if (!userScrolled) {
          scrollToBottom();
        }
      }, [messages.length]);

      return (
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-full flex flex-col gap-3 sm:gap-4 overflow-y-auto pb-4 px-2 sm:px-3 relative"
        >
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id || index}
              message={message}
              onDelete={onDeleteMessage}
            />
          ))}
          <div ref={messagesEndRef} />
          {showScrollButton && (
            <div className="fixed bottom-40 left-1/2 -translate-x-1/2 opacity-70">
              <Button
                className="p-1.5 rounded-full bg-white text-[#18181B] hover:bg-gray-200"
                onClick={scrollToBottom}
                isIconOnly
              >
                <IoArrowDown className="size-6" />
              </Button>
            </div>
          )}
        </div>
      );
    }
  )
);
