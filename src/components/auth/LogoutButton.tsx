"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

export default function LogoutButton() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        const supabase = createClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
            return;
        }

        router.replace("/login");
        router.refresh();
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#111111] bg-[#111111] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm transition-all hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-50"
        >
            <span className="text-sm">
                ↗
            </span>

            {isLoggingOut
                ? "Logging Out..."
                : "Log Out"}
        </button>
    );
}