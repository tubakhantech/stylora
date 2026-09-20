"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/input/PasswordInput";
import Button from "@/components/ui/button";
import { SPACING } from "@/constants/spacing";
import { createClient } from "@/utils/supabase/client";

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateForm(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
): FormErrors {
    const errors: FormErrors = {};

    if (!name.trim()) {
        errors.name = "Full name is required.";
    }

    if (!email.trim()) {
        errors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.email = "Please enter a valid email address.";
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (password.length < 6) {
        errors.password = "Password must be at least 6 characters.";
    }

    if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match.";
    }

    return errors;
}

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

        const validationErrors = validateForm(
            name,
            email,
            password,
            confirmPassword
        );

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        const supabase = createClient();

        const { error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                    full_name: name.trim(),
                },
                emailRedirectTo: `${window.location.origin}/auth/confirm`,
            },
        });

        setIsSubmitting(false);

        if (error) {
            setMessageType("error");
            setSubmitMessage(error.message);
            return;
        }

        setMessageType("success");
        setSubmitMessage(
            "Account created successfully. Please check your email to confirm your account."
        );
    };

    return (
        <AuthLayout
            title="Create Your Account"
            subtitle="Your personal AI stylist awaits"
        >
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
                    <Input
                        type="text"
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);

                            if (errors.name) {
                                setErrors((prev) => ({
                                    ...prev,
                                    name: undefined,
                                }));
                            }
                        }}
                        error={errors.name}
                        required
                    />

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

                    <PasswordInput
                        label="Password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);

                            if (errors.password || errors.confirmPassword) {
                                setErrors((prev) => ({
                                    ...prev,
                                    password: undefined,
                                    confirmPassword: undefined,
                                }));
                            }
                        }}
                        error={errors.password}
                        required
                    />

                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(event) => {
                            setConfirmPassword(event.target.value);

                            if (errors.confirmPassword) {
                                setErrors((prev) => ({
                                    ...prev,
                                    confirmPassword: undefined,
                                }));
                            }
                        }}
                        error={errors.confirmPassword}
                        required
                    />

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
                        {isSubmitting
                            ? "CREATING ACCOUNT..."
                            : "CREATE ACCOUNT"}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium underline underline-offset-4"
                        style={{ color: "#ef6f9b" }}
                    >
                        Log In
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}