import { ImageRenderer } from "./agent-views/image-renderer";
import { ChartRenderer } from "./agent-views/chart-renderer";
import { ChartData } from "./agent-views/types";
import useAgents from "~/shared/hooks/agents";
import { Agent } from "@friday-agents/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "@nextui-org/react";

interface AgentContentRendererProps {
  agent: string;
  data: any;
}

const CustomHTMLRenderer = ({ agent, data }: { agent: Agent; data: any }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const html = useMemo(() => {
    if (!agent.renderUI) {
      return "";
    }
    return agent.renderUI();
  }, [data, agent]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentDocument?.open();
      iframeRef.current.contentDocument?.write(html);
      iframeRef.current.contentDocument?.close();
    }
  }, [html]);
  
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="w-full h-[256px] relative flex justify-center items-center rounded-md overflow-hidden">
      <iframe
        ref={iframeRef}
        className={`w-full h-full ${!loaded && "hidden"}`}
        srcDoc={html}
        width="100%"
        height="100%"
        onLoad={() => setLoaded(true)}
      />
      {
        !loaded && <Spinner/>
      }
    </div>
  );
};

export const AgentContentRenderer = ({
  data,
  agent,
}: AgentContentRendererProps) => {
  const { activeAgents } = useAgents();
  const currentAgent = activeAgents.find((a) => a?.name === agent);
  switch (agent) {
    case "image-gen":
      return (
        <div className="w-full">
          <ImageRenderer url={data} />
        </div>
      );
    case "chart":
      return <ChartRenderer data={data as ChartData} />;
    default:
      if (currentAgent && currentAgent?.renderUI) {
        return <CustomHTMLRenderer agent={currentAgent} data={data} />;
      }
  }
};
