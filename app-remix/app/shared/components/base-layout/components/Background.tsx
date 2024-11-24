import { AnimatedBlur } from "./AnimatedBlur";

export const Background = () => {
    return (
        <div className="z-10 pointer-events-none inset-0 fixed flex justify-center items-center">
            <img src="/pattern-bg.svg" className="size-full z-[5]" alt="Background Pattern" />
            <AnimatedBlur />
        </div>
    );
};
