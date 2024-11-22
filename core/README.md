# Friday Agents

The **Friday Agents** is a JavaScript package for integrating and orchestrating multiple AI-driven tools (agents) for diverse tasks like data processing, code generation, chart creation, image generation, and more.

### Features:

- **Multi-agent orchestration**: Use multiple agents together to handle complex tasks.
- **Customizable agent configuration**: Easily configure agents like `SearchAgent`, `JsCodeAgent`, `ImageAgent`, and `ChartAgent`.
- **Flexible workflows**: Tailor each agent’s behavior and manage retries and result handling.

### Installation

```bash
npm install @friday-agents/core
```

### Usage

Here's how to use the core package:

```typescript
import { FridayAgents } from "@friday-agents/core";

// Create an instance of Friday Agents
const fa = new FridayAgents({
  agents: [/* your configured agents */],
  maxAgentRetry: 2,
  baseLLm: {
    model: "your-model",
    endpoint: "your-endpoint",
    apikey: "your-api-key",
  },
  onChooseAgents: (reason, agents) => {
    console.log('Chosen agents:', agents, 'because:', reason);
  },
  onUsingAgent: (name) => {
    console.log('Using agent:', name);
  },
  onAgentFinished: (name, result) => {
    console.log(`Agent ${name} finished:`, result);
  },
  onAgentFailed: (name, error) => {
    console.log(`Agent ${name} failed:`, error);
  },
  onFinish: (data) => {
    console.log('Final result:', data);
  },
});

// Run with messages
await fa.run({
  messages: [
    { role: "user", content: "Your request here" }
  ],
  user: {  // Optional user context
    name: "John",
    age: 25
  },
  date: "2024-01-01",  // Optional current date
  cutoff_date: "2023-12-31"  // Optional data cutoff date
});

// Results are handled through the onFinish callback
```

### Configuration Options

#### FridayAgents Options

- **agents**: Array of agent instances that will be available for use
- **maxAgentRetry**: Maximum number of retries for failed agent executions
- **baseLLm**: Configuration for the base language model
  - **model**: Model identifier
  - **endpoint**: API endpoint
  - **apikey**: API key for authentication
- **onChooseAgents**: Callback when agents are selected for a task
- **onUsingAgent**: Callback when an agent starts processing
- **onAgentFinished**: Callback when an agent completes successfully
- **onAgentFailed**: Callback when an agent encounters an error
- **onFinish**: Callback that receives the final results after all agents complete (this is the main way to get results)

#### Run Method Options

- **messages**: Array of chat messages in OpenAI format
- **user** (optional): User context with name and age
- **date** (optional): Current date string
- **cutoff_date** (optional): Data cutoff date string

### Response Format

The final results are provided through the `onFinish` callback, which receives a `FinalResponse` object:

```typescript
interface FinalResponse {
  finalResponse: {
    type: string;  // Response type (e.g., "text", "view")
    text: string | null;  // Text response if applicable
    data?: any;  // Additional data if provided (the agent's dataOutput)
  };
  usedAgents: Array<{
    name: string;
    result: any;
    usedSeconds: number;
    data: any;
  }>;
}
```

### Developing Custom Agents

When creating a custom agent, implement the following interface:

```typescript
interface Agent {
  name: string;
  description: string;
  viewType: string;
  needSimplify?: boolean;
  config?: any;
  dataOutput?: any;
  // no need to implement this, it's will be provided.
  ai?: {
    create: (params: any) => Promise<any>;
  };

  callFormat(): string;
  onCall(result: string): Promise<string | null>;
}
```

Key components:

1. **name**: Unique identifier for the agent
2. **description**: Clear description of the agent's purpose and capabilities
3. **viewType**: Output format (e.g., "text", "image", "json")
4. **needSimplify**: Whether the output should be simplified by the LLM
5. **callFormat**: Returns the expected input format
6. **onCall**: Implements the agent's core functionality

### Example: WeatherAgent

```javascript
import Agent from "./agent";

export interface WeatherAgentConfig {
    apiKey: string
}

export default class WeatherAgent extends Agent<WeatherAgentConfig> {
    viewType: Agent['viewType'] = "text"; // Output format as text
    name: string = "weather"; // Agent's name
    description: string = "This agent fetches real-time weather data for a given location.";

    // Returns expected query format for the agent
    callFormat(): string {
        return '{ "location": "city name or coordinates" }';
    }

    // Method to fetch weather data
    async onCall(result: string): Promise<string | null> {
        const { location } = JSON.parse(result) ?? {};
        if (!location) return null;

        // Make API call to weather service
        const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${this.config.apiKey}&q=${location}`);
        const weatherData = await res.json();

        if (weatherData && weatherData.current) {
            const { temp_c, condition } = weatherData.current;
            return `The current temperature in ${location} is ${temp_c}°C with ${condition.text}.`;
        }

        return null;
    }
}
```

### Key Concepts:

1. **Custom Config**: `WeatherAgentConfig` defines the `apiKey` needed for the weather service.
2. **callFormat**: Specifies that the agent expects a JSON object with a `location` key.
3. **onCall**: This method makes an API request to fetch weather data, processes the response, and returns the weather information.

Once created, you can easily add your custom agent to the `FridayAgents` and automate workflows using your specialized tools!

### License

MIT License.
