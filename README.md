# Friday Agents

The **Friday Agents** is a powerful JavaScript framework for building AI-powered applications using a multi-agent architecture. It consists of two main components:

1. **Core Library** (`/core`): A TypeScript library for orchestrating multiple AI agents
2. **Demo App** (`/app`): A Next.js application showcasing the library's capabilities

![concept](concept.png)

## Project Structure

```
friday-agents/
├── core/               # Core library implementation
│   ├── src/           # Source code
│   └── README.md      # Library documentation
└── app/               # Next.js demo application
    └── src/           # Application source
```

## Available Agents

The framework comes with several built-in agents:

- **SearchAgent**: Performs online searches and information retrieval
- **JsCodeAgent**: Generates and executes JavaScript code
- **ReplicateImageAgent**: Generates images using Replicate's API
- **ChartAgent**: Creates data visualizations and charts
- **CodeGenAgent**: Generates code in various programming languages

## Quick Start

### 1. Core Library Setup

```bash
cd core
npm install
npm run build  # Build the core library
npm link      # Make the package available locally
```

See [Core Library Documentation](core/README.md) for detailed usage instructions.

### 2. Demo Application Setup

```bash
cd app
npm install
npm link @friday/core  # Link the local core library
```

Create a `.env.local` file in the `/app` directory:

```env
# Base LLM Configuration (Required)
# Using OpenRouter for base LLM
LLM_HOST=https://openrouter.ai/api/v1
LLM_MODEL=perplexity/llama-3.1-sonar-small-128k-chat
LLM_KEY=your_openrouter_api_key

# Online Search LLM Configuration (Required)
# Using OpenRouter with Perplexity for online search
LLM_ONLINE_HOST=https://openrouter.ai/api/v1
LLM_ONLINE_MODEL=perplexity/llama-3.1-sonar-large-128k-online
LLM_ONLINE_KEY=your_openrouter_api_key

# Image Generation Configuration (Optional)
REPLICATE_API_TOKEN=your_replicate_api_token
REPLICATE_IMAGE_MODEL=black-forest-labs/flux-schnell
```

All agent configurations are handled automatically through the Next.js API routes. You only need to set up these environment variables to get started.

Run the development server:
```bash
npm run dev
```

## Features

- **Multi-agent Orchestration**: Automatically selects and coordinates multiple agents
- **Flexible Configuration**: Easy to configure and extend with custom agents
- **Modern UI**: Beautiful Next.js-based interface with real-time updates
- **TypeScript Support**: Full type safety and IDE support
- **Extensible**: Easy to add new agents and capabilities

## Development

### Adding a New Agent

1. Create a new agent class extending the base Agent class
2. Implement required methods (name, description, viewType, callFormat, onCall)
3. Add configuration options if needed
4. Register the agent with FridayAgents

See [Core Library Documentation](core/README.md) for detailed agent development instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Community

Join our community to get help, share your projects, and connect with other developers:

- Discord: [Join our Discord Server](https://discord.gg/AP42aAvS74)
- Twitter: [@amirrezasalimi](https://github.com/amirrezasalimi)

## License

MIT License
