import React, { ReactNode } from "react";
import { cn } from "@/lib";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    className?: string;
}

export default function Modal({
    open,
    onClose,
    title,
    children,
    className,
}: ModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className={cn(
                    "bg-white rounded-xl p-6 w-full max-w-md shadow-xl",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <h2 className="text-xl font-semibold mb-4">
                        {title}
                    </h2>
                )}

                {children}
            </div>
        </div>
    );
}