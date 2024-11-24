import { Button } from "@nextui-org/react";
import { IoArrowUp } from "react-icons/io5";
import { useState } from 'react';
import { AgentSettings } from "~/shared/components/AgentSettings";

interface ChatInputProps {
    isProcessing: boolean;
    onSend: (content: string) => void;
}

export const ChatInput = ({ isProcessing, onSend }: ChatInputProps) => {
    const [content, setContent] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                return;
            }
            e.preventDefault();
            if (content.trim() && !isProcessing) {
                onSend(content);
                setContent('');
            }
        }
    };

    return (
        <div className="w-full h-40 relative px-2 gap-1 flex flex-col">
            <div className="relative size-full">
                <textarea
                    className="w-full h-full rounded-lg p-3 resize-none focus:outline-none bg-[#18181B] text-white relative block animate-border"
                    placeholder="What can I help you with?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                        className={`p-1.5 rounded-full text-[#18181B] ${content.trim() ? 'bg-white hover:text-gray-700' : 'bg-gray-600'
                            } transition-colors duration-200`}
                        disabled={!content.trim() || isProcessing}
                        onClick={() => {
                            if (content.trim()) {
                                onSend(content);
                                setContent('');
                            }
                        }}
                        isIconOnly
                    >
                        <IoArrowUp className="size-6" />
                    </Button>
                </div>
            </div>
            <div className="flex justify-end">
                <AgentSettings />
            </div>

        </div>
    );
};
