import { Spinner } from "@nextui-org/react";
import { TbTrash } from "react-icons/tb";
import { AgentContentRenderer } from "./agent-content-renderer";
import MessageContent from "./message-content";
import { Message } from "~/shared/types/message";


interface MessageProps {
    message: Message;
    onDelete: (id: string) => void;
}

export const ChatMessage = ({ message, onDelete }: MessageProps) => {
    return (
        <div className="w-full flex gap-2">
            <div className={`w-full flex items-center group gap-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'user' ? (
                    <>
                        <TbTrash
                            onClick={() => onDelete(message.id)}
                            className="cursor-pointer opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all"
                        />
                        <div className="flex gap-2 w-fit max-w-[80%]">
                            <p className="text-md rounded-md p-2 bg-white text-black">
                                {message.content}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex gap-2 w-full">
                            {message.meta?.outputType === 'view' ? (
                                <div className="flex flex-col gap-2 w-full">
                                    <AgentContentRenderer agent={message.meta.currentAgent || ''} data={message.meta?.data} />
                                    {
                                        message.content && (
                                            <p className="text-md w-fit max-w-[90%] flex flex-col rounded-md p-2 bg-[#27272A] text-white overflow-auto">
                                                <MessageContent content={message.content} />
                                            </p>
                                        )}
                                </div>
                            ) : (
                                <p className="text-md  max-w-[90%] flex flex-col gap-2 rounded-md p-2 bg-[#27272A] text-white overflow-scroll">
                                    {message.content && <MessageContent content={message.content} />}

                                    {message.meta?.status === 'error' && (
                                        <div className="text-sm text-red-500">
                                            Error: {message.meta.error}
                                        </div>
                                    )}
                                    {message.meta?.status === 'working' && (
                                        <div className="flex items-center gap-2">
                                            <Spinner size="sm" color="white" />
                                            <span className="text-gray-400">Assistant is thinking...</span>
                                        </div>
                                    )}
                                </p>
                            )}
                        </div>
                        <TbTrash
                            onClick={() => onDelete(message.id)}
                            className="cursor-pointer opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all"
                        />
                    </>
                )}
            </div>
        </div>
    );
}
