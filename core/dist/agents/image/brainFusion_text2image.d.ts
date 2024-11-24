export declare class Text2ImageAPI {
    private url;
    private authHeaders;
    constructor(url: string, apiKey: string, secretKey: string);
    getModel(): Promise<string>;
    generate(prompt: string, model: string, images?: number, width?: number, height?: number): Promise<string>;
    checkGeneration(requestId: string, attempts?: number, delay?: number): Promise<string[]>;
}
