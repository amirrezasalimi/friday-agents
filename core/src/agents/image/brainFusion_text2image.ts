interface Text2ImageModel {
    id: string;
}

interface Text2ImageStatus {
    status: string;
    images: string[];
}

interface Text2ImageGenerateParams {
    query: string;
}

interface Text2ImageGenerateRequest {
    type: 'GENERATE';
    numImages: number;
    width: number;
    height: number;
    generateParams: Text2ImageGenerateParams;
}

export class Text2ImageAPI {
    private url: string;
    private authHeaders: Headers;

    constructor(url: string, apiKey: string, secretKey: string) {
        this.url = url;
        this.authHeaders = new Headers({
            'X-Key': `Key ${apiKey}`,
            'X-Secret': `Secret ${secretKey}`,
        });
    }

    async getModel(): Promise<string> {
        try {
            const response = await fetch(`${this.url}key/api/v1/models`, {
                method: 'GET',
                headers: this.authHeaders,
            });
            if (!response.ok) {
                throw new Error(`Failed to retrieve model: ${response.statusText}`);
            }
            const data: Text2ImageModel[] = await response.json();
            return data[0].id;
        } catch (error) {
            console.error('Error getting model:', error);
            throw error;
        }
    }

    async generate(
        prompt: string,
        model: string,
        images = 1,
        width = 1024,
        height = 1024
    ): Promise<string> {
        try {
            const params: Text2ImageGenerateRequest = {
                type: 'GENERATE',
                numImages: images,
                width,
                height,
                generateParams: {
                    query: prompt,
                },
            };
            const formData = new FormData();
            formData.append('model_id', model);
            formData.append('params', new Blob([JSON.stringify(params)], { type: 'application/json' }));

            const response = await fetch(`${this.url}key/api/v1/text2image/run`, {
                method: 'POST',
                headers: this.authHeaders,
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Failed to generate image: ${response.statusText}`);
            }
            const data = await response.json();
            return data.uuid;
        } catch (error) {
            console.error('Error generating image:', error);
            throw error;
        }
    }

    async checkGeneration(
        requestId: string,
        attempts = 10,
        delay = 10000
    ): Promise<string[]> {
        try {
            for (let i = 0; i < attempts; i++) {
                const response = await fetch(`${this.url}key/api/v1/text2image/status/${requestId}`, {
                    method: 'GET',
                    headers: this.authHeaders,
                });
                if (!response.ok) {
                    throw new Error(`Failed to retrieve status: ${response.statusText}`);
                }
                const data: Text2ImageStatus = await response.json();
                if (data.status === 'DONE') {
                    return data.images;
                }
                console.log("Checking Image Gen.");

                await new Promise((resolve) => setTimeout(resolve, delay));
            }
            throw new Error('Generation timed out');
        } catch (error) {
            console.error('Error checking generation:', error);
            throw error;
        }
    }
}


