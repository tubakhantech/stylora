import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const token_hash =
        searchParams.get("token_hash");

    const type =
        searchParams.get("type") as
        | EmailOtpType
        | null;

    const redirectTo =
        request.nextUrl.clone();

    // Token details URL me nahi rehne chahiye
    redirectTo.searchParams.delete(
        "token_hash"
    );

    redirectTo.searchParams.delete(
        "type"
    );

    if (token_hash && type) {
        const supabase =
            await createClient();

        const {
            data,
            error,
        } =
            await supabase.auth.verifyOtp({
                type,
                token_hash,
            });

        if (!error) {
            // =========================
            // EMAIL CHANGE
            // =========================
            if (type === "email_change") {
                const updatedEmail =
                    data.user?.email ?? "";

                // User ko login screen par
                // new email + old password use karna hai
                await supabase.auth.signOut();

                redirectTo.pathname =
                    "/login";

                redirectTo.searchParams.set(
                    "emailChanged",
                    "1"
                );

                if (updatedEmail) {
                    redirectTo.searchParams.set(
                        "email",
                        updatedEmail
                    );
                }

                return NextResponse.redirect(
                    redirectTo
                );
            }

            // =========================
            // SIGNUP / OTHER CONFIRMATION
            // =========================
            redirectTo.pathname =
                "/dashboard";

            return NextResponse.redirect(
                redirectTo
            );
        }
    }

    // Invalid / expired link
    redirectTo.pathname = "/login";

    redirectTo.searchParams.set(
        "confirmationError",
        "1"
    );

    return NextResponse.redirect(
        redirectTo
    );
}