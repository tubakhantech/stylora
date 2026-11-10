
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

type FieldErrors = {
    fullName?: string;
    age?: string;
    gender?: string;
    bodyType?: string;
    skinTone?: string;
};

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
    { label: "Fair", value: "fair", color: "#F8DCC8" },
    { label: "Light", value: "light", color: "#EBC3A4" },
    { label: "Medium", value: "medium", color: "#D9A278" },
    { label: "Tan", value: "tan", color: "#B9784E" },
    { label: "Deep", value: "deep", color: "#855035" },
    { label: "Rich Deep", value: "rich_deep", color: "#593523" },
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

    const [errors, setErrors] = useState<FieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] =
        useState<MessageType>(null);

    const validateForm = () => {
        const newErrors: FieldErrors = {};

        const trimmedName = fullName.trim();
        const numericAge = Number(age);

        if (!trimmedName) {
            newErrors.fullName = "Please enter your full name.";
        } else if (trimmedName.length < 2) {
            newErrors.fullName =
                "Name must contain at least 2 characters.";
        } else if (trimmedName.length > 60) {
            newErrors.fullName =
                "Name cannot exceed 60 characters.";
        } else if (!/^[\p{L}\p{M} .'-]+$/u.test(trimmedName)) {
            newErrors.fullName =
                "Please enter a valid name.";
        }

        if (!age.trim()) {
            newErrors.age = "Please enter your age.";
        } else if (
            !/^\d+$/.test(age.trim()) ||
            !Number.isInteger(numericAge) ||
            numericAge < 13 ||
            numericAge > 100
        ) {
            newErrors.age =
                "Age must be a whole number between 13 and 100.";
        }

        if (!GENDER_OPTIONS.includes(gender)) {
            newErrors.gender = "Please select a valid gender.";
        }

        if (!BODY_TYPE_OPTIONS.includes(bodyType)) {
            newErrors.bodyType = "Please select a valid body type.";
        }

        if (
            !SKIN_TONE_OPTIONS.some(
                (tone) => tone.value === skinTone
            )
        ) {
            newErrors.skinTone =
                "Please select a valid skin tone.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");
        setMessageType(null);

        if (!validateForm()) {
            setMessageType("error");
            setMessage("Please correct the highlighted fields.");
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
                        age: Number(age),
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

            if (error) {
                throw error;
            }

            setMessageType("success");
            setMessage(
                "Your profile details have been saved successfully."
            );

            setTimeout(() => {
                router.push("/onboarding/step-2");
                router.refresh();
            }, 600);
        } catch (error) {
            console.error("Onboarding Step 1 error:", error);

            setMessageType("error");
            setMessage(
                "Something went wrong while saving your details. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const errorClass = "mt-2 text-sm text-red-600";

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
                        noValidate
                    >
                        {/* Full Name */}
                        <div>
                            <Input
                                type="text"
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(event) => {
                                    setFullName(event.target.value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        fullName: undefined,
                                    }));
                                }}
                                required
                            />
                            {errors.fullName && (
                                <p className={errorClass}>
                                    {errors.fullName}
                                </p>
                            )}
                        </div>

                        {/* Age */}
                        <div>
                            <Input
                                type="number"
                                label="Age"
                                placeholder="Enter your age"
                                value={age}
                                onChange={(event) => {
                                    setAge(event.target.value);
                                    setErrors((prev) => ({
                                        ...prev,
                                        age: undefined,
                                    }));
                                }}
                                required
                            />
                            {errors.age && (
                                <p className={errorClass}>
                                    {errors.age}
                                </p>
                            )}
                        </div>

                        {/* Gender */}
                        <div>
                            <p className="mb-3 text-sm font-medium text-black">
                                Gender
                                <span className="ml-1 text-[#15803D]">*</span>
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {GENDER_OPTIONS.map((option) => {
                                    const selected = gender === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            disabled={isSubmitting}
                                            aria-pressed={selected}
                                            onClick={() => {
                                                setGender(option);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    gender: undefined,
                                                }));
                                            }}
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

                            {errors.gender && (
                                <p className={errorClass}>
                                    {errors.gender}
                                </p>
                            )}
                        </div>

                        {/* Body Type */}
                        <div>
                            <p className="mb-3 text-sm font-medium text-black">
                                Body Type
                                <span className="ml-1 text-[#15803D]">*</span>
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {BODY_TYPE_OPTIONS.map((option) => {
                                    const selected = bodyType === option;

                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            disabled={isSubmitting}
                                            aria-pressed={selected}
                                            onClick={() => {
                                                setBodyType(option);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    bodyType: undefined,
                                                }));
                                            }}
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

                            {errors.bodyType && (
                                <p className={errorClass}>
                                    {errors.bodyType}
                                </p>
                            )}
                        </div>

                        {/* Skin Tone */}
                        <div>
                            <div className="mb-4">
                                <p className="text-sm font-medium text-black">
                                    Skin Tone
                                    <span className="ml-1 text-[#15803D]">*</span>
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
                                            disabled={isSubmitting}
                                            aria-pressed={selected}
                                            onClick={() => {
                                                setSkinTone(tone.value);
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    skinTone: undefined,
                                                }));
                                            }}
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
                                                    backgroundColor: tone.color,
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

                            {errors.skinTone && (
                                <p className={errorClass}>
                                    {errors.skinTone}
                                </p>
                            )}
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
