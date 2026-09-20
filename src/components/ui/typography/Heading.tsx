import React, { ReactNode } from "react";
import { cn } from "@/lib";

interface HeadingProps {
    children: ReactNode;

    level?: 1 | 2 | 3 | 4 | 5 | 6;

    className?: string;
}

export default function Heading({
    children,
    level = 1,
    className,
}: HeadingProps) {
    const Tag = (`h${level}`) as React.ElementType;

    const headingStyles = {
        1: "text-4xl font-bold",
        2: "text-3xl font-bold",
        3: "text-2xl font-semibold",
        4: "text-xl font-semibold",
        5: "text-lg font-medium",
        6: "text-base font-medium",
    };

    return (
        <Tag
            className={cn(
                headingStyles[level],
                "text-black",
                className
            )}
        >
            {children}
        </Tag>
    );
}