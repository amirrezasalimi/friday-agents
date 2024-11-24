interface ImageRendererProps {
    url: string;
}

export const ImageRenderer = ({ url }: ImageRendererProps) => {
    return (
        <div className="flex flex-col gap-4">
            <img
                src={url}
                alt="Generated content"
                className="w-1/2 h-auto aspect-square rounded-md"
            />
        </div>
    );
};
