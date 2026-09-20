import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib";

interface Option {
    label: string;
    value: string;
}

interface SelectProps
    extends SelectHTMLAttributes<HTMLSelectElement> {
    options: Option[];
    className?: string;
}

export default function Select({
    options,
    className,
    ...props
}: SelectProps) {
    return (
        <select
            className={cn(
                "w-full",
                "h-11",
                "rounded-xl",
                "border border-gray-300",
                "bg-white",
                "text-gray-900",
                "px-4",
                "text-sm",
                "font-medium",
                "shadow-sm",
                "transition-all duration-200",
                "cursor-pointer",

                "hover:border-pink-300",
                "hover:shadow-md",

                "focus:border-pink-400",
                "focus:ring-4",
                "focus:ring-pink-100",
                "focus:outline-none",

                "disabled:opacity-50",
                "disabled:cursor-not-allowed",

                className
            )}
            {...props}
        >
            {options.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                    className="bg-white text-gray-900"
                >
                    {option.label}
                </option>
            ))}
        </select>

        
    );
}