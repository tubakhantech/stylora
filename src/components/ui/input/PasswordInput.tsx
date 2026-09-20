"use client";

import { useState } from "react";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { cn } from "@/lib";
import { COLORS } from "@/constants/colors";

interface PasswordInputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    className?: string;
}

export default function PasswordInput({
    label,
    placeholder,
    value,
    onChange,
    disabled = false,
    required = false,
    error,
    className,
}: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    const baseStyles =
        "w-full rounded-lg border px-4 py-3 pr-12 text-sm text-black placeholder:text-gray-400 outline-none transition-all duration-200";

    const stateStyles = {
        normal: "border-gray-300 focus:border-black",
        error: "border-red-500 focus:border-red-500",
        disabled: "bg-gray-100 cursor-not-allowed opacity-60",
    };

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-sm font-medium text-black">
                    {label}
                    {required && <span className="text-red-500"> *</span>}
                </label>
            )}

            <div className="relative">
                <input
                    type={visible ? "text" : "password"}
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

                <button
                    type="button"
                    onClick={() => setVisible((prev) => !prev)}
                    disabled={disabled}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? (
                        <HiEyeOff
                            className="h-5 w-5"
                            style={{ color: COLORS.textSecondary }}
                        />
                    ) : (
                        <HiEye
                            className="h-5 w-5"
                            style={{ color: COLORS.textSecondary }}
                        />
                    )}
                </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
