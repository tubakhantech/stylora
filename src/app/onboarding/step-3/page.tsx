"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const FIT_OPTIONS = [
    "Slim",
    "Regular",
    "Relaxed",
    "Oversized",
];

const COMFORT_OPTIONS = [
    "Low",
    "Medium",
    "High",
];

const STYLE_GOAL_OPTIONS = [
    "Look Taller",
    "Look Slimmer",
    "Balanced",
    "Trendy",
    "Elegant",
    "No Preference",
];

const ACCESSORY_OPTIONS = [
    "Minimal",
    "Moderate",
    "Statement",
    "No Preference",
];

type MessageType = "success" | "error" | null;

export default function OnboardingStepThreePage() {
    const router = useRouter();

    const [fitPreference, setFitPreference] = useState("");
    const [comfortPriority, setComfortPriority] = useState("");
    const [styleGoal, setStyleGoal] = useState("");
    const [accessoriesPreference, setAccessoriesPreference] =
        useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] =
        useState<MessageType>(null);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");
        setMessageType(null);

        if (!fitPreference) {
            setMessageType("error");
            setMessage("Please select your preferred fit.");
            return;
        }

        if (!comfortPriority) {
            setMessageType("error");
            setMessage("Please select your comfort priority.");
            return;
        }

        if (!styleGoal) {
            setMessageType("error");
            setMessage("Please select your styling goal.");
            return;
        }

        if (!accessoriesPreference) {
            setMessageType("error");
            setMessage("Please select your accessories preference.");
            return;
        }

        setIsSubmitting(true);

        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsSubmitting(false);
            setMessageType("error");
            setMessage(
                "Your session has expired. Please log in again."
            );
            return;
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                fit_preference: fitPreference,
                comfort_priority: comfortPriority,
                style_goal: styleGoal,
                accessories_preference: accessoriesPreference,
                onboarding_step: 3,
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);

        setIsSubmitting(false);

        if (error) {
            setMessageType("error");
            setMessage(error.message);
            return;
        }

        setMessageType("success");
        setMessage("Your Stylora profile is ready!");

        setTimeout(() => {
            router.push("/dashboard");
            router.refresh();
        }, 700);
    };

    const selectedStyle = {
        borderColor: "#22C55E",
        backgroundColor: "#F0FDF4",
        color: "#15803D",
    };

    const normalStyle = {
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        color: "#4B5563",
    };

    return (
        <main className="min-h-screen bg-[#fffafa] px-4 py-8 sm:px-6">
            <div className="mx-auto w-full max-w-[820px]">

                <div className="mb-8 text-center">
                    <p className="text-3xl font-medium tracking-[0.28em] text-black sm:text-4xl">
                        STYLORA
                    </p>

                    <div className="mx-auto mt-4 h-px w-16 bg-black/60" />

                    <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-[#15803D]">
                        Step 3 of 3
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold text-black sm:text-4xl">
                        Final Styling Preferences
                    </h1>

                    <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-gray-500 sm:text-base">
                        One last step to help Stylora understand how
                        you like your outfits to fit, feel, and look.
                    </p>
                </div>

                <div className="rounded-[32px] border border-[#f4dce4] bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-10">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-8"
                    >
                        {/* Fit Preference */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-black">
                                Preferred Fit *
                            </p>

                            <p className="mb-4 text-xs text-gray-500">
                                How do you usually like your clothes
                                to fit?
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {FIT_OPTIONS.map((option) => {
                                    const selected =
                                        fitPreference === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                setFitPreference(option)
                                            }
                                            className="rounded-xl border px-4 py-3 text-sm transition"
                                            style={
                                                selected
                                                    ? selectedStyle
                                                    : normalStyle
                                            }
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Comfort */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-black">
                                Comfort Priority *
                            </p>

                            <p className="mb-4 text-xs text-gray-500">
                                How important is comfort when choosing
                                an outfit?
                            </p>

                            <div className="grid grid-cols-3 gap-3">
                                {COMFORT_OPTIONS.map((option) => {
                                    const selected =
                                        comfortPriority === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                setComfortPriority(option)
                                            }
                                            className="rounded-xl border px-4 py-3 text-sm transition"
                                            style={
                                                selected
                                                    ? selectedStyle
                                                    : normalStyle
                                            }
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Styling Goal */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-black">
                                Styling Goal *
                            </p>

                            <p className="mb-4 text-xs text-gray-500">
                                What would you most like Stylora to
                                consider when styling you?
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {STYLE_GOAL_OPTIONS.map((option) => {
                                    const selected =
                                        styleGoal === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                setStyleGoal(option)
                                            }
                                            className="rounded-xl border px-4 py-3 text-sm transition"
                                            style={
                                                selected
                                                    ? selectedStyle
                                                    : normalStyle
                                            }
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Accessories */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-black">
                                Accessories Preference *
                            </p>

                            <p className="mb-4 text-xs text-gray-500">
                                How much do you usually like
                                accessories to be part of your look?
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {ACCESSORY_OPTIONS.map((option) => {
                                    const selected =
                                        accessoriesPreference === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                setAccessoriesPreference(
                                                    option
                                                )
                                            }
                                            className="rounded-xl border px-4 py-3 text-sm transition"
                                            style={
                                                selected
                                                    ? selectedStyle
                                                    : normalStyle
                                            }
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {message && (
                            <p
                                className="rounded-xl border px-4 py-3 text-sm"
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
                                {message}
                            </p>
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                size="large"
                                className="w-full"
                                onClick={() =>
                                    router.push(
                                        "/onboarding/step-2"
                                    )
                                }
                            >
                                BACK
                            </Button>

                            <Button
                                type="submit"
                                size="large"
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                {isSubmitting
                                    ? "FINISHING..."
                                    : "FINISH SETUP"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}