import React from "react";
import { cn } from "@/lib";

interface AvatarProps {
    src?: string;
    alt?: string;

    size?: "xs" | "sm" | "md" | "lg" | "xl";

    className?: string;
}

export default function Avatar({
    src,
    alt = "Avatar",
    size = "md",
    className,
}: AvatarProps) {
    const sizeStyles = {
        xs: "w-8 h-8",
        sm: "w-10 h-10",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-20 h-20",
    };

    return (
        <div
            className={cn(
                "rounded-full overflow-hidden bg-gray-200 flex items-center justify-center",
                sizeStyles[size],
                className
            )}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                />
            ) : (
                <span className="text-gray-500 text-sm">
                    👤
                </span>
            )}
        </div>
    );
}