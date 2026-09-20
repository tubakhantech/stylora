import React, { ReactNode } from "react";
import { cn } from "@/lib";

interface BadgeProps {
    children: ReactNode;

    variant?: "primary" | "secondary" | "success" | "warning" | "error";

    size?: "sm" | "md" | "lg";

    rounded?: boolean;

    className?: string;
}

export default function Badge({
    children,
    variant = "primary",
    size = "md",
    rounded = true,
    className,
}: BadgeProps) {
    const variantStyles = {
        primary: "bg-pink-200 text-pink-900",
        secondary: "bg-gray-200 text-gray-700",
        success: "bg-green-200 text-green-800",
        warning: "bg-yellow-200 text-yellow-800",
        error: "bg-red-200 text-red-800",
    };

    const sizeStyles = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center font-medium",
                variantStyles[variant],
                sizeStyles[size],
                rounded ? "rounded-full" : "rounded-md",
                className
            )}
        >
            {children}
        </span>
    );
}