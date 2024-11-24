import Agent from "../agent";
export default class ImageAgent extends Agent<{
    apiKey: string;
    secretKey: string;
}, string[]> {
    viewType: Agent['viewType'];
    needSimplify: boolean;
    name: string;
    description: string;
    callFormat: () => string;
    imagesSaveDir: string;
    constructor(imagesSaveDir?: string);
    onCall(result: string): Promise<boolean | null>;
}
