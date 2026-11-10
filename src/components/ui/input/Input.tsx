import React from "react";
import { cn } from "@/lib";

interface InputProps {
    type?: "text" | "email" | "password" | "number" | "search";
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    helperText?: string;
    className?: string;
}

export default function Input({
    type = "text",
    label,
    placeholder,
    value,
    onChange,
    disabled = false,
    required = false,
    error,
    helperText,
    className,
}: InputProps) {
    const baseStyles =
        "w-full rounded-lg border px-4 py-3 text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-[#252525] outline-none transition-all duration-200";
        
    const stateStyles = {
        normal: "border-gray-300 dark:border-[#444444] focus:border-black dark:focus:border-[#c88e9b]",
        error: "border-red-500 focus:border-red-500",
        disabled: "bg-gray-100 cursor-not-allowed opacity-60",
    };

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-sm font-medium text-black dark:text-white">
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
            )}

            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                className={cn(
                    baseStyles,
                    error ? stateStyles.error : stateStyles.normal,
                    disabled && stateStyles.disabled,
                    className
                )}
            />

            {error ? (
                <p className="text-sm text-red-500">{error}</p>
            ) : (
                helperText && (
                    <p className="text-sm text-gray-500">{helperText}</p>
                )
            )}
        </div>
    );
}