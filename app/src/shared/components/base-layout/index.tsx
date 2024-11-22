'use client';
import { NextUIProvider } from "@nextui-org/react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import { Background } from "./components/Background";
import Link from "next/link";
import { LINKS } from "@/shared/constants/links";

type Props = {
    children: React.ReactNode;
    className?: string;
};

const BaseLayout = ({ children, className }: Props) => {
    return <NextUIProvider className={className} >
        <div className="top-0 h-14 z-40 absolute flex justify-between px-8 items-center w-full">
            <div className="flex items-center gap-2">
                <img src="/toolstack.svg" alt="Toolstack Logo" />
                <Link href={LINKS.HOME} className="font-light hover:text-[#8B93FF] hover:scale-105 transition-all cursor-pointer">
                        / Agents
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <FaGithub className="cursor-pointer size-6" />
                <FaDiscord className="cursor-pointer size-6" />
            </div>
        </div>
        <Background />
        <div className="z-30 flex absolute inset-0 justify-center m-auto max-w-screen-md h-screen container pt-14">
            {children}
        </div>
    </NextUIProvider>
};

export default BaseLayout;