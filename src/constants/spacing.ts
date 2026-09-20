export const SPACING = {
    // Extra Small
    xs: "4px",

    // Small
    sm: "8px",

    // Medium
    md: "16px",

    // Large
    lg: "24px",

    // Extra Large
    xl: "32px",

    // Double Extra Large
    xxl: "48px",

    // Layout Spacing
    section: "64px",
    container: "80px",

    // Navbar
    navbar: "72px",

    // Gap
    gap: "20px",
} as const;

export type Spacing= keyof typeof SPACING;