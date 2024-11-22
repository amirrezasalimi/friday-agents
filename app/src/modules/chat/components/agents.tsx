import AgentDefaultIcon from "@/shared/components/icons/agent-default-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { cn } from "@nextui-org/theme";
import { FaPlus } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";

export interface AgentViewItem {
    status: 'idle' | 'working' | 'error' | 'done'
    agent: string
    usedSeconds?: number
    content?: string
    error?: string
}
const AgentsView = ({ items }: {
    items: AgentViewItem[]
}) => {
    const normalizedItems = items.filter((item) => item.agent !== 'no-tool');
    return (
        <div className="w-full flex flex-col gap-8">
            {
                normalizedItems.map((item, index) => (
                    <div key={index} className="w-full flex flex-col gap-2">
                        <div className="w-full flex gap-3 items-center">
                            <div className={
                                cn(
                                    "size-8 flex justify-center items-center rounded-full border",
                                    item.status === 'idle' && "text-[#686868] border-[#686868]",
                                    item.status === 'working' && "text-[#8B93FF] border-[#8B93FF]",
                                    item.status === 'done' && "text-green-600 border-green-600",
                                    item.status === 'error' && "text-red-600 border-red-600"
                                )
                            }>
                                {
                                    item.status === 'idle' ? (
                                        <AgentDefaultIcon className="size-5" />
                                    ) :
                                        item.status === 'working' ? (
                                            <AgentDefaultIcon className="size-5 animate-pulse !duration-2000" />
                                        ) :
                                            item.status === 'done' ? (
                                                <FaCheck className="size-5" />
                                            ) : item.status === 'error' && (
                                                <FaPlus className="size-5 rotate-45" />
                                            )
                                }
                            </div>
                            <div className="flex flex-col">
                                <p className="text-md capitalize text-gray-400">{item.agent}{item.status === 'working' && `...`}</p>
                                {
                                    item.error && <span className="text-sm text-gray-500">
                                        <Popover placement="bottom" showArrow={true}>
                                            <PopoverTrigger className="cursor-pointer">
                                                Error
                                            </PopoverTrigger>
                                            <PopoverContent>
                                                <div className="p-2">
                                                    <div className="text-sm">{item.error}</div>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </span>
                                }
                            </div>
                        </div>
                    </div>
                ))
            }
        </div>
    );
};

export default AgentsView;