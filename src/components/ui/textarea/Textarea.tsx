import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib";

interface TextareaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

export default function Textarea({
    className,
    ...props
}: TextareaProps) {
    return (
        <textarea
            className={cn(
                "w-full",
                "min-h-[120px]",
                "rounded-lg",
                "border border-gray-300",
                "bg-white",
                "px-4 py-3",
                "text-sm",
                "text-gray-900",
                "placeholder:text-gray-400",
                "outline-none",
                "resize-none",
                "transition-all",
                "focus:border-pink-300",
                "focus:ring-2",
                "focus:ring-pink-200",
                "disabled:cursor-not-allowed",
                "disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}