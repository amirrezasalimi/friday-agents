import { Agent, extractFirstJson } from "@friday-agents/core";
import { generateId } from "../utils/id-generator";

export interface ReplicateImageConfig {
    apiToken: string;
    model?: `${string}/${string}` | `${string}/${string}:${string}`;
}

export default class ReplicateImageAgent extends Agent<ReplicateImageConfig> {
    viewType: Agent['viewType'] = "view";
    name: string = "image-gen";
    keywords: string[] = ["image", "generate", "create", "make","photo", "picture"];
    description: string = `
- use this agent if you want generate / make / create any image.
- you should use this agent if you know even brief intent or prompt of the image you want to generate.
- only a simple idea or prompt should be enough to generate an image, so don't ask for more details.
`;
 
    constructor() {
        super();
    }

    callFormat(): string {
        return '{ "prompt": "description of the image you want to generate" }';
    }

    async onCall(result: string): Promise<string> {
        const { prompt } = JSON.parse(extractFirstJson(result) ?? "{}") ?? {};
        if (!prompt) throw new Error("Prompt not found");
        if (!this.config?.model)
            throw new Error("Replicate model not found");

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    apiToken: this.config.apiToken,
                    model: this.config.model,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate image');
            }

            const { urls } = await response.json() as {
                urls: string[];
            };
            this.dataOutput = urls[0];
            return `Sure, I made an image with prompt:\n${prompt}\n${generateId()}.png`
        } catch (error) {
            throw new Error("Error generating image: " + error);
        }
    }
}