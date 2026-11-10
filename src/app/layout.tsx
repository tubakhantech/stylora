import type { Metadata } from "next";

import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";




// Defines the website's title, description, and other SEO information shown in the browser and search engines.
export const metadata: Metadata = {
  title: "Stylora | AI Personal Stylist",
  description: "Stylora is an AI-powered personal stylist and virtual wardrobe platform."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
