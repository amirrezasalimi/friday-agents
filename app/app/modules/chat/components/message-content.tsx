import Markdown from "react-markdown";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

import {Prism, SyntaxHighlighterProps} from 'react-syntax-highlighter';
const SyntaxHighlighter = (Prism as any) as React.FC<SyntaxHighlighterProps>;

const MessageContent = ({ content }: { content: string }) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "";
          return language ? (
            <SyntaxHighlighter
              style={tomorrow}
              language={language}
              PreTag="div"
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
};

export default MessageContent;
