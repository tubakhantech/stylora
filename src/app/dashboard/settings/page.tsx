"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import LogoutButton from "@/components/auth/LogoutButton";

import PasswordInput from "@/components/ui/input/PasswordInput";
import Button from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

type MessageType = "success" | "error" | null;
type AppTheme = "light" | "dark" | "system";

interface UserSettings {
    app_theme: AppTheme;
    email_notifications: boolean;
    style_recommendations: boolean;
    wardrobe_reminders: boolean;
    saved_look_reminders: boolean;
    product_updates: boolean;
    ai_wardrobe_first: boolean;
    ai_allow_external_suggestions: boolean;
    language: string;
}

const DEFAULT_SETTINGS: UserSettings = {
    app_theme: "system",
    email_notifications: true,
    style_recommendations: true,
    wardrobe_reminders: true,
    saved_look_reminders: true,
    product_updates: false,
    ai_wardrobe_first: true,
    ai_allow_external_suggestions: true,
    language: "English",
};

export default function SettingsPage() {
    const router = useRouter();

    const {
        theme,
        setTheme,
    } = useTheme();

    const [email, setEmail] = useState("");

    const [newEmail, setNewEmail] = useState("");

    const [isUpdatingEmail, setIsUpdatingEmail] =
        useState(false);

    const [settings, setSettings] =
        useState<UserSettings>(DEFAULT_SETTINGS);

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSavingSettings, setIsSavingSettings] =
        useState(false);
    
    const [isDeletingAccount, setIsDeletingAccount] =
        useState(false);

    const [isSavingPassword, setIsSavingPassword] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [messageType, setMessageType] =
        useState<MessageType>(null);

    const showMessage = (
        type: MessageType,
        text: string
    ) => {
        setMessageType(type);
        setMessage(text);

        if (type === "success") {
            window.setTimeout(() => {
                setMessage("");
                setMessageType(null);
            }, 3000);
        }
    };

    useEffect(() => {
        const loadSettings = async () => {
            const supabase = createClient();

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setIsLoading(false);
                return;
            }

            setEmail(user.email ?? "");

            setNewEmail("");

            const { data, error } = await supabase
                .from("user_settings")
                .select(`
                    app_theme,
                    email_notifications,
                    style_recommendations,
                    wardrobe_reminders,
                    saved_look_reminders,
                    product_updates,
                    ai_wardrobe_first,
                    ai_allow_external_suggestions,
                    language
                `)
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) {
                const errorMessage =
                    error.message
                        .toLowerCase()
                        .includes("rate limit")
                        ? "Too many email change requests. Please wait a few minutes and try again."
                        : error.message;

                showMessage(
                    "error",
                    errorMessage
                );

                return;
            }

            if (!data) {
                const { data: createdSettings, error: createError } =
                    await supabase
                        .from("user_settings")
                        .insert({
                            user_id: user.id,
                            ...DEFAULT_SETTINGS,
                        })
                        .select(`
                            app_theme,
                            email_notifications,
                            style_recommendations,
                            wardrobe_reminders,
                            saved_look_reminders,
                            product_updates,
                            ai_wardrobe_first,
                            ai_allow_external_suggestions,
                            language
                        `)
                        .single();

                if (createError) {
                    showMessage(
                        "error",
                        createError.message
                    );

                    setIsLoading(false);
                    return;
                }

                const newSettings =
                    createdSettings as UserSettings;

                setSettings(newSettings);
                setTheme(newSettings.app_theme);

            } else {
                const savedTheme = data.app_theme;

                const normalizedTheme: AppTheme =
                    savedTheme === "dark" ||
                        savedTheme === "system"
                        ? savedTheme
                        : "light";

                const loadedSettings: UserSettings = {
                    ...data,
                    app_theme: normalizedTheme,
                } as UserSettings;

                setSettings(loadedSettings);
                setTheme(normalizedTheme);
            }

            setIsLoading(false);        };

        loadSettings();
    }, []);

    const updateSetting = <K extends keyof UserSettings>(
        key: K,
        value: UserSettings[K]
    ) => {
        setSettings((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const handleThemeChange = async (newTheme: AppTheme) => {
        updateSetting("app_theme", newTheme);
        setTheme(newTheme);

        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { error } = await supabase
            .from("user_settings")
            .update({
                app_theme: newTheme,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);

        if (error) {
            console.error("Theme save failed:", error);
        }
    };

    const handleSaveSettings = async () => {
        setMessage("");
        setMessageType(null);
        setIsSavingSettings(true);

        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsSavingSettings(false);

            showMessage(
                "error",
                "Your session has expired."
            );

            return;
        }

        const { error } = await supabase
            .from("user_settings")
            .upsert({
                user_id: user.id,
                ...settings,
                updated_at: new Date().toISOString(),
            });

        setIsSavingSettings(false);

        if (error) {
            showMessage(
                "error",
                error.message
            );
            return;
        }

        showMessage(
            "success",
            "Settings saved successfully."
        );

        router.refresh();
    };

    const handleEmailChange = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");
        setMessageType(null);

        const cleanEmail =
            newEmail.trim().toLowerCase();

        if (!cleanEmail) {
            showMessage(
                "error",
                "Please enter a new email address."
            );
            return;
        }

        if (cleanEmail === email.toLowerCase()) {
            showMessage(
                "error",
                "Please enter a different email address."
            );
            return;
        }

        setIsUpdatingEmail(true);

        const supabase = createClient();

        const { error } =
            await supabase.auth.updateUser({
                email: cleanEmail,
            });

        setIsUpdatingEmail(false);

        if (error) {
            showMessage(
                "error",
                error.message
            );
            return;
        }

        showMessage(
            "success",
            "Confirmation email sent. Please check your new email address to confirm the change."
        );
    };

    const handlePasswordChange = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");
        setMessageType(null);

        if (!newPassword) {
            showMessage(
                "error",
                "Please enter a new password."
            );
            return;
        }

        if (newPassword.length < 6) {
            showMessage(
                "error",
                "Password must be at least 6 characters."
            );
            return;
        }

        if (
            newPassword !==
            confirmPassword
        ) {
            showMessage(
                "error",
                "Passwords do not match."
            );
            return;
        }

        setIsSavingPassword(true);

        const supabase = createClient();

        const { error } =
            await supabase.auth.updateUser({
                password: newPassword,
            });

        setIsSavingPassword(false);

        if (error) {
            showMessage(
                "error",
                error.message
            );
            return;
        }

        setNewPassword("");
        setConfirmPassword("");

        showMessage(
            "success",
            "Password updated successfully."
        );
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete your Stylora account? This action cannot be undone."
        );

        if (!confirmed) {
            return;
        }

        const finalConfirmed = window.confirm(
            "This will permanently delete your account and associated data. Do you want to continue?"
        );

        if (!finalConfirmed) {
            return;
        }

        setMessage("");
        setMessageType(null);
        setIsDeletingAccount(true);

        try {
            const response = await fetch(
                "/api/account/delete",
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                showMessage(
                    "error",
                    result.error ||
                    "Unable to delete your account."
                );

                setIsDeletingAccount(false);
                return;
            }

            const supabase = createClient();

            await supabase.auth.signOut();

            window.location.href = "/login";
        } catch (error) {
            console.error(
                "Delete account error:",
                error
            );

            showMessage(
                "error",
                "Something went wrong while deleting your account."
            );

            setIsDeletingAccount(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fdf8f6] p-4 transition-colors dark:bg-[#121112] sm:p-6 lg:p-8">
                <div className="mx-auto max-w-[1100px]">

                    <div className="flex min-h-[420px] items-center justify-center rounded-[30px] border border-[#eadfe1] bg-gradient-to-br from-white to-[#fcf5f3]">

                        <div className="text-center">

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7e4e7]">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#d9b5bd] border-t-[#9f6674]" />
                            </div>

                            <p className="mt-4 font-serif text-xl text-[#111111]">
                                Preparing your settings
                            </p>

                            <p className="mt-1 text-xs text-[#8c7a7f]">
                                Loading your Stylora preferences...
                            </p>

                        </div>

                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdf8f6] p-4 transition-colors dark:bg-[#121112] sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1100px]">

                {/* SETTINGS HERO */}

                <section className="relative mb-7 overflow-hidden rounded-[30px] border border-[#eadfe1] bg-gradient-to-br from-[#f7e5e7] via-[#fcf5f3] to-[#f5dedf] px-6 py-8 sm:px-9 sm:py-10">

                    {/* DECOR */}
                    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/60 blur-3xl" />

                    <div className="relative">

                        <div className="inline-flex items-center gap-2 rounded-full border border-[#e6cfd4] bg-white/65 px-4 py-2">

                            <span className="text-[#a87582]">
                                ⚙
                            </span>

                            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9c6976]">
                                Your Stylora
                            </span>

                        </div>

                        <h1 className="mt-5 font-serif text-4xl tracking-[-0.045em] text-[#111111] sm:text-5xl">
                            Settings.
                        </h1>

                        <p className="mt-3 max-w-[570px] text-sm leading-6 text-[#75676b]">
                            Shape Stylora around you — manage your account,
                            styling preferences, notifications and security.
                        </p>


                        {/* QUICK LABELS */}
                        <div className="mt-6 flex flex-wrap gap-2">

                            <span className="rounded-full border border-[#e5d3d7] bg-white/65 px-3.5 py-2 text-[9px] font-medium text-[#806b71]">
                                Account
                            </span>

                            <span className="rounded-full border border-[#e5d3d7] bg-white/65 px-3.5 py-2 text-[9px] font-medium text-[#806b71]">
                                AI Preferences
                            </span>

                            <span className="rounded-full border border-[#e5d3d7] bg-white/65 px-3.5 py-2 text-[9px] font-medium text-[#806b71]">
                                Security
                            </span>

                        </div>

                    </div>

                </section>

                {message && (
                    <div
                        role="status"
                        className={`mb-6 flex items-center gap-3 rounded-[18px] border px-5 py-4 ${messageType === "success"
                                ? "border-[#d5e2d1] bg-[#f1f6ef] text-[#5f7858]"
                                : "border-[#efd0d3] bg-[#fff3f3] text-[#a34d55]"
                            }`}
                    >
                        <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${messageType === "success"
                                    ? "bg-[#dfeadb]"
                                    : "bg-[#f8dfe1]"
                                }`}
                        >
                            {messageType === "success" ? "✓" : "!"}
                        </div>

                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em]">
                                {messageType === "success"
                                    ? "Updated"
                                    : "Something needs attention"}
                            </p>

                            <p className="mt-0.5 text-xs leading-5">
                                {message}
                            </p>
                        </div>
                    </div>
                )}

                {/* ACCOUNT */}

                <section className="mb-6 overflow-hidden rounded-[26px] border border-[#eadfe1] bg-white">

                    {/* SECTION HEADER */}
                    <div className="border-b border-[#eee1e4] bg-[#fcf8f7] px-6 py-5 sm:px-7">

                        <div className="flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7e4e7] text-lg text-[#a87582]">
                                ♡
                            </div>

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                    Your Account
                                </p>

                                <h3 className="mt-1 font-serif text-2xl text-[#111111]">
                                    Account Details
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                    Manage the email address connected to your Stylora account.
                                </p>
                            </div>

                        </div>

                    </div>


                    <div className="p-6 sm:p-7">

                        {/* CURRENT EMAIL */}
                        <div className="flex flex-col gap-3 rounded-[20px] border border-[#eadfe1] bg-[#fcf8f7] p-5 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a88a91]">
                                    Current Email
                                </p>

                                <p className="mt-1.5 text-sm font-medium text-[#111111]">
                                    {email || "Not available"}
                                </p>
                            </div>

                            <span className="w-fit rounded-full border border-[#d8e5d4] bg-[#eef5eb] px-3 py-1.5 text-[9px] font-semibold text-[#657d5e]">
                                Connected
                            </span>

                        </div>


                        {/* CHANGE EMAIL */}
                        <form
                            onSubmit={handleEmailChange}
                            className="mt-6"
                        >

                            <div className="mb-3">
                                <p className="font-serif text-lg text-[#111111]">
                                    Change your email
                                </p>

                                <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                    We&apos;ll send a confirmation link to your new email address.
                                </p>
                            </div>


                            <div className="flex flex-col gap-3 sm:flex-row">

                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(event) =>
                                        setNewEmail(event.target.value)
                                    }
                                    placeholder="Enter new email address"
                                    className="min-w-0 flex-1 rounded-[16px] border border-[#e5d6da] bg-white px-4 py-3.5 text-sm text-[#4f4548] outline-none transition placeholder:text-[#b3a2a7] focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={isUpdatingEmail}
                                    className="shrink-0 rounded-full bg-[#111111] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9f6674] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isUpdatingEmail
                                        ? "Updating..."
                                        : "Change Email"}
                                </button>

                            </div>

                        </form>

                    </div>

                </section>

                {/* APPEARANCE */}

                <section className="mb-6 rounded-[26px] border border-[#eadfe1] bg-white p-6 shadow-[0_10px_30px_rgba(91,58,67,0.03)] transition-colors dark:border-[#332d30] dark:bg-[#1b191b] dark:shadow-none sm:p-7">

                    <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7e4e7] text-lg text-[#a87582]">
                            ◐
                        </div>

                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                Personalize Stylora
                            </p>

                            <h3 className="mt-1 font-serif text-2xl text-[#111111] dark:text-[#f7f2f3]">
                                Appearance
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                Choose the visual style you prefer while using Stylora.
                            </p>
                        </div>

                    </div>


                    <div className="mt-6 grid gap-4 sm:grid-cols-3">

                        <ThemeCard
                            title="Light Mode"
                            description="Stylora's signature soft cream and blush experience."
                            selected={settings.app_theme === "light"}
                            swatches={[
                                "#ffffff",
                                "#fdf8f6",
                                "#f8d7da",
                            ]}
                            onClick={() => handleThemeChange("light")}
                        />

                        <ThemeCard
                            title="Dark Mode"
                            description="A premium dark experience with soft blush accents."
                            selected={settings.app_theme === "dark"}
                            swatches={[
                                "#111111",
                                "#242124",
                                "#b47787",
                            ]}
                            onClick={() => handleThemeChange("dark")}
                        />

                        <ThemeCard
                            title="System"
                            description="Automatically match your device appearance."
                            selected={settings.app_theme === "system"}
                            swatches={[
                                "#ffffff",
                                "#111111",
                                "#a8c3a0",
                            ]}
                            onClick={() => handleThemeChange("system")}
                        />

                    </div> 


                    <div className="mt-4 rounded-[16px] border border-[#eadfe1] bg-[#fcf8f7] px-4 py-3">

                        <p className="text-[10px] leading-5 text-[#8c7a7f]">
                            ✦ Your appearance preference applies across Stylora.
                        </p>

                    </div>

                </section>

                {/* NOTIFICATIONS */}
                <section className="mb-6 rounded-[26px] border border-[#eadfe1] bg-white p-6 shadow-[0_10px_30px_rgba(91,58,67,0.03)] sm:p-7">

                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                        Stay In The Loop
                    </p>

                    <h3 className="mt-1 font-serif text-2xl text-[#111111]">
                        Notifications
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                        Control which Stylora updates you want to receive.
                    </p>

                    <div className="mt-6 divide-y divide-[#eee2e4] rounded-[20px] border border-[#eadfe1] bg-[#fcf8f7] px-5 py-4">
                        <SettingToggle
                            title="Email Notifications"
                            description="Receive important Stylora updates by email."
                            checked={
                                settings.email_notifications
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "email_notifications",
                                    value
                                )
                            }
                        />

                        <SettingToggle
                            title="Style Recommendations"
                            description="Receive personalized styling suggestions."
                            checked={
                                settings.style_recommendations
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "style_recommendations",
                                    value
                                )
                            }
                        />

                        <SettingToggle
                            title="Wardrobe Reminders"
                            description="Get reminders to keep your wardrobe updated."
                            checked={
                                settings.wardrobe_reminders
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "wardrobe_reminders",
                                    value
                                )
                            }
                        />

                        <SettingToggle
                            title="Saved Look Reminders"
                            description="Receive reminders related to saved outfits."
                            checked={
                                settings.saved_look_reminders
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "saved_look_reminders",
                                    value
                                )
                            }
                        />

                        <SettingToggle
                            title="Product Updates"
                            description="Receive news about new Stylora features."
                            checked={
                                settings.product_updates
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "product_updates",
                                    value
                                )
                            }
                        />
                    </div>
                </section>

                {/* AI PREFERENCES */}
                <section className="mb-6 rounded-[26px] border border-[#eadfe1] bg-gradient-to-br from-white to-[#fcf7f6] p-6 shadow-[0_10px_30px_rgba(91,58,67,0.03)] sm:p-7">

                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                        ✦ Styling Intelligence
                    </p>

                    <h3 className="mt-1 font-serif text-2xl text-[#111111]">
                        AI Stylist Preferences
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                        Decide how Stylora should create recommendations.
                    </p>

                    <div className="mt-6 divide-y divide-[#eee2e4] rounded-[20px] border border-[#eadfe1] bg-white/70 px-5 py-4">
                        <SettingToggle
                            title="Wardrobe First"
                            description="Prioritize clothes you already own when creating outfits."
                            checked={
                                settings.ai_wardrobe_first
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "ai_wardrobe_first",
                                    value
                                )
                            }
                        />

                        <SettingToggle
                            title="Allow External Suggestions"
                            description="Allow Stylora to suggest items that are not currently in your wardrobe."
                            checked={
                                settings.ai_allow_external_suggestions
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "ai_allow_external_suggestions",
                                    value
                                )
                            }
                        />
                    </div>
                </section>

                {/* LANGUAGE */}

                <section className="mb-6 rounded-[26px] border border-[#eadfe1] bg-white p-6 shadow-[0_10px_30px_rgba(91,58,67,0.03)] sm:p-7">

                    <div className="flex items-start gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7e4e7] text-lg text-[#a87582]">
                            文
                        </div>

                        <div>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                Your Experience
                            </p>

                            <h3 className="mt-1 font-serif text-2xl text-[#111111]">
                                Language
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                Choose your preferred Stylora language.
                            </p>
                        </div>

                    </div>

                    <div className="mt-6">

                        <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#806b71]">
                            Preferred Language
                        </label>

                        <select
                            value={settings.language}
                            onChange={(event) =>
                                updateSetting(
                                    "language",
                                    event.target.value
                                )
                            }
                            className="w-full cursor-pointer rounded-[16px] border border-[#e5d6da] bg-[#fcf8f7] px-4 py-3.5 text-sm text-[#4f4548] outline-none transition focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                        >
                            <option value="English">
                                English
                            </option>

                            <option value="Hindi">
                                Hindi
                            </option>
                        </select>

                    </div>

                </section>

                {/* SAVE SETTINGS */}

                <div className="mb-8 rounded-[24px] border border-[#eadfe1] bg-gradient-to-r from-[#f8e7ea] via-[#fcf5f3] to-[#f6e3e5] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">

                    <div>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b47787]">
                            Preferences
                        </p>

                        <p className="mt-1 font-serif text-lg text-[#111111]">
                            Everything looking right?
                        </p>

                        <p className="mt-1 text-[10px] leading-5 text-[#8c7a7f]">
                            Save your latest Stylora preferences.
                        </p>
                    </div>

                    <button
                        type="button"
                        disabled={isSavingSettings}
                        onClick={handleSaveSettings}
                        className="mt-4 w-full rounded-full bg-[#111111] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-white transition hover:bg-[#9f6674] disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
                    >
                        {isSavingSettings
                            ? "Saving Settings..."
                            : "Save Settings"}
                    </button>

                </div>

                {/* PASSWORD */}

                <section className="mb-6 overflow-hidden rounded-[26px] border border-[#eadfe1] bg-white shadow-[0_10px_30px_rgba(91,58,67,0.03)]">

                    {/* HEADER */}
                    <div className="border-b border-[#eee1e4] bg-[#fcf8f7] px-6 py-5 sm:px-7">

                        <div className="flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7e4e7] text-lg text-[#a87582]">
                                ♢
                            </div>

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                    Account Protection
                                </p>

                                <h3 className="mt-1 font-serif text-2xl text-[#111111]">
                                    Password & Security
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                    Keep your Stylora account secure with a strong password.
                                </p>
                            </div>

                        </div>

                    </div>


                    {/* PASSWORD FORM */}
                    <form
                        onSubmit={handlePasswordChange}
                        className="p-6 sm:p-7"
                    >

                        <div className="rounded-[20px] border border-[#eadfe1] bg-[#fcf8f7] p-5 sm:p-6">

                            <div className="grid gap-5 sm:grid-cols-2">

                                <PasswordInput
                                    label="New Password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(event) =>
                                        setNewPassword(
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                                <PasswordInput
                                    label="Confirm New Password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div className="mt-5 flex flex-col gap-4 border-t border-[#eadfe1] pt-5 sm:flex-row sm:items-center sm:justify-between">

                                <p className="max-w-[430px] text-[10px] leading-5 text-[#9a878c]">
                                    Use at least 6 characters and make sure both passwords match.
                                </p>

                                <button
                                    type="submit"
                                    disabled={isSavingPassword}
                                    className="rounded-full bg-[#111111] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9f6674] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSavingPassword
                                        ? "Updating..."
                                        : "Update Password"}
                                </button>

                            </div>

                        </div>

                    </form>

                </section>

                {/* ACCOUNT ACTIONS */}

                <section className="mt-6 overflow-hidden rounded-[26px] border border-[#eadfe1] bg-white shadow-[0_10px_30px_rgba(91,58,67,0.03)]">

                    {/* HEADER */}
                    <div className="border-b border-[#eee1e4] bg-[#fcf8f7] px-6 py-5 sm:px-7">

                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                            Account Control
                        </p>

                        <h3 className="mt-1 font-serif text-2xl text-[#111111]">
                            Account Actions
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                            Manage your current session or permanently close your Stylora account.
                        </p>

                    </div>


                    <div className="space-y-4 p-6 sm:p-7">

                        {/* SIGN OUT */}
                        <div className="flex flex-col gap-5 rounded-[20px] border border-[#eadfe1] bg-[#fcf8f7] p-5 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-start gap-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#9f7480] shadow-sm">
                                    ↗
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-[#111111]">
                                        Sign Out
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                        End your current Stylora session on this device.
                                    </p>
                                </div>

                            </div>

                            <div className="shrink-0">
                                <LogoutButton />
                            </div>

                        </div>


                        {/* DANGER ZONE */}
                        <div className="rounded-[20px] border border-[#efcfd2] bg-[#fff7f7] p-5">

                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-start gap-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fbe6e7] text-[#a94d56]">
                                        !
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#b65f67]">
                                            Danger Zone
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-[#7f3038]">
                                            Delete Account
                                        </p>

                                        <p className="mt-1 max-w-[520px] text-xs leading-5 text-[#a05e64]">
                                            Permanently delete your Stylora account and associated data.
                                            This action cannot be undone.
                                        </p>
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    disabled={isDeletingAccount}
                                    onClick={handleDeleteAccount}
                                    className="shrink-0 rounded-full border border-[#d99da3] bg-white px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a1444d] transition hover:border-[#a1444d] hover:bg-[#a1444d] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isDeletingAccount
                                        ? "Deleting..."
                                        : "Delete Account"}
                                </button>

                            </div>

                        </div>

                    </div>

                </section>
            </div>
        </div>
    );
}

function SettingToggle({
    title,
    description,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-5 py-4 first:pt-0 last:pb-0">

            <div className="pr-3">
                <p className="text-sm font-medium text-[#111111]">
                    {title}
                </p>

                <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                    {description}
                </p>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked
                        ? "bg-[#9aaf91]"
                        : "bg-[#ded3d6]"
                    }`}
            >
                <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${checked
                            ? "left-6"
                            : "left-1"
                        }`}
                />
            </button>

        </div>
    );
}

function ThemeCard({
    title,
    description,
    selected,
    swatches,
    onClick,
}: {
    title: string;
    description: string;
    selected: boolean;
    swatches: string[];
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative overflow-hidden rounded-[20px] border p-5 text-left transition-all ${selected
                ? "border-[#cfaab3] bg-[#fcf3f4] shadow-[0_8px_24px_rgba(132,88,99,0.08)] dark:border-[#76515b] dark:bg-[#35272b] dark:shadow-none"
                : "border-[#eadfe1] bg-[#fcfafa] hover:border-[#d9c1c7] dark:border-[#3b3437] dark:bg-[#242124] dark:hover:border-[#604850]"
                }`}
        >

            <div className="flex items-start justify-between gap-4">

                <div>
                    <p className="text-sm font-semibold text-[#111111] dark:text-[#f7f2f3]">
                        {title}
                    </p>

                    <p className="mt-1 max-w-[220px] text-xs leading-5 text-[#8c7a7f] dark:text-[#b8aaae]">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] ${selected
                            ? "border-[#9aaf91] bg-[#9aaf91] text-white"
                            : "border-[#d9cccf] bg-white text-transparent"
                        }`}
                >
                    ✓
                </div>

            </div>


            <div className="mt-5 flex items-center justify-between">

                <div className="flex -space-x-1">
                    {swatches.map((color) => (
                        <span
                            key={color}
                            className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                            style={{
                                backgroundColor: color,
                            }}
                        />
                    ))}
                </div>

                {selected && (
                    <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#71856a]">
                        Selected
                    </span>
                )}

            </div>

        </button>
    );
}