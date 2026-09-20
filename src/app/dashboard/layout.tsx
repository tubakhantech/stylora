import { redirect } from "next/navigation";

import DashboardNav from "./DashboardNav";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }


    const { data: profile } = await supabase
        .from("profiles")
        .select(
            `
            full_name,
            avatar_url,
            onboarding_completed,
            onboarding_step
            `
        )
        .eq("id", user.id)
        .maybeSingle();

    if (
        !profile ||
        !profile.onboarding_completed
    ) {
        redirect("/onboarding");
    }

    let avatarSignedUrl: string | null = null;

    if (profile.avatar_url) {
        const { data: signedData } =
            await supabase.storage
                .from("profile-images")
                .createSignedUrl(
                    profile.avatar_url,
                    3600
                );

        avatarSignedUrl =
            signedData?.signedUrl ?? null;
    }

    return (
        <DashboardNav
            userName={profile.full_name ?? undefined}
            userEmail={user.email ?? undefined}
            avatarUrl={avatarSignedUrl}
        >
            {children}
        </DashboardNav>
    );
}