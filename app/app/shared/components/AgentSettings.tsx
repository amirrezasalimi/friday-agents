import { Popover, PopoverContent, PopoverTrigger, Switch } from "@nextui-org/react";
import useAgents from "../hooks/agents";

export const AgentSettings = () => {
    const { agents, disabledAgents, setDisabledAgents } = useAgents();

    return (
        <Popover placement="top">
            <PopoverTrigger>
                <span
                    className="cursor-pointer text-gray-400"

                >
                    Settings
                </span>
            </PopoverTrigger>
            <PopoverContent className="p-4">
                <div className="flex flex-col gap-3">
                    <h4 className="text-medium font-medium">Enable/Disable Agents</h4>
                    {agents.map((agent) => (
                        <div key={agent.name} className="flex justify-between items-center">
                            <span className="text-sm">{agent.name}</span>
                            <Switch
                                defaultSelected
                                isSelected={!disabledAgents.includes(agent.name)}
                                onValueChange={(isSelected) => {
                                    setDisabledAgents(
                                        isSelected
                                            ? disabledAgents.filter((name) => name !== agent.name)
                                            : [...disabledAgents, agent.name]
                                    );
                                }}
                            />
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};
