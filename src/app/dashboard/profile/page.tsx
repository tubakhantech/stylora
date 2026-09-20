"use client";

import {
    ChangeEvent,
    FormEvent,
    useEffect,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

type MessageType = "success" | "error" | null;

const MODESTY_OPTIONS = [
    "Modest Dressing",
    "Full Sleeves",
    "Avoid Sleeveless",
    "Avoid Deep Necklines",
    "Prefer Loose Fit",
    "Prefer Longer Lengths",
    "Hijab-Friendly",
    "Include Dupatta / Scarf",
];

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
    "fair",
    "light",
    "medium",
    "tan",
    "deep",
    "rich_deep",
];

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

function toggleValue(
    value: string,
    currentValues: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
) {
    if (currentValues.includes(value)) {
        setter(
            currentValues.filter(
                (item) => item !== value
            )
        );
    } else {
        setter([
            ...currentValues,
            value,
        ]);
    }
}

export default function ProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] =
        useState(true);

    const [isSaving, setIsSaving] =
        useState(false);

    const [isUploadingPhoto, setIsUploadingPhoto] =
        useState(false);

    const [isEditing, setIsEditing] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [messageType, setMessageType] =
        useState<MessageType>(null);

    const [fullName, setFullName] =
        useState("");

    const [age, setAge] =
        useState("");

    const [gender, setGender] =
        useState("");

    const [bodyType, setBodyType] =
        useState("");

    const [skinTone, setSkinTone] =
        useState("");

    const [preferredStyles, setPreferredStyles] =
        useState<string[]>([]);

    const [favoriteColors, setFavoriteColors] =
        useState<string[]>([]);

    const [avoidColors, setAvoidColors] =
        useState<string[]>([]);

    const [commonOccasions, setCommonOccasions] =
        useState<string[]>([]);

    const [modestyPreferences, setModestyPreferences] =
        useState<string[]>([]);

    const [fitPreference, setFitPreference] =
        useState("");

    const [comfortPriority, setComfortPriority] =
        useState("");

    const [styleGoal, setStyleGoal] =
        useState("");

    const [
        accessoriesPreference,
        setAccessoriesPreference,
    ] = useState("");

    // PROFILE IMAGE
    const [avatarPath, setAvatarPath] =
        useState<string | null>(null);

    const [avatarDisplayUrl, setAvatarDisplayUrl] =
        useState<string | null>(null);

    const [avatarBodyPath, setAvatarBodyPath] =
        useState<string | null>(null);

    const [avatarBodyDisplayUrl, setAvatarBodyDisplayUrl] =
        useState<string | null>(null);

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

    const createAvatarSignedUrl = async (
        path: string | null
    ) => {
        if (!path) {
            setAvatarDisplayUrl(null);
            return;
        }

        const supabase = createClient();

        const { data, error } =
            await supabase.storage
                .from("profile-images")
                .createSignedUrl(
                    path,
                    3600
                );

        if (error) {
            setAvatarDisplayUrl(null);
            return;
        }

        setAvatarDisplayUrl(
            data.signedUrl
        );
    };

    const createAvatarBodySignedUrl = async (
        path: string | null
    ) => {
        if (!path) {
            setAvatarBodyDisplayUrl(null);
            return;
        }

        const supabase = createClient();

        const { data, error } =
            await supabase.storage
                .from("profile-images")
                .createSignedUrl(
                    path,
                    3600
                );

        if (error) {
            setAvatarBodyDisplayUrl(null);
            return;
        }

        setAvatarBodyDisplayUrl(
            data.signedUrl
        );
    };

    const loadProfile = async () => {
        const supabase =
            createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsLoading(false);
            return;
        }

        const {
            data,
            error,
        } = await supabase
            .from("profiles")
            .select(`
                full_name,
                age,
                gender,
                body_type,
                skin_tone,
                preferred_styles,
                favorite_colors,
                avoid_colors,
                common_occasions,
                modesty_preferences,
                fit_preference,
                comfort_priority,
                style_goal,
                accessories_preference,
                avatar_url,
                avatar_body_url
            `)
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
            showMessage(
                "error",
                error.message
            );

            setIsLoading(false);
            return;
        }

        if (data) {
            setFullName(
                data.full_name ?? ""
            );

            setAge(
                data.age
                    ? String(data.age)
                    : ""
            );

            setGender(
                data.gender ?? ""
            );

            setBodyType(
                data.body_type ?? ""
            );

            setSkinTone(
                data.skin_tone ?? ""
            );

            setPreferredStyles(
                data.preferred_styles ?? []
            );

            setFavoriteColors(
                data.favorite_colors ?? []
            );

            setAvoidColors(
                data.avoid_colors ?? []
            );

            setCommonOccasions(
                data.common_occasions ?? []
            );

            setModestyPreferences(
                data.modesty_preferences ?? []
            );

            setFitPreference(
                data.fit_preference ?? ""
            );

            setComfortPriority(
                data.comfort_priority ?? ""
            );

            setStyleGoal(
                data.style_goal ?? ""
            );

            setAccessoriesPreference(
                data.accessories_preference ??
                ""
            );

            setAvatarPath(
                data.avatar_url ?? null
            );

            await createAvatarSignedUrl(
                data.avatar_url ?? null
            );

            setAvatarBodyPath(
                data.avatar_body_url ?? null
            );

            await createAvatarBodySignedUrl(
                data.avatar_body_url ?? null
            );
        }

        setIsLoading(false);
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // UPLOAD / CHANGE PROFILE PHOTO
    const handlePhotoChange = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            showMessage(
                "error",
                "Please select a valid image."
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage(
                "error",
                "Profile photo must be smaller than 5 MB."
            );
            return;
        }

        setIsUploadingPhoto(true);

        const supabase =
            createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsUploadingPhoto(false);

            showMessage(
                "error",
                "Your session has expired."
            );

            return;
        }

        const extension =
            file.name
                .split(".")
                .pop()
                ?.toLowerCase() ||
            "jpg";

        const newPath =
            `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
            await supabase.storage
                .from("profile-images")
                .upload(
                    newPath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                    }
                );

        if (uploadError) {
            setIsUploadingPhoto(false);

            showMessage(
                "error",
                uploadError.message
            );

            return;
        }

        const oldPath = avatarPath;

        const { error: updateError } =
            await supabase
                .from("profiles")
                .update({
                    avatar_url:
                        newPath,
                    updated_at:
                        new Date().toISOString(),
                })
                .eq(
                    "id",
                    user.id
                );

        if (updateError) {
            await supabase.storage
                .from("profile-images")
                .remove([
                    newPath,
                ]);

            setIsUploadingPhoto(false);

            showMessage(
                "error",
                updateError.message
            );

            return;
        }

        if (
            oldPath &&
            oldPath !== newPath
        ) {
            await supabase.storage
                .from("profile-images")
                .remove([
                    oldPath,
                ]);
        }

        setAvatarPath(newPath);

        await createAvatarSignedUrl(
            newPath
        );

        setIsUploadingPhoto(false);

        showMessage(
            "success",
            "Profile photo updated successfully."
        );

        router.refresh();

        event.target.value = "";
    };

    const handleAvatarBodyChange = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            showMessage(
                "error",
                "Please select a valid image."
            );
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            showMessage(
                "error",
                "Full-body photo must be smaller than 8 MB."
            );
            return;
        }

        setIsUploadingPhoto(true);

        const supabase =
            createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsUploadingPhoto(false);

            showMessage(
                "error",
                "Your session has expired."
            );

            return;
        }

        const extension =
            file.name
                .split(".")
                .pop()
                ?.toLowerCase() ||
            "jpg";

        const newPath =
            `${user.id}/body-${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
            await supabase.storage
                .from("profile-images")
                .upload(
                    newPath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                    }
                );

        if (uploadError) {
            setIsUploadingPhoto(false);

            showMessage(
                "error",
                uploadError.message
            );

            return;
        }

        const oldPath =
            avatarBodyPath;

        const { error: updateError } =
            await supabase
                .from("profiles")
                .update({
                    avatar_body_url:
                        newPath,
                    updated_at:
                        new Date().toISOString(),
                })
                .eq(
                    "id",
                    user.id
                );

        if (updateError) {
            await supabase.storage
                .from("profile-images")
                .remove([
                    newPath,
                ]);

            setIsUploadingPhoto(false);

            showMessage(
                "error",
                updateError.message
            );

            return;
        }

        if (
            oldPath &&
            oldPath !== newPath
        ) {
            await supabase.storage
                .from("profile-images")
                .remove([
                    oldPath,
                ]);
        }

        setAvatarBodyPath(newPath);

        await createAvatarBodySignedUrl(
            newPath
        );

        setIsUploadingPhoto(false);

        showMessage(
            "success",
            "Full-body avatar photo updated successfully."
        );

        event.target.value = "";
    };

    // REMOVE PROFILE PHOTO
    const handleRemovePhoto =
        async () => {
            if (!avatarPath) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Remove your profile photo?"
                );

            if (!confirmed) {
                return;
            }

            setIsUploadingPhoto(true);

            const supabase =
                createClient();

            const {
                data: { user },
            } =
                await supabase.auth.getUser();

            if (!user) {
                setIsUploadingPhoto(false);
                return;
            }

            const oldPath =
                avatarPath;

            const { error } =
                await supabase
                    .from("profiles")
                    .update({
                        avatar_url:
                            null,
                        updated_at:
                            new Date().toISOString(),
                    })
                    .eq(
                        "id",
                        user.id
                    );

            if (error) {
                setIsUploadingPhoto(false);

                showMessage(
                    "error",
                    error.message
                );

                return;
            }

            await supabase.storage
                .from("profile-images")
                .remove([
                    oldPath,
                ]);

            setAvatarPath(null);
            setAvatarDisplayUrl(null);

            setIsUploadingPhoto(false);

            showMessage(
                "success",
                "Profile photo removed."
            );

            router.refresh();
        };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");
        setMessageType(null);

        if (!fullName.trim()) {
            showMessage(
                "error",
                "Please enter your full name."
            );
            return;
        }

        const numericAge =
            Number(age);

        if (
            !age ||
            Number.isNaN(numericAge) ||
            numericAge < 13 ||
            numericAge > 100
        ) {
            showMessage(
                "error",
                "Please enter a valid age."
            );
            return;
        }

        setIsSaving(true);

        const supabase =
            createClient();

        const {
            data: { user },
        } =
            await supabase.auth.getUser();

        if (!user) {
            setIsSaving(false);

            showMessage(
                "error",
                "Your session has expired."
            );

            return;
        }

        const { error } =
            await supabase
                .from("profiles")
                .update({
                    full_name:
                        fullName.trim(),

                    age:
                        numericAge,

                    gender:
                        gender || null,

                    body_type:
                        bodyType || null,

                    skin_tone:
                        skinTone || null,

                    preferred_styles:
                        preferredStyles,

                    favorite_colors:
                        favoriteColors,

                    avoid_colors:
                        avoidColors,

                    common_occasions:
                        commonOccasions,

                    modesty_preferences:
                        modestyPreferences,

                    fit_preference:
                        fitPreference ||
                        null,

                    comfort_priority:
                        comfortPriority ||
                        null,

                    style_goal:
                        styleGoal ||
                        null,

                    accessories_preference:
                        accessoriesPreference ||
                        null,

                    updated_at:
                        new Date().toISOString(),
                })
                .eq(
                    "id",
                    user.id
                );

        setIsSaving(false);

        if (error) {
            showMessage(
                "error",
                error.message
            );
            return;
        }
        setIsEditing(false);

        showMessage(
            "success",
            "Profile updated successfully."
        );

        router.refresh();
    };

    const selectedStyle = {
        borderColor: "#E7BCC6",
        backgroundColor: "#FDF0F2",
        color: "#9F6474",
    };

    const normalStyle = {
        borderColor: "#E5E7EB",
        backgroundColor: "#FFFFFF",
        color: "#4B5563",
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fdf8f6] p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-[1000px] rounded-[24px] border border-    [#f1e4e8] bg-white p-10 text-center">
                    <p className="text-sm text-gray-500">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    if (!isEditing) {
        return (
            <div className="min-h-screen bg-[#fdf8f6] p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-[1000px]">

                    {message && (
                        <MessageBox
                            message={message}
                            type={messageType}
                        />
                    )}

                    {/* PROFILE HEADER */}

                    <section className="relative mb-6 overflow-hidden rounded-[30px] border border-[#f0dfe3] bg-gradient-to-br from-[#fdf0f2] via-[#fff8f9] to-white p-6 sm:p-8">

                        {/* Decorative background */}
                        <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#f8d7da]/60 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 right-36 h-32 w-32 rounded-full bg-[#f6e5da]/50 blur-2xl" />

                        <div className="relative">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                        Your Style Profile
                                    </p>

                                    <p className="mt-1 text-sm text-[#8b777d]">
                                        The details Stylora uses to personalize your style.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="shrink-0 rounded-full border border-[#e5c9d0] bg-white/80 px-4 py-2.5 text-xs font-semibold text-[#9f6474] shadow-sm transition hover:bg-white hover:text-[#7f4f5c] sm:px-5 sm:py-3 sm:text-sm"
                                >
                                    ✎ Edit
                                </button>
                            </div>

                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                                {/* PROFILE PHOTO */}
                                <div className="relative">
                                    <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full border-[5px] border-white bg-[#f8dce5] shadow-[0_15px_40px_rgba(83,48,58,0.12)]">
                                        {avatarDisplayUrl ? (
                                            <img
                                                src={avatarDisplayUrl}
                                                alt={
                                                    fullName ||
                                                    "Profile"
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-[#111111]">
                                                {fullName
                                                    ? fullName
                                                        .charAt(0)
                                                        .toUpperCase()
                                                    : "S"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="absolute bottom-1 left-[92px] flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#eadfe1] bg-white text-[#111111] shadow-md sm:left-auto sm:right-1">
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-4 w-4"
                                        >
                                            <path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z" />
                                            <circle cx="12" cy="13" r="3" />
                                        </svg>
                                    </div>
                                </div>

                                {/* PROFILE INFO */}
                                <div className="flex-1">
                                    <h2 className="text-3xl font-semibold tracking-[-0.035em] text-[#111111] sm:text-4xl">
                                        {fullName ||
                                            "Stylora User"}
                                    </h2>

                                    <p className="mt-1 text-sm font-medium text-[#9a727d]">
                                        Personal Style Profile
                                    </p>

                                    {/* TAGS */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {bodyType && (
                                            <ProfileTag
                                                value={`${bodyType} Body Type`}
                                            />
                                        )}

                                        {skinTone && (
                                            <ProfileTag
                                                value={`${formatValue(
                                                    skinTone
                                                )} Skin Tone`}
                                            />
                                        )}

                                        {preferredStyles[0] && (
                                            <ProfileTag
                                                value={`${preferredStyles[0]} Style`}
                                            />
                                        )}
                                    </div>

                                    {/* PHOTO ACTIONS */}
                                    <div className="mt-5 flex items-center gap-2">

                                        <label className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-[#e7cdd3] bg-white px-4 py-2 text-xs font-semibold text-[#9f6474] transition hover:bg-[#fff5f7] sm:text-sm">
                                            {isUploadingPhoto
                                                ? "Uploading..."
                                                : avatarDisplayUrl
                                                    ? "Change Photo"
                                                    : "Upload Photo"}

                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={
                                                    isUploadingPhoto
                                                }
                                                onChange={
                                                    handlePhotoChange
                                                }
                                            />
                                        </label>

                                        {avatarDisplayUrl && (
                                            <button
                                                type="button"
                                                disabled={
                                                    isUploadingPhoto
                                                }
                                                onClick={
                                                    handleRemovePhoto
                                                }
                                                className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium text-[#b66a79] transition hover:bg-white/70 sm:text-sm"
                                            >
                                                Remove Photo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* STYLORA FULL-BODY AVATAR */}
                    <section className="relative mb-6 overflow-hidden rounded-[30px] border border-[#efd9dd] bg-gradient-to-r from-[#fbe9ec] via-[#fcecef] to-[#f8dfe4] p-5 sm:p-7 lg:p-8">

                        {/* SOFT BACKGROUND DECOR */}
                        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/45 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-24 left-[35%] h-56 w-56 rounded-full bg-[#f4cfd6]/45 blur-3xl" />

                        <div className="relative grid gap-7 md:grid-cols-[250px_1fr] lg:grid-cols-[280px_1fr_135px] lg:items-center">

                            {/* FULL BODY PHOTO */}
                            <div className="relative">
                                <div className="overflow-hidden rounded-[25px] border border-white/80 bg-white/55 p-2 shadow-[0_18px_45px_rgba(114,72,83,0.10)] backdrop-blur-sm">

                                    <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-[20px] bg-[#fff9f8] p-3">

                                        {avatarBodyDisplayUrl ? (
                                            <img
                                                src={avatarBodyDisplayUrl}
                                                alt="Stylora full-body avatar"
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="px-5 text-center">
                                                <div className="text-6xl">
                                                    🧍‍♀️
                                                </div>

                                                <p className="mt-4 text-sm font-semibold text-[#111111]">
                                                    No full-body photo yet
                                                </p>

                                                <p className="mt-2 text-xs leading-5 text-[#8b777d]">
                                                    Add a clear full-body photo to unlock
                                                    Stylora&apos;s virtual try-on.
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* READY BADGE */}
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#efd4da] bg-white px-4 py-2 text-[11px] font-semibold text-[#a56776] shadow-sm">
                                    ✦ AI Try-On Ready
                                </div>
                            </div>


                            {/* MAIN CONTENT */}
                            <div className="pt-4 md:pl-3 lg:pt-0">

                                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b47787]">
                                    Stylora Virtual Try-On
                                </p>

                                <h3 className="mt-3 max-w-xl font-serif text-3xl leading-tight tracking-[-0.035em] text-[#111111] sm:text-4xl">
                                    See your styled outfits on you.
                                </h3>

                                <p className="mt-4 max-w-xl text-sm leading-6 text-[#786a6e]">
                                    Your full-body photo helps Stylora create a visual
                                    preview of AI-recommended outfits while keeping the
                                    experience personalized to you.
                                </p>


                                {/* PHOTO TIPS */}
                                <div className="mt-5 grid gap-2 sm:grid-cols-2">

                                    <div className="rounded-[14px] border border-white/80 bg-white/55 px-4 py-3 shadow-sm">
                                        <p className="text-xs font-medium text-[#4f4548]">
                                            ✓ Full body visible
                                        </p>
                                    </div>

                                    <div className="rounded-[14px] border border-white/80 bg-white/55 px-4 py-3 shadow-sm">
                                        <p className="text-xs font-medium text-[#4f4548]">
                                            ✓ Front-facing pose
                                        </p>
                                    </div>

                                    <div className="rounded-[14px] border border-white/80 bg-white/55 px-4 py-3 shadow-sm">
                                        <p className="text-xs font-medium text-[#4f4548]">
                                            ✓ Good lighting
                                        </p>
                                    </div>

                                    <div className="rounded-[14px] border border-white/80 bg-white/55 px-4 py-3 shadow-sm">
                                        <p className="text-xs font-medium text-[#4f4548]">
                                            ✓ Simple background
                                        </p>
                                    </div>

                                </div>


                                {/* UPLOAD BUTTON */}
                                <div className="mt-5">
                                    <label className="inline-flex cursor-pointer items-center rounded-full bg-[#111111] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#9f6674]">

                                        {isUploadingPhoto
                                            ? "UPLOADING..."
                                            : avatarBodyDisplayUrl
                                                ? "CHANGE FULL-BODY PHOTO"
                                                : "UPLOAD FULL-BODY PHOTO"}

                                        <span className="ml-3">
                                            →
                                        </span>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={isUploadingPhoto}
                                            onChange={handleAvatarBodyChange}
                                        />
                                    </label>
                                </div>

                                <p className="mt-4 max-w-xl text-[11px] leading-5 text-[#9a898e]">
                                    For the best result, avoid heavy filters and make sure
                                    your full body is visible from head to feet.
                                </p>

                            </div>


                            {/* EDITORIAL DECOR */}
                            <div className="relative hidden h-full min-h-[250px] lg:block">

                                {/* ARCH */}
                                <div className="absolute right-1 top-1/2 h-[215px] w-[88px] -translate-y-1/2 rounded-t-full bg-white/45" />

                                <div className="absolute bottom-8 right-3 z-10 rotate-[-7deg]">
                                    <p className="font-serif text-xl italic leading-[1.05] text-[#b36f7e]">
                                        Same
                                        <br />
                                        Person,
                                        <br />
                                        New Styles
                                        <br />
                                        ♡
                                    </p>
                                </div>

                            </div>

                        </div>
                    </section>

                    {/* STYLE IDENTITY */}
                    <section className="mb-6 overflow-hidden rounded-[30px] border border-[#efdfe3] bg-white">

                        {/* Heading */}
                        <div className="flex flex-col gap-3 border-b border-[#f2e5e8] bg-gradient-to-r from-[#fff5f7] via-white to-[#f8f1ec] px-6 py-7 sm:px-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                Your Style Identity
                            </p>

                            <h3 className="text-3xl font-semibold tracking-[-0.04em] text-[#111111]">
                                This is what makes your style yours.
                            </h3>

                            <p className="max-w-2xl text-sm leading-6 text-[#817176]">
                                A visual snapshot of the preferences Stylora uses
                                when styling outfits especially for you.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-[0.85fr_1.4fr]">

                            {/* LEFT — STYLE PERSONA */}
                            <div className="relative overflow-hidden border-r border-[#efd9dd] bg-gradient-to-br from-[#f8d7da] via-[#fbe3e6] to-[#fcebed] p-7 sm:p-8">

                                <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/50 blur-3xl" />

                                <div className="relative">
                                    <span className="inline-flex rounded-full border border-[#e8c5cd] bg-white/75 px-4 py-2 text-[10px] font-semibold tracking-[0.16em] text-[#9f6474] shadow-sm">
                                        ✦ STYLE PERSONA
                                    </span>

                                    <h4 className="mt-6 font-serif text-3xl tracking-[-0.04em] text-[#111111]">
                                        {preferredStyles[0] || "Your"} Style
                                    </h4>

                                    <p className="mt-2 text-sm leading-6 text-[#765f65]">
                                        Your core fashion profile at a glance.
                                    </p>

                                    <div className="mt-8 space-y-3">

                                        <StyleIdentityRow
                                            icon="🧍‍♀️"
                                            label="Body Type"
                                            value={bodyType}
                                        />

                                        <StyleIdentityRow
                                            icon="🤎"
                                            label="Skin Tone"
                                            value={formatValue(skinTone)}
                                        />

                                        <StyleIdentityRow
                                            icon="👗"
                                            label="Style"
                                            value={preferredStyles.join(", ")}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT — PREFERENCES */}
                            <div className="p-6 sm:p-8">

                                <div className="mb-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b47787]">
                                        Styling Preferences
                                    </p>

                                    <h4 className="mt-2 text-2xl font-semibold text-[#111111]">
                                        How you like to wear it
                                    </h4>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">

                                    <StylePreferenceCard
                                        icon="👕"
                                        label="Preferred Fit"
                                        value={fitPreference}
                                        tone="pink"
                                    />

                                    <StylePreferenceCard
                                        icon="☁️"
                                        label="Comfort"
                                        value={comfortPriority}
                                        tone="peach"
                                    />

                                    <StylePreferenceCard
                                        icon="🌟"
                                        label="Style Goal"
                                        value={styleGoal}
                                        tone="lavender"
                                    />

                                    <StylePreferenceCard
                                        icon="👜"
                                        label="Accessories"
                                        value={accessoriesPreference}
                                        tone="sage"
                                    />
                                </div>

                                {/* PERSONAL INFO */}
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-[#efdee2] bg-[#fff8f9] px-4 py-2 text-xs font-medium text-[#775f65]">
                                        👤 {fullName || "Name not set"}
                                    </span>

                                    <span className="rounded-full border border-[#efdee2] bg-[#fff8f9] px-4 py-2 text-xs font-medium text-[#775f65]">
                                        ✦ {age || "Age not set"} years
                                    </span>

                                    <span className="rounded-full border border-[#efdee2] bg-[#fff8f9] px-4 py-2 text-xs font-medium text-[#775f65]">
                                        ◇ {gender || "Gender not set"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* COLOR + LIFESTYLE */}
                    <div className="mb-6 grid gap-6 lg:grid-cols-2">

                        {/* COLOR STORY */}
                        <section className="rounded-[28px] border border-[#efdfe3] bg-gradient-to-br from-[#fff7f8] to-white p-6 sm:p-7">

                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b47787]">
                                Your Color Story
                            </p>

                            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                                Colors you feel good in.
                            </h3>

                            <p className="mt-2 text-sm text-[#8c7b80]">
                                Your favorite palette helps Stylora build outfits
                                that feel more like you.
                            </p>

                            <div className="mt-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a68f95]">
                                    Favorite Colors
                                </p>

                                {favoriteColors.length > 0 ? (
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {favoriteColors.map((color) => (
                                            <ColorChip
                                                key={color}
                                                color={color}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-[#999999]">
                                        No favorite colors selected.
                                    </p>
                                )}
                            </div>

                            <div className="mt-7 border-t border-[#f0e3e6] pt-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a68f95]">
                                    Colors To Avoid
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {avoidColors.length > 0 ? (
                                        avoidColors.map((color) => (
                                            <span
                                                key={color}
                                                className="rounded-full border border-[#e4dadd] bg-white px-4 py-2 text-xs font-medium text-[#776b6e]"
                                            >
                                                × {color}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-[#999999]">
                                            None selected
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>


                        {/* LIFESTYLE */}
                        <section className="rounded-[28px] border border-[#efdfe3] bg-white p-6 sm:p-7">

                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b47787]">
                                Your Lifestyle
                            </p>

                            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                                Where your style goes.
                            </h3>

                            <p className="mt-2 text-sm text-[#8c7b80]">
                                Stylora considers the moments you dress for most.
                            </p>

                            <div className="mt-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a68f95]">
                                    Common Occasions
                                </p>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    {commonOccasions.length > 0 ? (
                                        commonOccasions.map(
                                            (occasion) => (
                                                <span
                                                    key={occasion}
                                                    className="rounded-[16px] border border-[#efdce1] bg-[#fff5f7] px-4 py-3 text-sm font-medium text-[#8f5d6a]"
                                                >
                                                    📅 {occasion}
                                                </span>
                                            )
                                        )
                                    ) : (
                                        <p className="text-sm text-[#999999]">
                                            No occasions selected.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* MODESTY */}
                            <div className="mt-7 rounded-[22px] bg-[#fdf0f2] p-5">

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                                        💖
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-[#111111]">
                                            Modesty & Coverage
                                        </p>

                                        <p className="text-xs text-[#9a7b83]">
                                            Your personal coverage preferences
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {modestyPreferences.length > 0 ? (
                                        modestyPreferences.map(
                                            (preference) => (
                                                <span
                                                    key={preference}
                                                    className="rounded-full bg-white px-3 py-2 text-xs font-medium text-[#925f6c]"
                                                >
                                                    {preference}
                                                </span>
                                            )
                                        )
                                    ) : (
                                        <span className="text-sm text-[#9b8187]">
                                            No specific preference selected.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdf8f6] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1000px]">

                {/* EDIT PROFILE HEADER */}
                <div className="relative mb-6 overflow-hidden rounded-[28px] border border-[#f0dfe3] bg-gradient-to-r from-[#fff4f6] via-white to-[#faf3ee] p-6 sm:p-8">

                    <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#f8d7da]/60 blur-3xl" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                Personalize Stylora
                            </p>

                            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#111111]">
                                Edit your style profile
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#817176]">
                                Keep your preferences up to date so Stylora can
                                create recommendations that feel more like you.
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="large"
                            onClick={() =>
                                setIsEditing(false)
                            }
                        >
                            CANCEL
                        </Button>
                    </div>
                </div>

                {message && (
                    <MessageBox
                        message={message}
                        type={messageType}
                    />
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-6"
                >
                    {/* PERSONAL DETAILS */}
                    <section className="relative overflow-hidden rounded-[28px] border border-[#f0dfe3] bg-white p-6 sm:p-8">

                        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#f8d7da]/35 blur-3xl" />

                        <div className="relative">
                            <div className="mb-7 flex items-start gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fde7eb] text-xl">
                                    👤
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b47787]">
                                        Step 01
                                    </p>

                                    <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                                        Personal Details
                                    </h3>

                                    <p className="mt-1 text-sm text-[#8c7b80]">
                                        Tell Stylora a little about you.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">

                                <div className="rounded-[20px] border border-[#f0e3e6] bg-[#fffafa] p-4">
                                    <Input
                                        type="text"
                                        label="Full Name"
                                        placeholder="Enter your name"
                                        value={fullName}
                                        onChange={(event) =>
                                            setFullName(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="rounded-[20px] border border-[#f0e3e6] bg-[#fffafa] p-4">
                                    <Input
                                        type="number"
                                        label="Age"
                                        placeholder="Enter your age"
                                        value={age}
                                        onChange={(event) =>
                                            setAge(
                                                event.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="rounded-[20px] border border-[#f0e3e6] bg-[#fffafa] p-4">
                                    <SelectField
                                        label="Gender"
                                        value={gender}
                                        options={GENDER_OPTIONS}
                                        onChange={setGender}
                                    />
                                </div>

                                <div className="rounded-[20px] border border-[#f0e3e6] bg-[#fffafa] p-4">
                                    <SelectField
                                        label="Body Type"
                                        value={bodyType}
                                        options={BODY_TYPE_OPTIONS}
                                        onChange={setBodyType}
                                    />
                                </div>

                                <div className="rounded-[20px] border border-[#f0e3e6] bg-[#fffafa] p-4 sm:col-span-2">
                                    <SelectField
                                        label="Skin Tone"
                                        value={skinTone}
                                        options={SKIN_TONE_OPTIONS}
                                        onChange={setSkinTone}
                                    />
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* STYLE PREFERENCES */}
                    <section className="relative overflow-hidden rounded-[28px] border border-[#f0dfe3] bg-gradient-to-br from-[#fff8f9] via-white to-[#fdf8f5] p-6 sm:p-8">

                        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#f8d7da]/40 blur-3xl" />

                        <div className="relative">

                            {/* HEADER */}
                            <div className="mb-8 flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f0e5f5] text-xl">
                                    👗
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b47787]">
                                        Step 02
                                    </p>

                                    <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                                        Build Your Style DNA
                                    </h3>

                                    <p className="mt-1 text-sm text-[#8c7b80]">
                                        Choose the styles, colors and occasions that feel most like you.
                                    </p>
                                </div>
                            </div>

                            {/* PREFERRED STYLE */}
                            <div className="rounded-[22px] border border-[#f0e3e6] bg-white p-5 sm:p-6">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0e5f5]">
                                        🪄
                                    </span>

                                    <div>
                                        <p className="font-semibold text-[#111111]">
                                            Preferred Styles
                                        </p>
                                        <p className="text-xs text-[#9a898e]">
                                            Select the fashion styles you enjoy.
                                        </p>
                                    </div>
                                </div>

                                <MultiSelectSection
                                    label=""
                                    options={STYLE_OPTIONS}
                                    selected={preferredStyles}
                                    onToggle={(option) =>
                                        toggleValue(
                                            option,
                                            preferredStyles,
                                            setPreferredStyles
                                        )
                                    }
                                    selectedStyle={selectedStyle}
                                    normalStyle={normalStyle}
                                />
                            </div>

                            {/* COLORS */}
                            <div className="mt-4 grid gap-4 lg:grid-cols-2">

                                <div className="rounded-[22px] border border-[#f0e3e6] bg-white p-5 sm:p-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fde7eb]">
                                            🎨
                                        </span>

                                        <div>
                                            <p className="font-semibold text-[#111111]">
                                                Favorite Colors
                                            </p>
                                            <p className="text-xs text-[#9a898e]">
                                                Colors you love wearing.
                                            </p>
                                        </div>
                                    </div>

                                    <MultiSelectSection
                                        label=""
                                        options={COLOR_OPTIONS}
                                        selected={favoriteColors}
                                        onToggle={(option) =>
                                            toggleValue(
                                                option,
                                                favoriteColors,
                                                setFavoriteColors
                                            )
                                        }
                                        selectedStyle={selectedStyle}
                                        normalStyle={normalStyle}
                                    />
                                </div>

                                <div className="rounded-[22px] border border-[#f0e3e6] bg-white p-5 sm:p-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f9eadc]">
                                            🚫
                                        </span>

                                        <div>
                                            <p className="font-semibold text-[#111111]">
                                                Colors to Avoid
                                            </p>
                                            <p className="text-xs text-[#9a898e]">
                                                Colors Stylora should avoid.
                                            </p>
                                        </div>
                                    </div>

                                    <MultiSelectSection
                                        label=""
                                        options={COLOR_OPTIONS}
                                        selected={avoidColors}
                                        onToggle={(option) =>
                                            toggleValue(
                                                option,
                                                avoidColors,
                                                setAvoidColors
                                            )
                                        }
                                        selectedStyle={selectedStyle}
                                        normalStyle={normalStyle}
                                    />
                                </div>
                            </div>

                            {/* OCCASIONS */}
                            <div className="mt-4 rounded-[22px] border border-[#f0e3e6] bg-white p-5 sm:p-6">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5f1e9]">
                                        📅
                                    </span>

                                    <div>
                                        <p className="font-semibold text-[#111111]">
                                            Common Occasions
                                        </p>
                                        <p className="text-xs text-[#9a898e]">
                                            Where you usually need outfit ideas.
                                        </p>
                                    </div>
                                </div>

                                <MultiSelectSection
                                    label=""
                                    options={OCCASION_OPTIONS}
                                    selected={commonOccasions}
                                    onToggle={(option) =>
                                        toggleValue(
                                            option,
                                            commonOccasions,
                                            setCommonOccasions
                                        )
                                    }
                                    selectedStyle={selectedStyle}
                                    normalStyle={normalStyle}
                                />
                            </div>

                            {/* MODESTY */}
                            <div className="mt-4 rounded-[22px] border border-[#ecd8de] bg-[#fdf0f2] p-5 sm:p-6">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                                        🧣
                                    </span>

                                    <div>
                                        <p className="font-semibold text-[#111111]">
                                            Modesty & Coverage
                                        </p>
                                        <p className="text-xs text-[#9a7982]">
                                            Choose only the coverage preferences that matter to you.
                                        </p>
                                    </div>
                                </div>

                                <MultiSelectSection
                                    label=""
                                    options={MODESTY_OPTIONS}
                                    selected={modestyPreferences}
                                    onToggle={(option) =>
                                        toggleValue(
                                            option,
                                            modestyPreferences,
                                            setModestyPreferences
                                        )
                                    }
                                    selectedStyle={selectedStyle}
                                    normalStyle={normalStyle}
                                />
                            </div>

                        </div>
                    </section>

                    {/* STYLING PREFERENCES */}
                    <section className="relative overflow-hidden rounded-[28px] border border-[#f0dfe3] bg-white p-6 sm:p-8">

                        <div className="pointer-events-none absolute -bottom-20 -right-16 h-52 w-52 rounded-full bg-[#f8d7da]/35 blur-3xl" />

                        <div className="relative">

                            {/* HEADER */}
                            <div className="mb-7 flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e5f1e9] text-xl">
                                    ✨
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b47787]">
                                        Step 03
                                    </p>

                                    <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#111111]">
                                        Fine-Tune Your Style
                                    </h3>

                                    <p className="mt-1 text-sm text-[#8c7b80]">
                                        These details help Stylora make each outfit feel more personal.
                                    </p>
                                </div>
                            </div>

                            {/* OPTIONS */}
                            <div className="grid gap-4 sm:grid-cols-2">

                                <div className="rounded-[22px] border border-[#f0e3e6] bg-[#fffafa] p-5">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#fde7eb] text-lg">
                                        👕
                                    </div>

                                    <SelectField
                                        label="Preferred Fit"
                                        value={fitPreference}
                                        options={FIT_OPTIONS}
                                        onChange={setFitPreference}
                                    />

                                    <p className="mt-3 text-xs leading-5 text-[#a08e93]">
                                        How you usually prefer your clothes to fit.
                                    </p>
                                </div>

                                <div className="rounded-[22px] border border-[#f0e3e6] bg-[#fffafa] p-5">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f9eadc] text-lg">
                                        ☁️
                                    </div>

                                    <SelectField
                                        label="Comfort Priority"
                                        value={comfortPriority}
                                        options={COMFORT_OPTIONS}
                                        onChange={setComfortPriority}
                                    />

                                    <p className="mt-3 text-xs leading-5 text-[#a08e93]">
                                        How important comfort is when Stylora builds an outfit.
                                    </p>
                                </div>

                                <div className="rounded-[22px] border border-[#f0e3e6] bg-[#fffafa] p-5">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f0e5f5] text-lg">
                                        🎯
                                    </div>

                                    <SelectField
                                        label="Style Goal"
                                        value={styleGoal}
                                        options={STYLE_GOAL_OPTIONS}
                                        onChange={setStyleGoal}
                                    />

                                    <p className="mt-3 text-xs leading-5 text-[#a08e93]">
                                        The overall effect you want your outfits to create.
                                    </p>
                                </div>

                                <div className="rounded-[22px] border border-[#f0e3e6] bg-[#fffafa] p-5">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#e5f1e9] text-lg">
                                        👜
                                    </div>

                                    <SelectField
                                        label="Accessories Preference"
                                        value={accessoriesPreference}
                                        options={ACCESSORY_OPTIONS}
                                        onChange={setAccessoriesPreference}
                                    />

                                    <p className="mt-3 text-xs leading-5 text-[#a08e93]">
                                        How much accessories should influence your final look.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </section>

                    {/* SAVE AREA */}
                    <div className="rounded-[28px] border border-[#f0dfe3] bg-gradient-to-r from-[#111111] via-[#1b1718] to-[#33272b] p-5 sm:p-6">

                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Ready to update your Style DNA?
                                </p>

                                <p className="mt-1 text-xs leading-5 text-white/50">
                                    Stylora will use your latest preferences for future recommendations.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                size="large"
                                disabled={isSaving}
                                className="shrink-0"
                            >
                                {isSaving
                                    ? "SAVING..."
                                    : "SAVE CHANGES →"}
                            </Button>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ProfileSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="mb-6 rounded-[24px] border border-[#f1e4e8] bg-white p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-black">
                {title}
            </h3>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

function ProfileValue({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    return (
        <div className="rounded-xl bg-[#fffafa] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {label}
            </p>

            <p className="mt-2 text-sm font-medium text-black">
                {value || "Not set"}
            </p>
        </div>
    );
}

function ProfileList({
    label,
    values,
}: {
    label: string;
    values: string[];
}) {
    return (
        <div className="rounded-xl bg-[#fffafa] p-4 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {label}
            </p>

            {values.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {values.map(
                        (value) => (
                            <ProfileTag
                                key={value}
                                value={value}
                            />
                        )
                    )}
                </div>
            ) : (
                <p className="mt-2 text-sm text-gray-500">
                    Not set
                </p>
            )}
        </div>
    );
}

function ProfileTag({
    value,
}: {
    value: string;
}) {
    return (
        <span className="rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1.5 text-xs font-medium text-[#15803D]">
            {value}
        </span>
    );
}

function MessageBox({
    message,
    type,
}: {
    message: string;
    type: MessageType;
}) {
    return (
        <p
            className="mb-6 rounded-xl border px-4 py-3 text-sm"
            style={{
                backgroundColor:
                    type === "success"
                        ? "#F0FDF4"
                        : "#FEF2F2",
                borderColor:
                    type === "success"
                        ? "#86EFAC"
                        : "#FCA5A5",
                color:
                    type === "success"
                        ? "#15803D"
                        : "#DC2626",
            }}
            role="status"
        >
            {message}
        </p>
    );
}

function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (
        value: string
    ) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">
                {label}
            </label>

            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value
                    )
                }
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
            >
                <option value="">
                    Select {label.toLowerCase()}
                </option>

                {options.map(
                    (option) => (
                        <option
                            key={option}
                            value={option}
                        >
                            {formatValue(
                                option
                            )}
                        </option>
                    )
                )}
            </select>
        </div>
    );
}

function MultiSelectSection({
    label,
    options,
    selected,
    onToggle,
    selectedStyle,
    normalStyle,
}: {
    label: string;
    options: string[];
    selected: string[];
    onToggle: (
        option: string
    ) => void;
    selectedStyle: React.CSSProperties;
    normalStyle: React.CSSProperties;
}) {
    return (
        <div className="mt-7">
            <p className="mb-3 text-sm font-medium text-black">
                {label}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {options.map(
                    (option) => {
                        const selectedItem =
                            selected.includes(
                                option
                            );

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() =>
                                    onToggle(
                                        option
                                    )
                                }
                                className="rounded-xl border px-4 py-3 text-sm transition"
                                style={
                                    selectedItem
                                        ? selectedStyle
                                        : normalStyle
                                }
                            >
                                {option}
                            </button>
                        );
                    }
                )}
            </div>
        </div>
    );
}

function StyleIdentityRow({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value?: string | null;
}) {
    return (
        <div className="flex items-center gap-4 rounded-[18px] border border-[#efd9dd] bg-white/75 p-4 shadow-[0_8px_24px_rgba(113,72,82,0.05)]">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff4f5] text-xl">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a37d86]">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-[#111111]">
                    {value || "Not set"}
                </p>
            </div>
        </div>
    );
}


function StylePreferenceCard({
    icon,
    label,
    value,
    tone,
}: {
    icon: string;
    label: string;
    value?: string | null;
    tone: "pink" | "peach" | "lavender" | "sage";
}) {
    const tones = {
        pink: "bg-[#fde7eb]",
        peach: "bg-[#f9eadc]",
        lavender: "bg-[#f0e5f5]",
        sage: "bg-[#e5f1e9]",
    };

    return (
        <div className="rounded-[20px] border border-[#f0e3e6] bg-[#fffafa] p-5 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_14px_35px_rgba(73,45,53,0.07)]">
            <div
                className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${tones[tone]}`}
            >
                {icon}
            </div>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a68f95]">
                {label}
            </p>

            <p className="mt-1 text-base font-semibold text-[#111111]">
                {value || "Not set"}
            </p>
        </div>
    );
}


function ColorChip({
    color,
}: {
    color: string;
}) {
    const colorMap: Record<string, string> = {
        Black: "#111111",
        White: "#FFFFFF",
        Beige: "#DCCDB7",
        Brown: "#8B5E3C",
        Blue: "#7899C7",
        Green: "#7FA487",
        Pink: "#E7A4B5",
        Red: "#C96C6C",
        Purple: "#9B82B5",
        Yellow: "#E7C967",
        Orange: "#D99059",
        Grey: "#A7A7A7",
    };

    return (
        <div className="flex items-center gap-2 rounded-full border border-[#eadfe2] bg-white py-2 pl-2 pr-4 shadow-sm">
            <span
                className="h-7 w-7 rounded-full border border-black/10"
                style={{
                    backgroundColor:
                        colorMap[color] ||
                        "#E5E5E5",
                }}
            />

            <span className="text-xs font-medium text-[#5f5558]">
                {color}
            </span>
        </div>
    );
}

function formatValue(
    value: string
) {
    return value
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );
}