import { InputHTMLAttributes } from "react";
import { cn } from "@/lib";

interface RadioProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    className?: string;
}

export default function Radio({
    label,
    className,
    ...props
}: RadioProps) {
    return (
        <label
            className={cn(
                "flex items-center gap-3 cursor-pointer",
                className
            )}
        >
            <input
                type="radio"
                className={cn(
                    "h-5 w-5",
                    "accent-pink-300",
                    "cursor-pointer",
                    "transition-all duration-200",
                    "disabled:cursor-not-allowed",
                    "disabled:opacity-50"
                )}
                {...props}
            />

            <span
                className="
    text-sm
    text-gray-800
    select-none
  "
            >
                {label}
            </span>


        </label>
    );
}