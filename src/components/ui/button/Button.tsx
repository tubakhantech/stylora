import { cn } from "@/lib";

type ButtonProps = {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline";
    size?: "small" | "medium" | "large";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
};

export default function Button({
    children,
    variant = "primary",
    size = "medium",
    type = "button",
    disabled = false,
    onClick,
    className,
    style,
}: ButtonProps) {
    const baseStyles =
        "rounded-lg font-medium transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

    const variantStyles = {
        primary: "bg-black text-white hover:bg-gray-800",
        secondary: "bg-pink-200 text-black hover:bg-pink-300",
        outline: "border border-black text-black hover:bg-gray-100",
    };

    const sizeStyles = {
        small: "px-3 py-2 text-sm",
        medium: "px-5 py-2 text-base",
        large: "px-7 py-3 text-lg",
    };

    return (
        <button
            type={type}
            className={cn(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            disabled={disabled}
            onClick={onClick}
            style={style}
        >
            {children}
        </button>
    );
}
