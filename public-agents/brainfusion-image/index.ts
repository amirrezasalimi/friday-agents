import {
  Agent,
  extractFirstJson,
  type configDocItem,
} from "@friday-agents/core";
import { Text2ImageAPI } from "./brainFusion_text2image";

export default class ImageAgent extends Agent<
  {
    apiKey: string;
    secretKey: string;
  },
  string[]
> {
  configDoc: Record<string, configDocItem> = {
    apiKey: {
      type: "string",
      description: "API Key",
      required: true,
    },
    secretKey: {
      type: "string",
      description: "Secret Key",
      required: true,
    },
  };
  viewType: Agent["viewType"] = "view";
  needSimplify: boolean = false;
  name = "image";
  description: string = `This Agent Made to generate any images user asked.`;
  callFormat = () => `{
    "prompt": "detailed prompt to generate image based on users request"
}`;
  constructor() {
    super();
  }
  async onCall(result: string): Promise<boolean | null> {
    if (!this.config?.apiKey || !this.config.secretKey) {
      throw "Missing apiKey or secret key";
    }

    let jsonData: { prompt: string } | null = null;
    try {
      jsonData = JSON.parse(extractFirstJson(result) ?? "");
    } catch (e) {
      return null;
    }
    if (!jsonData?.prompt) {
      throw new Error("prompt shouldn't be empty.");
    }

    const api = new Text2ImageAPI(
      "https://api-key.fusionbrain.ai/",
      this.config?.apiKey,
      this.config?.secretKey
    );
    const modelId = await api.getModel();
    const uuid = await api.generate(jsonData.prompt, modelId, 1, 512, 512);
    const images = await api.checkGeneration(uuid);
    this.dataOutput = images;
    return true;
  }
}
