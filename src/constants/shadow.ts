export const SHADOW = {
    // Small Shadow
    sm: "0 1px 3px rgba(0, 0, 0, 0.08)",

    // Medium Shadow
    md: "0 4px 12px rgba(0, 0, 0, 0.10)",

    // Large Shadow
    lg: "0 8px 24px rgba(0, 0, 0, 0.12)",

    // Extra Large Shadow
    xl: "0 12px 32px rgba(0, 0, 0, 0.16)",
} as const;

export type Shadow = keyof typeof SHADOW;