import React from "react";
import { cn } from "@/lib";

interface LoaderProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function Loader({
    size = "md",
    className,
}: LoaderProps) {
    const sizes = {
        sm: "w-4 h-4 border-2",
        md: "w-8 h-8 border-[3px]",
        lg: "w-12 h-12 border-4",
    };

    return (
        <div
            className={cn(
                "rounded-full border-pink-300 border-t-pink-600 animate-spin",
                sizes[size],
                className
            )}
        />
    );
}