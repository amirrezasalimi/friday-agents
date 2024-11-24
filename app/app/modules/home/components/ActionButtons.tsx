import { useState } from "react";
import useInitChat from "~/shared/hooks/init-chat";
import { Button } from "@nextui-org/react";
import { BsCodeSlash, BsTranslate, BsImage, BsGraphUp } from 'react-icons/bs';
import { TbChartLine } from 'react-icons/tb';

const useCases = [
    {
        icon: BsImage,
        example: "Cyberpunk cityscape",
        iconColor: "text-purple-400",
        message: "Create a Cyberpunk cityscape"
    },
    {
        icon: TbChartLine,
        example: "US GDP last 5 years",
        iconColor: "text-blue-400",
        message: "search for US GDP last 5 years"
    },
    {
        icon: BsGraphUp,
        example: "Bitcoin price",
        iconColor: "text-green-400",
        message: "search and visualize Bitcoin price for last 7 days"
    },
    {
        icon: BsCodeSlash,
        example: "React todo list component",
        iconColor: "text-orange-400",
        message: "make a React todo list component"
    },
    {
        icon: BsTranslate,
        example: "Translate to Spanish",
        iconColor: "text-pink-400",
        message: "Translate Hello world in Spanish"
    }
];

export const ActionButtons = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { initializeChat } = useInitChat();


    const handleClick = async (message: string) => {
        setIsLoading(true);
        await initializeChat(message);
    };

    return (
        <div className="w-full flex justify-center gap-4 mt-6 flex-wrap">
            {useCases.map((useCase, index) => (
                <Button
                    key={index}
                    variant="flat"
                    className="bg-[#27272A] text-white h-auto py-2 px-4 hover:opacity-90"
                    startContent={<useCase.icon size={18} className={useCase.iconColor} />}
                    onClick={() => handleClick(useCase.message)}
                    isDisabled={isLoading}
                >
                    {useCase.example}
                </Button>
            ))}
        </div>
    );
};
