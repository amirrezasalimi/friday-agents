# Friday Agents

The **Friday Agents** is a powerful JavaScript framework for building AI-powered applications using a multi-agent architecture. It consists of two main components:

1. **Core Library** (`/core`): A TypeScript library for orchestrating multiple AI agents
2. **Demo App** (`/app`): A Remix application showcasing the library's capabilities

![concept](concept.png)

## Project Structure

```
friday-agents/
├── core/               # Core library implementation
│   ├── src/           # Source code
│   └── README.md      # Library documentation
└── app/               # Remix demo application
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

You can either build the core library locally or install it directly from npm.

#### Option A: Install from npm (Recommended)

```bash
npm install @friday-agents/core
```

#### Option B: Build Locally

We use [bun](https://bun.sh) by default for better performance, but you can use npm/yarn as well.

```bash
cd core
bun install
bun run build  # Build the core library
bun link      # Make the package available locally
```

See [Core Library Documentation](core/README.md) for detailed usage instructions.

### 2. Demo Application Setup

You can use our demo app as a starting point for your own application:

```bash
# Clone the template
git clone https://github.com/amirrezasalimi/friday-agents my-ai-app
cd my-ai-app

# Install dependencies
bun install  # or npm install / yarn

# If you built core locally
bun link @friday-agents/core  # or npm link / yarn link
```

Create a `.env` file in the root directory:

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

All agent configurations are handled automatically through the Remix API routes. You only need to set up these environment variables to get started.

Run the development server:
```bash
npm run dev
```

## Features

- **Multi-agent Orchestration**: Automatically selects and coordinates multiple agents
- **Flexible Configuration**: Easy to configure and extend with custom agents
- **Modern UI**: Beautiful Remix-based interface with real-time updates
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

## Acknowledgments

Special thanks to [Abolfazl](https://github.com/abolfazlNik/) for creating the beautiful UI/UX design of this project.

## License

MIT License
