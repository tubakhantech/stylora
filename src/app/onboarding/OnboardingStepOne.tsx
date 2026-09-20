"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

interface OnboardingStepOneProps {
    initialName?: string;
    initialAge?: string;
    initialGender?: string;
    initialBodyType?: string;
    initialSkinTone?: string;
}

type MessageType = "success" | "error" | null;

const GENDER_OPTIONS = [
    "Female",
    "Male",
    "Non-binary",
    "Prefer not to say",
];

const BODY_TYPE_OPTIONS = [
    "Hourglass",
    "Pear",
    "Apple",
    "Rectangle",
    "Inverted Triangle",
    "Not Sure",
];

const SKIN_TONE_OPTIONS = [
    {
        label: "Fair",
        value: "fair",
        color: "#F8DCC8",
    },
    {
        label: "Light",
        value: "light",
        color: "#EBC3A4",
    },
    {
        label: "Medium",
        value: "medium",
        color: "#D9A278",
    },
    {
        label: "Tan",
        value: "tan",
        color: "#B9784E",
    },
    {
        label: "Deep",
        value: "deep",
        color: "#855035",
    },
    {
        label: "Rich Deep",
        value: "rich_deep",
        color: "#593523",
    },
];

export default function OnboardingStepOne({
    initialName = "",
    initialAge = "",
    initialGender = "",
    initialBodyType = "",
    initialSkinTone = "",
}: OnboardingStepOneProps) {
    const router = useRouter();

    const [fullName, setFullName] = useState(initialName);
    const [age, setAge] = useState(initialAge);
    const [gender, setGender] = useState(initialGender);
    const [bodyType, setBodyType] = useState(initialBodyType);
    const [skinTone, setSkinTone] = useState(initialSkinTone);

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

        if (!fullName.trim()) {
            setMessageType("error");
            setMessage("Please enter your full name.");
            return;
        }

        const numericAge = Number(age);

        if (
            !age ||
            Number.isNaN(numericAge) ||
            numericAge < 13 ||
            numericAge > 100
        ) {
            setMessageType("error");
            setMessage("Please enter a valid age.");
            return;
        }

        if (!gender) {
            setMessageType("error");
            setMessage("Please select your gender.");
            return;
        }

        if (!bodyType) {
            setMessageType("error");
            setMessage("Please select your body type.");
            return;
        }

        if (!skinTone) {
            setMessageType("error");
            setMessage("Please select your skin tone.");
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
            .upsert(
                {
                    id: user.id,
                    full_name: fullName.trim(),
                    age: numericAge,
                    gender,
                    body_type: bodyType,
                    skin_tone: skinTone,
                    onboarding_step: 2,
                    onboarding_completed: false,
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "id",
                }
            );

        setIsSubmitting(false);

        if (error) {
            setMessageType("error");
            setMessage(error.message);
            return;
        }

        setMessageType("success");
        setMessage(
            "Your profile details have been saved successfully."
        );

        setTimeout(() => {
            router.push("/onboarding/step-2");
            router.refresh();
        }, 600);
    };

    return (
        <main className="min-h-screen bg-[#fffafa] px-4 py-8 sm:px-6">
            <div className="mx-auto w-full max-w-[760px]">

                {/* Brand */}
                <div className="mb-8 text-center">
                    <p className="text-3xl font-medium tracking-[0.28em] text-black sm:text-4xl">
                        STYLORA
                    </p>

                    <div className="mx-auto mt-4 h-px w-16 bg-black/60" />

                    <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-[#15803D]">
                        Step 1 of 3
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold text-black sm:text-4xl">
                        Tell Us About You
                    </h1>

                    <p className="mx-auto mt-3 max-w-[520px] text-sm leading-6 text-gray-500 sm:text-base">
                        These details help Stylora personalize your
                        outfit and color recommendations.
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-[32px] border border-[#f4dce4] bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-10">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-7"
                    >
                        <Input
                            type="text"
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(event) =>
                                setFullName(event.target.value)
                            }
                            required
                        />

                        <Input
                            type="number"
                            label="Age"
                            placeholder="Enter your age"
                            value={age}
                            onChange={(event) =>
                                setAge(event.target.value)
                            }
                            required
                        />

                        {/* Gender */}
                        <div>
                            <p className="mb-3 text-sm font-medium text-black">
                                Gender
                                <span className="ml-1 text-[#15803D]">
                                    *
                                </span>
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {GENDER_OPTIONS.map((option) => {
                                    const selected =
                                        gender === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                setGender(option)
                                            }
                                            className="rounded-xl border px-3 py-3 text-sm transition"
                                            style={{
                                                borderColor: selected
                                                    ? "#22C55E"
                                                    : "#E5E7EB",
                                                backgroundColor: selected
                                                    ? "#F0FDF4"
                                                    : "#FFFFFF",
                                                color: selected
                                                    ? "#15803D"
                                                    : "#4B5563",
                                            }}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Body Type */}
                        <div>
                            <p className="mb-3 text-sm font-medium text-black">
                                Body Type
                                <span className="ml-1 text-[#15803D]">
                                    *
                                </span>
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {BODY_TYPE_OPTIONS.map((option) => {
                                    const selected =
                                        bodyType === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() =>
                                                setBodyType(option)
                                            }
                                            className="rounded-xl border px-4 py-3 text-sm transition"
                                            style={{
                                                borderColor: selected
                                                    ? "#22C55E"
                                                    : "#E5E7EB",
                                                backgroundColor: selected
                                                    ? "#F0FDF4"
                                                    : "#FFFFFF",
                                                color: selected
                                                    ? "#15803D"
                                                    : "#4B5563",
                                            }}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Skin Tone */}
                        <div>
                            <div className="mb-4">
                                <p className="text-sm font-medium text-black">
                                    Skin Tone
                                    <span className="ml-1 text-[#15803D]">
                                        *
                                    </span>
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Choose the shade closest to your
                                    natural skin tone.
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                                {SKIN_TONE_OPTIONS.map((tone) => {
                                    const selected =
                                        skinTone === tone.value;

                                    return (
                                        <button
                                            key={tone.value}
                                            type="button"
                                            onClick={() =>
                                                setSkinTone(tone.value)
                                            }
                                            className="flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition"
                                            style={{
                                                borderColor: selected
                                                    ? "#22C55E"
                                                    : "#E5E7EB",
                                                backgroundColor: selected
                                                    ? "#F0FDF4"
                                                    : "#FFFFFF",
                                            }}
                                        >
                                            <span
                                                className="h-10 w-10 rounded-full border border-black/10 shadow-sm"
                                                style={{
                                                    backgroundColor:
                                                        tone.color,
                                                }}
                                            />

                                            <span
                                                className="text-xs"
                                                style={{
                                                    color: selected
                                                        ? "#15803D"
                                                        : "#6B7280",
                                                }}
                                            >
                                                {tone.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Message */}
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
                    </form>
                </div>
            </div>
        </main>
    );
}