import { ImageRenderer } from './agent-views/image-renderer';
import { ChartRenderer } from './agent-views/chart-renderer';
import { ChartData } from './agent-views/types';

interface AgentContentRendererProps {
    agent: string;
    data: any;
}

export const AgentContentRenderer = ({ data, agent }: AgentContentRendererProps) => {
    switch (agent) {
        case 'image-gen':
            return (
                <div className='w-full'>
                    <ImageRenderer url={data} />
                </div>
            );
        case 'chart':
            return <ChartRenderer data={data as ChartData} />;
        default:
            return null;
    }
};