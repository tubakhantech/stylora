"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    HiHome,
    HiSparkles,
    HiCollection,
    HiHeart,
    HiUser,
    HiCog,
    HiMenu,
    HiX,
} from "react-icons/hi";

import LogoutButton from "@/components/auth/LogoutButton";

interface DashboardNavProps {
    children: ReactNode;
    userName?: string;
    userEmail?: string;
    avatarUrl?: string | null;
}

const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: HiHome,
    },
    {
        label: "AI Stylist",
        href: "/dashboard/ai-stylist",
        icon: HiSparkles,
    },
    {
        label: "Wardrobe",
        href: "/dashboard/wardrobe",
        icon: HiCollection,
    },
    {
        label: "Save Looks",
        href: "/dashboard/save-looks",
        icon: HiHeart,
    },
    {
        label: "Profile",
        href: "/dashboard/profile",
        icon: HiUser,
    },
    {
        label: "Settings",
        href: "/dashboard/settings",
        icon: HiCog,
    },
];

function getPageTitle(pathname: string) {
    if (pathname === "/dashboard") {
        return "Dashboard";
    }

    const currentItem = NAV_ITEMS.find(
        (item) =>
            item.href !== "/dashboard" &&
            pathname.startsWith(item.href)
    );

    return currentItem?.label ?? "Stylora";
}

