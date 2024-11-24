import type { MetaFunction } from "@remix-run/node";
import { Title } from "~/modules/home/components/Title";
import { TextInput } from "~/modules/home/components/TextInput";
import { ActionButtons } from "~/modules/home/components/ActionButtons";
import { generateId } from "~/shared/utils/id-generator";
import { useMemo } from "react";
import { StoreProvider } from "~/shared/hooks/store";

export const meta: MetaFunction = () => {
  return [
    { title: "Friday Agents" },
    { name: "description", content: "AI Agents for your tasks" },
  ];
};

export default function Index() {
  const chatId = useMemo(generateId, []);
  
  return (
    <div className="flex justify-center items-center relative">
      <div className="w-full flex flex-col gap-8 h-3/6 text-center items-center">
        <StoreProvider roomId={chatId}>
          <Title />
          <div className="w-full">
            <TextInput />
            <ActionButtons />
          </div>
        </StoreProvider>
      </div>
    </div>
  );
}
