import React, { ReactNode } from "react";
import { cn } from "@/lib";

interface TextProps {
    children: ReactNode;

    size?: "xs" | "sm" | "md" | "lg" | "xl";

    weight?: "normal" | "medium" | "semibold" | "bold";

    color?: "primary" | "secondary" | "muted" | "white";

    align?: "left" | "center" | "right" | "justify";

    className?: string;
}

export default function Text({
    children,
    size = "md",
    weight = "normal",
    color = "primary",
    align = "left",
    className,
}: TextProps) {
    const sizeStyles = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
    };

    const weightStyles = {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
    };

    const colorStyles = {
        primary: "text-black",
        secondary: "text-gray-700",
        muted: "text-gray-500",
        white: "text-white",
    };

    const alignStyles = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
    };

    return (
        <p
            className={cn(
                sizeStyles[size],
                weightStyles[weight],
                colorStyles[color],
                alignStyles[align],
                className
            )}
        >
            {children}
        </p>
    );
}