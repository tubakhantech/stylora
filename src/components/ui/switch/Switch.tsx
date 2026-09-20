"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib";

interface SwitchProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Switch({
  label,
  className,
  ...props
}: SwitchProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">

      <input
        type="checkbox"
        className="peer sr-only"
        {...props}
      />

      <div
        className={cn(
          "relative h-6 w-11 rounded-full",
          "bg-gray-300",
          "transition-colors",
          "peer-checked:bg-pink-500",
          "after:absolute",
          "after:left-0.5",
          "after:top-0.5",
          "after:h-5",
          "after:w-5",
          "after:rounded-full",
          "after:bg-white",
          "after:transition-transform",
          "peer-checked:after:translate-x-5",
          className
        )}
      />

      {label && (
        <span className="text-sm text-gray-700">
          {label}
        </span>
      )}

    </label>
  );
}