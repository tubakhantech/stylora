"use client";


import {useRouter,useSearchParams,}

from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/input/PasswordInput";
import Button from "@/components/ui/button";
import GoogleMark from "@/components/ui/google-mark";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { createClient } from "@/utils/supabase/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
    email?: string;
    password?: string;
    form?: string;
}

function validateForm(email: string, password: string): FormErrors {
    const errors: FormErrors = {};

    if (!email.trim()) {
        errors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.email = "Please enter a valid email address.";
    }

    if (!password) {
        errors.password = "Password is required.";
    }

    return errors;
}

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const emailChanged =
        searchParams.get("emailChanged") === "1";

    const changedEmail =
        searchParams.get("email") ?? "";

    const [email, setEmail] =
        useState(changedEmail);

    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [messageType, setMessageType] = useState<
        "success" | "error" | null
    >(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setSubmitMessage(null);
        setMessageType(null);

        const validationErrors = validateForm(email, password);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        setIsSubmitting(false);

        if (error) {
            setMessageType("error");
            setSubmitMessage(error.message);
            return;
        }

        setMessageType("success");
        setSubmitMessage("Login successful!");

        setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
        }, 700);
    };

    const handleGoogleLogin = async () => {
        setSubmitMessage(null);
        setMessageType(null);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            setMessageType("error");
            setSubmitMessage(error.message);
        }
    };

    return (
        <div
            className="flex flex-col"
            style={{ gap: SPACING.lg }}
        >
            <form
                onSubmit={handleSubmit}
                className="flex flex-col"
                style={{ gap: SPACING.gap }}
                noValidate
            >
                {emailChanged && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                        <p className="text-sm font-medium text-green-800">
                            Email address updated
                        </p>

                        <p className="mt-1 text-sm leading-5 text-green-700">
                            Please sign in using your new email address
                            and your existing password.
                        </p>

                        <p className="mt-2 text-xs leading-5 text-green-700">
                            If your browser filled your old email
                            automatically, replace it with your new email.
                            Your password has not changed.
                        </p>
                    </div>
                )}

                <Input
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);

                        if (errors.email) {
                            setErrors((prev) => ({
                                ...prev,
                                email: undefined,
                            }));
                        }
                    }}
                    error={errors.email}
                    required
                />

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: SPACING.sm,
                    }}
                >
                    <PasswordInput
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);

                            if (errors.password) {
                                setErrors((prev) => ({
                                    ...prev,
                                    password: undefined,
                                }));
                            }
                        }}
                        error={errors.password}
                        required
                    />

                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-sm transition-opacity hover:opacity-75"
                            style={{ color: "#ef6f9b" }}
                        >
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                {submitMessage && (
                    <p
                        className="rounded-lg border px-4 py-3 text-sm"
                        style={{
                            backgroundColor:
                                messageType === "success"
                                    ? "#F0FDF4"
                                    : "#FEF2F2",
                            borderColor:
                                messageType === "success"
                                    ? "#86EFAC"
                                    : "#FCA5A5",
                            color:
                                messageType === "success"
                                    ? "#15803D"
                                    : "#DC2626",
                        }}
                        role="status"
                    >
                        {submitMessage}
                    </p>
                )}

                <Button
                    type="submit"
                    size="large"
                    disabled={isSubmitting}
                    className="w-full"
                >
                    {isSubmitting ? "LOGGING IN..." : "LOGIN"}
                </Button>
            </form>

            <div
                className="flex items-center"
                style={{ gap: SPACING.md }}
            >
                <div
                    className="h-px flex-1"
                    style={{ backgroundColor: COLORS.border }}
                />

                <span
                    className="text-xs font-medium uppercase"
                    style={{ color: COLORS.textLight }}
                >
                    OR
                </span>

                <div
                    className="h-px flex-1"
                    style={{ backgroundColor: COLORS.border }}
                />
            </div>

            <Button
                type="button"
                variant="outline"
                size="large"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3"
            >
                <GoogleMark />
                CONTINUE WITH GOOGLE
            </Button>

            <p
                className="text-center text-sm"
                style={{ color: COLORS.textSecondary }}
            >
                Don&apos;t have an account?{" "}
                <Link
                    href="/signup"
                    className="font-medium underline-offset-4 transition-opacity hover:opacity-80"
                    style={{
                        color: "#ef6f9b",
                        textDecorationLine: "underline",
                        textDecorationColor: COLORS.accent,
                    }}
                >
                    Create Account
                </Link>
            </p>
        </div>
    );
}