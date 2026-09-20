import Link from "next/link";

import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select(
            `
            full_name,
            body_type,
            skin_tone,
            preferred_styles,
            favorite_colors,
            common_occasions
            `
        )
        .eq("id", user?.id)
        .maybeSingle();

    const userId = user?.id;

    let wardrobeCount = 0;
    let savedLooksCount = 0;
    let favoriteLooksCount = 0;

    if (userId) {
        const [
            wardrobeResult,
            savedLooksResult,
            favoriteLooksResult,
        ] = await Promise.all([
            supabase
                .from("wardrobe_items")
                .select("*", {
                    count: "exact",
                    head: true,
                })
                .eq("user_id", userId),

            supabase
                .from("saved_looks")
                .select("*", {
                    count: "exact",
                    head: true,
                })
                .eq("user_id", userId),

            supabase
                .from("saved_looks")
                .select("*", {
                    count: "exact",
                    head: true,
                })
                .eq("user_id", userId)
                .eq("is_favorite", true),
        ]);

        wardrobeCount =
            wardrobeResult.count ?? 0;

        savedLooksCount =
            savedLooksResult.count ?? 0;

        favoriteLooksCount =
            favoriteLooksResult.count ?? 0;
    }

    const firstName =
        profile?.full_name
            ?.trim()
            .split(" ")[0] || "there";

    return (
        <div className="min-h-full bg-[#fffafa] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1280px]">

                {/* Welcome */}
                <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                            Your personal style space
                        </p>

                        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#111111] sm:text-4xl">
                            Welcome back, {firstName}.
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-[#777777]">
                            Your wardrobe is ready. Let
                            Stylora help you turn it into
                            your next look.
                        </p>
                    </div>

                    <Link
                        href="/dashboard/profile"
                        className="text-sm font-medium text-[#111111] transition hover:text-[#b47787]"
                    >
                        View style profile →
                    </Link>
                </div>

                {/* AI Stylist Hero */}
                <section className="relative mb-6 overflow-hidden rounded-[32px] bg-[#f8d7da]">
                    <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/30" />
                    <div className="absolute -bottom-24 right-40 h-64 w-64 rounded-full border border-white/50" />

                    <div className="relative grid min-h-[360px] lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                            <div className="mb-5 flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#111111] backdrop-blur-sm">
                                <span>✦</span>
                                AI Personal Stylist
                            </div>

                            <h2 className="max-w-[620px] text-4xl font-semibold leading-[1.03] tracking-[-0.045em] text-[#111111] sm:text-5xl lg:text-[56px]">
                                Your wardrobe.
                                <br />
                                Styled around you.
                            </h2>

                            <p className="mt-5 max-w-[530px] text-sm leading-7 text-[#5f5155] sm:text-base">
                                Get a personalized outfit
                                using your own clothes,
                                preferences, occasion and
                                style needs.
                            </p>

                            <div className="mt-7 flex flex-wrap items-center gap-3">
                                <Link
                                    href="/dashboard/ai-stylist"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2b2b2b]"
                                >
                                    <span>✦</span>
                                    Style My Outfit
                                    <span>→</span>
                                </Link>

                                <Link
                                    href="/dashboard/wardrobe"
                                    className="rounded-full border border-black/15 bg-white/45 px-6 py-3.5 text-sm font-semibold text-[#111111] transition hover:bg-white/70"
                                >
                                    Explore Wardrobe
                                </Link>
                            </div>
                        </div>

                        {/* Decorative fashion area */}
                        <div className="relative hidden items-end justify-center lg:flex">
                            <div className="absolute right-14 top-10 h-[280px] w-[230px] rotate-3 rounded-t-full rounded-b-[70px] border border-white/60 bg-white/25" />

                            <div className="relative mb-10 mr-8 flex h-[275px] w-[220px] -rotate-3 flex-col justify-between rounded-[120px_120px_32px_32px] border border-white/70 bg-white/45 p-7 shadow-[0_30px_80px_rgba(73,42,50,0.08)] backdrop-blur-sm">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#111111] text-2xl text-white">
                                    ✦
                                </div>

                                <div>
                                    <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#9a6976]">
                                        Styled by Stylora
                                    </p>

                                    <p className="mt-3 text-center text-xl font-semibold leading-7 text-[#111111]">
                                        Made for your
                                        wardrobe.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                    <StatCard
                        eyebrow="Your Closet"
                        number={wardrobeCount}
                        label={
                            wardrobeCount === 1
                                ? "Wardrobe item"
                                : "Wardrobe items"
                        }
                        href="/dashboard/wardrobe"
                        action="Open wardrobe"
                    />

                    <StatCard
                        eyebrow="Your Looks"
                        number={savedLooksCount}
                        label={
                            savedLooksCount === 1
                                ? "Saved look"
                                : "Saved looks"
                        }
                        href="/dashboard/save-looks"
                        action="View looks"
                    />

                    <StatCard
                        eyebrow="Favorites"
                        number={favoriteLooksCount}
                        label={
                            favoriteLooksCount === 1
                                ? "Favorite look"
                                : "Favorite looks"
                        }
                        href="/dashboard/save-looks?favorites=true"
                        action="See favorites"
                        accent
                    />
                </div>

                {/* Style Snapshot */}
                {/* Style DNA */}
                <section className="relative overflow-hidden rounded-[30px] border border-[#f0dfe3] bg-gradient-to-br from-white via-[#fffafb] to-[#fdf1f3] p-5 sm:p-7 lg:p-8">

                    {/* Decorative background */}
                    <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#f8d7da]/45 blur-2xl" />
                    <div className="pointer-events-none absolute right-20 top-10 h-32 w-32 rounded-full bg-[#f7e8dc]/50 blur-2xl" />

                    {/* Header */}
                    <div className="relative mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                Your Style DNA
                            </p>

                            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-[#111111]">
                                A snapshot of your style
                            </h3>

                            <p className="mt-2 text-sm text-[#777777]">
                                Your unique style preferences at a glance.
                            </p>
                        </div>

                        <Link
                            href="/dashboard/profile"
                            className="w-fit rounded-full border border-[#ead8dd] bg-white px-5 py-2.5 text-sm font-semibold text-[#111111] transition hover:border-[#d9b7c0] hover:bg-[#fff7f9]"
                        >
                            Edit preferences →
                        </Link>
                    </div>

                    {/* Style Cards */}
                    <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

                        <StyleItem
                            number="01"
                            icon="🧍‍♀️"
                            label="Body Type"
                            value={profile?.body_type}
                            note="Your silhouette"
                            tone="pink"
                        />

                        <StyleItem
                            number="02"
                            icon="🤎"
                            label="Skin Tone"
                            value={profile?.skin_tone}
                            note="Your natural tone"
                            tone="peach"
                        />

                        <StyleItem
                            number="03"
                            icon="👗"
                            label="Preferred Style"
                            value={profile?.preferred_styles?.join(
                                ", "
                            )}
                            note="Your style vibe"
                            tone="lavender"
                        />

                        <StyleItem
                            number="04"
                            icon="🎨"
                            label="Favorite Colors"
                            value={profile?.favorite_colors?.join(
                                ", "
                            )}
                            note="Colors you love"
                            tone="rose"
                        />

                        <StyleItem
                            number="05"
                            icon="📆"
                            label="Occasions"
                            value={profile?.common_occasions?.join(
                                ", "
                            )}
                            note="Where you wear it"
                            tone="sage"
                        />

                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({
    eyebrow,
    number,
    label,
    href,
    action,
    accent = false,
}: {
    eyebrow: string;
    number: number;
    label: string;
    href: string;
    action: string;
    accent?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`group relative overflow-hidden rounded-[26px] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(34,20,24,0.08)] ${accent
                ? "border-[#efc8ce] bg-[#fdf0f2]"
                : "border-[#f0e3e6] bg-white"
                }`}
        >
            <div className="flex items-start justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a78790]">
                    {eyebrow}
                </p>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ead9de] bg-white text-sm text-[#111111] transition group-hover:translate-x-1">
                    →
                </span>
            </div>

            <div className="mt-8 flex items-end gap-3">
                <span className="text-5xl font-semibold tracking-[-0.05em] text-[#111111]">
                    {number}
                </span>

                <span className="mb-1.5 text-sm text-[#777777]">
                    {label}
                </span>
            </div>

            <p className="mt-6 text-sm font-semibold text-[#b47787]">
                {action}
            </p>
        </Link>
    );
}

function StyleItem({
    number,
    icon,
    label,
    value,
    note,
    tone,
}: {
    number: string;
    icon: string;
    label: string;
    value?: string | null;
    note: string;
    tone:
    | "pink"
    | "peach"
    | "lavender"
    | "rose"
    | "sage";
}) {
    const tones = {
        pink: {
            icon: "bg-[#fde4e8] text-[#a94f68]",
            note: "bg-[#fdf0f2] text-[#a94f68]",
        },
        peach: {
            icon: "bg-[#f9eadc] text-[#a86b3d]",
            note: "bg-[#fcf1e7] text-[#a86b3d]",
        },
        lavender: {
            icon: "bg-[#f0e4f6] text-[#795b91]",
            note: "bg-[#f6eef9] text-[#795b91]",
        },
        rose: {
            icon: "bg-[#f9dfe5] text-[#a94f68]",
            note: "bg-[#fcecf0] text-[#a94f68]",
        },
        sage: {
            icon: "bg-[#e2f1e8] text-[#4d8062]",
            note: "bg-[#eaf6ef] text-[#4d8062]",
        },
    };

    return (
        <div className="group flex min-h-[255px] flex-col rounded-[22px] border border-[#efe2e5] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_45px_rgba(67,40,47,0.08)]">

            <div className="flex items-start justify-between">
                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${tones[tone].icon}`}
                >
                    {icon}
                </div>

                <span className="text-xs font-medium text-[#d2aeb7]">
                    {number}
                </span>
            </div>

            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#a87582]">
                {label}
            </p>

            <p className="mt-2 break-words text-lg font-semibold leading-6 text-[#111111]">
                {value || "Not set"}
            </p>

            <div className="mt-auto pt-5">
                <span
                    className={`inline-flex rounded-full px-4 py-2 text-xs font-medium ${tones[tone].note}`}
                >
                    {note}
                </span>
            </div>
        </div>
    );
}