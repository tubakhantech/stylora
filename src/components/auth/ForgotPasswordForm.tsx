"use client";

import { createClient } from "@/utils/supabase/client";
import { FormEvent, useState } from "react";
import Link from "next/link";

import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { Heading, Text } from "@/components/ui/typography";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Email address is required.");
            return;
        }

        if (!EMAIL_REGEX.test(email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsSubmitting(true);

        // Placeholder until Supabase password reset is connected.
        const supabase = createClient();

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            email.trim(),
            {
                redirectTo: `${window.location.origin}/update-password`,
            }
        );

        setIsSubmitting(false);

        if (resetError) {
            setError(resetError.message);
            return;
        }

        setMessage(
            "Password reset link sent. Please check your email."
        );
    };

    return (
        <div
            className="flex flex-col"
            style={{ gap: SPACING.lg }}
        >
            <div
                className="text-center"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: SPACING.sm,
                }}
            >
                <Heading level={2} className="text-center">
                    Forgot Password?
                </Heading>

                <Text color="muted" align="center" size="sm">
                    Enter your email and we&apos;ll help you reset your password.
                </Text>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col"
                style={{ gap: SPACING.gap }}
                noValidate
            >
                <Input
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);

                        if (error) {
                            setError("");
                        }
                    }}
                    error={error}
                    required
                />

                {message && (
                    <p
                        className="rounded-lg border px-4 py-3 text-sm text-black"
                        style={{
                            backgroundColor: COLORS.surface,
                            borderColor: COLORS.border,
                        }}
                        role="status"
                    >
                        {message}
                    </p>
                )}

                <Button
                    type="submit"
                    size="large"
                    disabled={isSubmitting}
                    className="w-full"
                >
                    {isSubmitting ? "SENDING..." : "SEND RESET LINK"}
                </Button>
            </form>

            <p
                className="text-center text-sm"
                style={{ color: COLORS.textSecondary }}
            >
                Remember your password?{" "}
                <Link
                    href="/login"
                    className="font-semibold underline-offset-4 transition-opacity hover:opacity-80"
                    style={{
                        color: COLORS.textPrimary,
                        textDecorationLine: "underline",
                        textDecorationColor: COLORS.accent,
                    }}
                >
                    Log In
                </Link>
            </p>
        </div>
    );
}