export const COLORS = {
    // Brand Colors
    primary: "#000000",
    secondary: "#FFFFFF",
    accent: "#F4C2C2",

    // Background
    background: "#FAFAFA",
    surface: "#FFFFFF",

    // Text
    textPrimary: "#111111",
    textSecondary: "#6B7280",
    textLight: "#9CA3AF",

    // Border
    border: "#E5E7EB",
    borderDark: "#D1D5DB",

    // Status
    success: "#A8C3A0",
    warning: "#F4B860",
    error: "#E57373",
    info: "#60A5FA",

    // Other
    disabled: "#D1D5DB",
    overlay: "rgba(0,0,0,0.5)",
} as const;

export type Color = keyof typeof COLORS;