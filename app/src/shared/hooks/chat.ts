import { useParams } from "next/navigation";
import { useReactiveStore, useStoreYDoc } from "./store";
import { useEffect, useRef, useState } from "react";
import { generateId } from "../utils/id-generator";
import { Message } from "../types/message";
import { AgentViewItem } from "@/modules/chat/components/agents";
import { FridayAgents } from "@friday-agents/core";
import useAgents from "./agents";
import { CHAT_API_URL, SEARCH_API_URL } from "../constants/api";


const useChat = () => {
    const params = useParams();
    const state = useReactiveStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const doc = useStoreYDoc();
    const { activeAgents } = useAgents();


    const processMessage = (id: string) => {
        return new Promise<void>((resolve, reject) => {
            const message = state.messages.find((m) => m.id === id);
            if (!message) return reject(new Error("Message not found"));

            // Initialize meta object once
            const startTime = Date.now();

            const lastMessage = state.messages[state.messages.length - 1];
            const _assistantMessage: Message = lastMessage.role == "user" ? {
                id: generateId(),
                role: "assistant",
                content: "",
                timestamp: Date.now(),
                meta: {
                    status: "working",
                    currentAgent: "reasoning"
                }
            } : lastMessage;
            if (lastMessage.role != "assistant") {
                state.messages.push(_assistantMessage);
            }

            const assistantMessage = state.messages.find((m) => m.id === _assistantMessage.id)!

            const updateMeta = (updates: Partial<Message['meta']>) => {
                doc.transact(() => {
                    Object.assign(assistantMessage.meta!, updates);
                });
            };
            doc.transact(() => {
                updateMeta({
                    status: "working",
                    currentAgent: "reasoning"
                });
            });

            // last item shouldn't be assistant's message, check
            const normalizedMessages = state.messages.filter((m) => m.id !== assistantMessage.id).map(({ role, content }) => ({ role, content }))

            const fa = new FridayAgents({
                agents: activeAgents,
                baseLLm: {
                    apikey: "...",
                    endpoint: CHAT_API_URL,
                    model: "..."
                },
                maxAgentRetry: 3,
                onAgentFailed(name, error) {
                    updateMeta({
                        status: "error",
                        error: `${name}: ${error}`
                    });
                },
                onAgentFinished(name, result) {
                    // No need to update anything here as it's handled in onFinish
                },
                onFinish(data) {
                    console.log("Final result:", data);
                    doc.transact(() => {
                        assistantMessage.content = data?.finalResponse?.text || "";
                        updateMeta({
                            status: "done",
                            data: data?.finalResponse?.data,
                            usedSeconds: (Date.now() - startTime) / 1000,
                            outputType: data?.finalResponse?.type,
                        });
                    });
                    resolve();
                },
                onChooseAgents(reason, agents) {
                    updateMeta({
                        agentsReasoning: reason,
                        agents: ['reasoning', ...agents]
                    });
                },
                onUsingAgent(name) {
                    updateMeta({
                        currentAgent: name
                    });
                },
            });

            try {
                // formated YYYY-MM-DD
                const todayDate = new Date().toISOString().split('T')[0];
                const cutoffDate = "2023-01-01";
                const oldMessages = state.messages.filter((m) => m.id !== id);
                fa.run({
                    messages: normalizedMessages,
                    // prompt: message.content,
                    date: todayDate,
                    cutoff_date: cutoffDate
                }).catch(reject);
            } catch (error) {
                updateMeta({
                    status: "error",
                    error: error instanceof Error ? error.message : "Unknown error occurred"
                });
                reject(error);
            }
        });
    }
    const initialChecked = useRef(false);
    useEffect(() => {
        if (state.messages.length && !initialChecked.current) {
            const lastMessage = state.messages[state.messages.length - 1];
            const status = lastMessage?.meta?.status;
            if (status === "working") {
                processMessage(lastMessage.id);
            } else if (lastMessage.role === "user") {
                processMessage(lastMessage.id);
            }
            initialChecked.current = true;
        }
    }, [state.messages.length])


    const sendMessage = (message: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!message.trim()) {
                reject(new Error("Message cannot be empty"));
                return;
            }

            if (isProcessing) {
                reject(new Error("Message processing in progress"));
                return;
            }

            const lastMessage = state.messages[state.messages.length - 1];
            if (lastMessage?.meta?.status === "working") {
                reject(new Error("Previous message still processing"));
                return;
            }

            setIsProcessing(true);
            const id = generateId();
            state.messages.push({
                id,
                role: "user",
                content: message,
                timestamp: Date.now(),
                meta: {
                    status: "done",
                }
            });

            processMessage(id)
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                })
                .finally(() => {
                    setIsProcessing(false);
                });
        });
    }


    const agentsView = (): AgentViewItem[] => {
        const lastMessage = state.messages[state.messages.length - 1];
        if (!lastMessage) return [];
        const agents = lastMessage.meta?.agents || ['reasoning'];
        const usedSeconds = lastMessage.meta?.usedSeconds || 0;
        const currentStatus = lastMessage.meta?.status || 'idle';
        const currentAgent = lastMessage.meta?.currentAgent;

        return agents.map((agent) => {
            let status: 'idle' | 'working' | 'done' | 'error' = 'idle';

            if (currentStatus === 'error') {
                status = agent === currentAgent ? 'error' : 'done';
            } else if (agent === currentAgent) {
                status = currentStatus;
            } else if (currentAgent) {
                // If we have a current agent, previous agents are done and next ones are idle
                status = agents.indexOf(agent) < agents.indexOf(currentAgent) ? 'done' : 'idle';
            }

            return {
                status,
                agent,
                usedSeconds,
                content: lastMessage.meta?.data?.[agent]?.finalResponse?.text,
                error: agent === currentAgent ? lastMessage.meta?.error : undefined
            };
        });
    }

    const delMessage = (id: string) => {
        const index = state.messages.findIndex((m) => m.id === id);
        if (index !== -1) {
            doc.transact(() => {
                state.messages.splice(index, state.messages.length - index);
            });
        }
    }

    return { id: params["id"] as string, state, isProcessing, sendMessage, agentsView, delMessage };
}

export default useChat