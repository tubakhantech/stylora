"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

const STYLE_OPTIONS = [
    "Casual",
    "Formal",
    "Streetwear",
    "Minimal",
    "Ethnic",
    "Party",
    "Sporty",
    "Elegant",
];

const COLOR_OPTIONS = [
    "Black",
    "White",
    "Beige",
    "Brown",
    "Blue",
    "Green",
    "Pink",
    "Red",
    "Purple",
    "Yellow",
    "Orange",
    "Grey",
];

const OCCASION_OPTIONS = [
    "Daily Wear",
    "Office / College",
    "Party",
    "Wedding / Festive",
    "Travel",
    "Date / Outing",
];

type MessageType = "success" | "error" | null;

function toggleValue(
    value: string,
    currentValues: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
) {
    if (currentValues.includes(value)) {
        setter(currentValues.filter((item) => item !== value));
    } else {
        setter([...currentValues, value]);
    }
}

export default function OnboardingStepTwoPage() {
    const router = useRouter();

    const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
    const [favoriteColors, setFavoriteColors] = useState<string[]>([]);
    const [avoidColors, setAvoidColors] = useState<string[]>([]);
    const [commonOccasions, setCommonOccasions] = useState<string[]>([]);

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

        const validStyles = preferredStyles.every((value) =>
            STYLE_OPTIONS.includes(value)
        );

        const validFavoriteColors = favoriteColors.every((value) =>
            COLOR_OPTIONS.includes(value)
        );

        const validAvoidColors = avoidColors.every((value) =>
            COLOR_OPTIONS.includes(value)
        );

        const validOccasions = commonOccasions.every((value) =>
            OCCASION_OPTIONS.includes(value)
        );

        if (
            preferredStyles.length === 0 ||
            !validStyles
        ) {
            setMessageType("error");
            setMessage("Please select at least one valid preferred style.");
            return;
        }

        if (
            favoriteColors.length === 0 ||
            !validFavoriteColors
        ) {
            setMessageType("error");
            setMessage("Please select at least one valid favorite color.");
            return;
        }

        if (!validAvoidColors) {
            setMessageType("error");
            setMessage("Please select valid colors to avoid.");
            return;
        }

        if (
            commonOccasions.length === 0 ||
            !validOccasions
        ) {
            setMessageType("error");
            setMessage("Please select at least one valid occasion.");
            return;
        }

        setIsSubmitting(true);

        try {
            const supabase = createClient();

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                setMessageType("error");
                setMessage("Your session has expired. Please log in again.");
                return;
            }

            const { error } = await supabase
                .from("profiles")
                .update({
                    preferred_styles: preferredStyles,
                    favorite_colors: favoriteColors,
                    avoid_colors: avoidColors,
                    common_occasions: commonOccasions,
                    onboarding_step: 3,
                    onboarding_completed: false,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (error) {
                throw error;
            }

            setMessageType("success");
            setMessage("Your style preferences have been saved successfully.");

            setTimeout(() => {
                router.push("/onboarding/step-3");
                router.refresh();
            }, 600);
        } catch (error) {
            console.error("Onboarding Step 2 error:", error);

            setMessageType("error");
            setMessage(
                "Something went wrong while saving your preferences. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
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
                        Step 2 of 3
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold text-black sm:text-4xl">
                        Your Style Preferences
                    </h1>

                    <p className="mx-auto mt-3 max-w-[560px] text-sm leading-6 text-gray-500 sm:text-base">
                        Tell Stylora what you like so your outfit
                        recommendations feel more personal to you.
                    </p>
                </div>

                <div className="rounded-[32px] border border-[#f4dce4] bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-10">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-8"
                    >
                        {/* Preferred styles */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-black">
                                Preferred Styles *
                            </p>

                            <p className="mb-4 text-xs text-gray-500">
                                Select all styles you enjoy wearing.
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {STYLE_OPTIONS.map((option) => {
                                    const selected =
                                        preferredStyles.includes(option);

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                toggleValue(
                                                    option,
                                                    preferredStyles,
                                                    setPreferredStyles
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

                        {/* Favorite colors */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-black">
                                Favorite Colors *
                            </p>

                            <p className="mb-4 text-xs text-gray-500">
                                Choose colors you usually enjoy wearing.
                            </p>

                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {COLOR_OPTIONS.map((color) => {
                                    const selected =
                                        favoriteColors.includes(color);

                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() =>
                                                toggleValue(
                                                    color,
                                                    favoriteColors,
                                                    setFavoriteColors
                                                )
                                            }
                                            className="rounded-xl border px-3 py-3 text-sm transition"
                                            style={
                                                selected
                                                    ? selectedStyle
                                                    : normalStyle
                                            }
                                        >
                                            {color}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Avoid colors */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-black">
                                Colors You Prefer to Avoid
                            </p>

                            <p className="mb-4 text-xs text-gray-500">
                                Optional — select any colors you usually
                                do not like wearing.
                            </p>

                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                                {COLOR_OPTIONS.map((color) => {
                                    const selected =
                                        avoidColors.includes(color);

                                    return (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() =>
                                                toggleValue(
                                                    color,
                                                    avoidColors,
                                                    setAvoidColors
                                                )
                                            }
                                            className="rounded-xl border px-3 py-3 text-sm transition"
                                            style={
                                                selected
                                                    ? selectedStyle
                                                    : normalStyle
                                            }
                                        >
                                            {color}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Occasions */}
                        <div>
                            <p className="mb-2 text-sm font-medium text-black">
                                Common Occasions *
                            </p>

                            <p className="mb-4 text-xs text-gray-500">
                                Where do you usually need styling help?
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {OCCASION_OPTIONS.map((option) => {
                                    const selected =
                                        commonOccasions.includes(option);

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                toggleValue(
                                                    option,
                                                    commonOccasions,
                                                    setCommonOccasions
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
                                    router.push("/onboarding")
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
                                    ? "SAVING..."
                                    : "SAVE & CONTINUE"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}