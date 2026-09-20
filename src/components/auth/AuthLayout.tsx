import Image from "next/image";
import { ReactNode } from "react";
import { COLORS } from "@/constants/colors";
import { FONT } from "@/constants/fonts";
import { SHADOW } from "@/constants/shadow";

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}
export default function AuthLayout({
    children,
    title,
    subtitle = "Your personal AI stylist awaits",
}: AuthLayoutProps) {
    return (
        <div
            className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-8"
            style={{
                fontFamily: FONT.family.primary,
                color: COLORS.textPrimary,
            }}
        >
            <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1180px] items-center justify-center">
                <div className="relative w-full overflow-hidden rounded-[40px] border border-white bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

                    {/* Luxury blush header */}
                    <div
                        className="relative min-h-[380px] overflow-hidden rounded-t-[40px] px-6 pt-10 text-center sm:min-h-[420px] sm:px-10 sm:pt-12"
                        style={{
                            background:
                                "linear-gradient(135deg, #fff4f7 0%, #fbdde6 48%, #f8d2df 100%)",
                        }}
                    >
                        {/* Soft flowing fabric lines */}
                        <div
                            className="pointer-events-none absolute -left-20 top-10 h-40 w-[70%] rotate-[-8deg] rounded-[50%] border border-white/70"
                            aria-hidden
                        />

                        <div
                            className="pointer-events-none absolute -left-10 top-24 h-32 w-[60%] rotate-[-5deg] rounded-[50%] border border-white/50"
                            aria-hidden
                        />

                        <div
                            className="pointer-events-none absolute inset-0 flex items-end justify-end"
                            aria-hidden
                        >
                            <div className="relative h-[115%] w-[78%] sm:h-[120%] sm:w-[72%] lg:h-full lg:w-[46%]">
                                <Image
                                    src="/images/stylora-banner01.png"
                                    alt=""
                                    fill
                                    priority
                                    className="object-contain object-right-bottom"
                                />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p
                                className="uppercase"
                                style={{
                                    fontFamily: FONT.family.secondary,
                                    fontSize: "clamp(2rem, 5vw, 3.6rem)",
                                    fontWeight: 400,
                                    letterSpacing: "0.28em",
                                    color: COLORS.textPrimary,
                                }}
                            >
                                STYLORA
                            </p>
                            <div className="mx-auto mt-4 h-px w-20 bg-black/70" />

                            <h1
                                className="mt-5 text-center"
                                style={{
                                    fontFamily: FONT.family.secondary,
                                    fontSize: "clamp(2rem, 4vw, 3.1rem)",
                                    fontWeight: 400,
                                    lineHeight: 1.05,
                                    color: "#111111",
                                }}
                            >
                                {title}
                            </h1>

                            <p
                                className="mt-3 text-center"
                                style={{
                                    fontFamily: FONT.family.primary,
                                    fontSize: "clamp(0.9rem, 1.6vw, 1rem)",
                                    fontWeight: 400,
                                    color: "#6B7280",
                                }}
                            >
                                {subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Form card overlap */}
                    <div className="relative z-20 mx-auto -mt-24 w-[calc(100%-2rem)] max-w-[620px] pb-8 sm:-mt-28 sm:w-[calc(100%-4rem)] sm:pb-10">
                        
                        <div
                            className="rounded-[34px] border border-white bg-white px-6 py-8 sm:px-10 sm:py-10"
                            style={{
                                boxShadow: SHADOW.md,
                            }}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}