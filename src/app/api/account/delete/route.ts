import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function DELETE() {
    try {
        const supabase =
            await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (
            userError ||
            !user
        ) {
            return NextResponse.json(
                {
                    error:
                        "You must be logged in to delete your account.",
                },
                {
                    status: 401,
                }
            );
        }

        const admin =
            createAdminClient();

        const { error: deleteError } =
            await admin.auth.admin.deleteUser(
                user.id
            );

        if (deleteError) {
            return NextResponse.json(
                {
                    error:
                        deleteError.message,
                },
                {
                    status: 500,
                }
            );
        }

        return NextResponse.json(
            {
                success: true,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        console.error(
            "Delete account error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Something went wrong while deleting your account.",
            },
            {
                status: 500,
            }
        );
    }
}