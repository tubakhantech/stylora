import type { Metadata } from "next";
import {Inter,Poppins } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";

// Primary font for paragraphs, buttons, and general text.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Primary font for headings and titles.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400","500","600","700"],
  variable: "--font-poppins"
});


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
      className={`${inter.variable} ${poppins.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