export default function DashboardNav({
    children,
    userName,
    userEmail,
    avatarUrl,
}: DashboardNavProps) {
    const pathname = usePathname();

    const [mobileMenuOpen, setMobileMenuOpen] =
        useState(false);

    const pageTitle = getPageTitle(pathname);

    const displayName =
        userName?.trim() ||
        userEmail?.split("@")[0] ||
        "Stylora User";

    const firstLetter =
        displayName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-[#fdf8f6] dark:bg-[#121112]">

            {/* =========================
                DESKTOP SIDEBAR
            ========================== */}
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[270px] border-r border-[#eadfe1] bg-[#fffdfc] dark:border-[#332d30] dark:bg-[#191719] lg:flex lg:flex-col">

                {/* Brand */}
                <div className="px-7 pb-6 pt-8">

                    <Link
                        href="/dashboard"
                        className="group block"
                    >
                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5dfe3] font-serif text-lg text-[#9f6674] transition group-hover:bg-[#edd2d8]">
                                S
                            </div>

                            <div>
                                <p className="text-[20px] font-semibold tracking-[0.22em] text-[#111111] dark:text-[#f7f2f3]">
                                    STYLORA
                                </p>

                                <p className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.22em] text-[#b47787]">
                                    AI Personal Stylist
                                </p>
                            </div>

                        </div>
                    </Link>

                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col gap-1.5 px-4 py-4">

                    <p className="mb-2 px-3 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#b7a4a9]">
                        Your Style Space
                    </p>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;

                        const active =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(
                                    item.href
                                );

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex items-center gap-3 rounded-[16px] border px-4 py-3 text-sm transition-all ${active
                                    ? "border-[#ead2d7] bg-[#f9e9ec] font-semibold text-[#8f5c69] dark:border-[#5a4148] dark:bg-[#34272b] dark:text-[#e3b9c4]"
                                    : "border-transparent font-medium text-[#74686b] hover:bg-[#faf3f2] hover:text-[#111111] dark:text-[#b9adb1] dark:hover:bg-[#262225] dark:hover:text-white"
                                    }`}
                            >
                                <span
                                    className={`flex h-8 w-8 items-center justify-center rounded-full transition ${active
                                        ? "bg-white text-[#9f6674] shadow-sm dark:bg-[#211d20] dark:text-[#e0aeba]"
                                        : "bg-transparent text-[#9b8b8f] group-hover:bg-white dark:text-[#9f9397] dark:group-hover:bg-[#2a2528]"
                                        }`}
                                >
                                    <Icon className="h-[17px] w-[17px]" />
                                </span>

                                <span>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-[#eee2e4] p-4">

                    <Link
                        href="/dashboard/profile"
                        className="mb-3 block rounded-[18px] border border-[#eadfe1] bg-[#fcf7f6] p-3 transition hover:border-[#d9c2c7] hover:bg-[#faf1f1]"
                    >

                        <div className="flex items-center gap-3">

                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f5dfe3] ring-2 ring-white">

                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={displayName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#8f5c69]">
                                        {firstLetter}
                                    </div>
                                )}

                            </div>

                            <div className="min-w-0 flex-1">

                                <p className="truncate text-xs font-semibold text-[#111111]">
                                    {displayName}
                                </p>

                                {userEmail && (
                                    <p className="mt-0.5 truncate text-[9px] text-[#9b898e]">
                                        {userEmail}
                                    </p>
                                )}

                            </div>

                            <span className="text-sm text-[#b59da3]">
                                ›
                            </span>

                        </div>

                    </Link>

                    <LogoutButton />

                </div>
            </aside>

            {/* =========================
                MAIN CONTENT
            ========================== */}
            <div className="lg:pl-[270px]">
            
                {/* Top Header */}
                <header className="sticky top-0 z-30 border-b border-[#eadfe1] bg-[#fffdfc]/90 backdrop-blur-xl dark:border-[#332d30] dark:bg-[#191719]/90">

                    <div className="flex min-h-[78px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

                        {/* LEFT SIDE */}
                        <div className="flex min-w-0 items-center gap-3">

                            {/* MOBILE MENU */}
                            <button
                                type="button"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eadfe1] bg-white text-[#111111] shadow-sm transition hover:bg-[#faf3f2] lg:hidden"
                                onClick={() =>
                                    setMobileMenuOpen(true)
                                }
                                aria-label="Open navigation"
                            >
                                <HiMenu className="h-5 w-5" />
                            </button>


                            {/* PAGE INFO */}
                            <div className="min-w-0">

                                <div className="flex items-center gap-2">

                                    <span className="hidden h-1.5 w-1.5 rounded-full bg-[#b47787] sm:block" />

                                    <p className="hidden text-[8px] font-semibold uppercase tracking-[0.22em] text-[#b47787] sm:block">
                                        Stylora / {pageTitle}
                                    </p>

                                </div>

                                <h1 className="truncate font-serif text-xl text-[#111111] sm:mt-0.5 sm:text-2xl">
                                    {pageTitle}
                                </h1>

                            </div>

                        </div>


                        {/* RIGHT SIDE */}
                        <div className="flex shrink-0 items-center gap-3 sm:gap-4">

                            {/* WELCOME */}
                            <div className="hidden min-w-[150px] text-right md:block">

                                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9b7d85]">
                                    Welcome back
                                </p>

                                <p className="mt-1 max-w-[200px] truncate text-[15px] font-semibold text-[#111111]">
                                    {displayName}
                                </p>

                            </div>


                            <div className="hidden h-8 w-px bg-[#eadfe1] md:block" />


                            {/* PROFILE */}
                            <Link
                                href="/dashboard/profile"
                                className="group flex min-w-[165px] items-center gap-3 rounded-full border border-[#eadfe1] bg-white py-2.5 pl-2.5 pr-5 shadow-[0_5px_18px_rgba(91,58,67,0.07)] transition hover:border-[#d8bec4] hover:bg-[#fcf7f6] shadow-[0_4px_16px_rgba(91,58,67,0.05)] transition hover:border-[#d8bec4] hover:bg-[#fcf7f6]"
                            >

                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#f5dfe3] ring-2 ring-[#ead2d7]">

                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={displayName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#8f5c69]">
                                            {firstLetter}
                                        </div>
                                    )}

                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-[13px] font-semibold text-[#111111]">
                                        {displayName}
                                    </p>

                                    <p className="mt-1 text-[11px] font-medium text-[#9f6674]">
                                        View Profile →
                                    </p>

                                </div>

                            </Link>

                        </div>

                    </div>

                </header>

                {/* Page */}
                <main className="min-h-[calc(100vh-78px)]">
                    {children}
                </main>
            </div>

            {/* =========================
    MOBILE MENU
========================== */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">

                    {/* OVERLAY */}
                    <button
                        type="button"
                        className="absolute inset-0 bg-[#211a1c]/35 backdrop-blur-[2px]"
                        onClick={() =>
                            setMobileMenuOpen(false)
                        }
                        aria-label="Close navigation overlay"
                    />


                    {/* MOBILE SIDEBAR */}
                    <aside className="relative flex h-full w-[290px] max-w-[86vw] flex-col border-r border-[#eadfe1] bg-[#fffdfc] shadow-[12px_0_40px_rgba(58,38,44,0.12)]">

                        {/* BRAND */}
                        <div className="flex items-center justify-between px-5 pb-5 pt-6">

                            <Link
                                href="/dashboard"
                                onClick={() =>
                                    setMobileMenuOpen(false)
                                }
                                className="flex items-center gap-3"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5dfe3] font-serif text-lg text-[#9f6674]">
                                    S
                                </div>

                                <div>
                                    <p className="text-[18px] font-semibold tracking-[0.18em] text-[#111111]">
                                        STYLORA
                                    </p>

                                    <p className="mt-0.5 text-[7px] font-medium uppercase tracking-[0.18em] text-[#b47787]">
                                        AI Personal Stylist
                                    </p>
                                </div>
                            </Link>


                            <button
                                type="button"
                                onClick={() =>
                                    setMobileMenuOpen(false)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfe1] bg-white text-[#74686b] transition hover:bg-[#faf3f2]"
                                aria-label="Close navigation"
                            >
                                <HiX className="h-4 w-4" />
                            </button>

                        </div>


                        {/* NAVIGATION */}
                        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-4">

                            <p className="mb-2 px-3 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#b7a4a9]">
                                Your Style Space
                            </p>

                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;

                                const active =
                                    item.href === "/dashboard"
                                        ? pathname === "/dashboard"
                                        : pathname.startsWith(
                                            item.href
                                        );

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() =>
                                            setMobileMenuOpen(false)
                                        }
                                        className={`group flex items-center gap-3 rounded-[16px] border px-4 py-3 text-sm transition-all ${active
                                                ? "border-[#ead2d7] bg-[#f9e9ec] font-semibold text-[#8f5c69]"
                                                : "border-transparent font-medium text-[#74686b] hover:bg-[#faf3f2]"
                                            }`}
                                    >
                                        <span
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${active
                                                    ? "bg-white text-[#9f6674] shadow-sm"
                                                    : "text-[#9b8b8f]"
                                                }`}
                                        >
                                            <Icon className="h-[17px] w-[17px]" />
                                        </span>

                                        <span>
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}

                        </nav>


                        {/* USER + LOGOUT */}
                        <div className="border-t border-[#eee2e4] p-4">

                            <Link
                                href="/dashboard/profile"
                                onClick={() =>
                                    setMobileMenuOpen(false)
                                }
                                className="mb-3 flex items-center gap-3 rounded-[18px] border border-[#eadfe1] bg-[#fcf7f6] p-3"
                            >

                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f5dfe3] ring-2 ring-white">

                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={displayName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#8f5c69]">
                                            {firstLetter}
                                        </div>
                                    )}

                                </div>

                                <div className="min-w-0 flex-1">

                                    <p className="truncate text-xs font-semibold text-[#111111]">
                                        {displayName}
                                    </p>

                                    {userEmail && (
                                        <p className="mt-0.5 truncate text-[9px] text-[#9b898e]">
                                            {userEmail}
                                        </p>
                                    )}

                                </div>

                                <span className="text-[#b59da3]">
                                    ›
                                </span>

                            </Link>

                            <LogoutButton />

                        </div>

                    </aside>

                </div>
            )}
            
        </div>
    );
}