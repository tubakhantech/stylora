import { ReactNode, useState } from "react";
import { cn } from "@/lib";

interface TooltipProps {
    text: string;
    children: ReactNode;
    className?: string;
}

export default function Tooltip({
    text,
    children,
    className,
}: TooltipProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className={cn(
                "relative inline-flex",
                className
            )}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}

            {visible && (
                <div
                    className="
            absolute
            -top-10
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            rounded-md
            bg-black
            px-3
            py-1
            text-xs
            text-white
            shadow-md
            z-50
          "
                >
                    {text}
                </div>
            )}
        </div>
    );
}