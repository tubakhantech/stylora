import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import OnboardingStepOne from "./OnboardingStepOne";

export default async function OnboardingPage() {
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
            "full_name, age, gender, body_type, skin_tone, onboarding_completed"
        )
        .eq("id", user.id)
        .maybeSingle();

    if (profile?.onboarding_completed) {
        redirect("/dashboard");
    }

    return (
        <OnboardingStepOne
            initialName={
                profile?.full_name ??
                user.user_metadata?.full_name ??
                ""
            }
            initialAge={profile?.age?.toString() ?? ""}
            initialGender={profile?.gender ?? ""}
            initialBodyType={profile?.body_type ?? ""}
            initialSkinTone={profile?.skin_tone ?? ""}
        />
    );
}