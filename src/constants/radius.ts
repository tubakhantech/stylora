export const RADIUS = {
    // Small Radius
    sm: "6px",

    // Medium Radius
    md: "10px",

    // Large Radius
    lg: "16px",

    // Extra Large Radius
    xl: "24px",

    // Fully Rounded (Circle / Pills)
    full: "9999px",
} as const;

export type Radius = keyof typeof RADIUS;