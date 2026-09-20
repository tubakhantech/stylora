"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import PasswordInput from "@/components/ui/input/PasswordInput";
import Button from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { SPACING } from "@/constants/spacing";

export default function UpdatePasswordPage() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!password) {
            setError("Password is required.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (!confirmPassword) {
            setError("Please confirm your password.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        const supabase = createClient();

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        });

        setIsSubmitting(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        setMessage("Password updated successfully.");

        setTimeout(() => {
            router.push("/login");
            router.refresh();
        }, 1000);
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-4">
            <div className="w-full max-w-[520px] rounded-[32px] border bg-white p-8 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-semibold text-black">
                        Create New Password
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Enter your new password below.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col"
                    style={{ gap: SPACING.gap }}
                >
                    <PasswordInput
                        label="New Password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            if (error) setError("");
                        }}
                        required
                    />

                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(event) => {
                            setConfirmPassword(event.target.value);
                            if (error) setError("");
                        }}
                        required
                    />

                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {message}
                        </p>
                    )}

                    <Button
                        type="submit"
                        size="large"
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {isSubmitting
                            ? "UPDATING..."
                            : "UPDATE PASSWORD"}
                    </Button>
                </form>
            </div>
        </main>
    );
}