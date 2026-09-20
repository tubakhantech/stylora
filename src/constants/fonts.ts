export const FONT = {
    family: {
        primary: "Poppins, sans-serif",
        secondary: "Playfair Display, serif",
    },

    size: {
        xs: "12px",
        sm: "14px",
        md: "16px",
        lg: "18px",
        xl: "20px",
        xxl: "24px",
        display: "32px",
        hero: "48px",
    },

    weight: {
        light: 300,
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    lineHeight: {
        normal: 1.5,
        heading: 1.2,
    },
} as const;

export type Font = keyof typeof FONT;