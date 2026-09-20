import { ReactNode } from "react";
import { cn } from "@/lib";

type GridProps = {
    children: ReactNode;

    cols?: 1 | 2 | 3 | 4;

    gap?: "sm" | "md" | "lg";
};

export default function Grid({
    children,
    cols = 4,
    gap = "lg",
}: GridProps) {

    const colsStyles = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    const gapStyles = {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
    };
    
    return (
        <div
            className={cn(
                "grid",
                colsStyles[cols],
                gapStyles[gap]
            )}
        >
            {children}
        </div>
    );
}