import ReplicateImageAgent from "../agents/replicate-image";
import { Agent, SearchAgent, ChartAgent, CodeGenAgent } from "@friday-agents/core";
import { useLocalStorage } from "./use-local-storage";
import { SEARCH_API_URL } from "../constants/api";


const searchAgent = new SearchAgent();
searchAgent.config = {
    api_key: "no need",
    model: "no need",
    endpoint: SEARCH_API_URL,
}

const imageAgent = new ReplicateImageAgent();
imageAgent.config = {
    apiToken: "no need",
    model: "no need /",
}

const agents: Agent[] = [
    imageAgent,
    searchAgent,
    new ChartAgent(),
    new CodeGenAgent(),
];

const useAgents = () => {
    const [disabledAgents, setDisabledAgents] = useLocalStorage<string[]>("disabled-agents", []);

    return {
        agents,
        disabledAgents: disabledAgents || [],
        setDisabledAgents,
        activeAgents: agents.filter((agent) => !disabledAgents?.includes(agent.name))
    }
}

export default useAgents