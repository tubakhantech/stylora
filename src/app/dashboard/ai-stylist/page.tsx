"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import { createClient } from "@/utils/supabase/client";

const OCCASIONS = [
    "Casual",
    "Office / College",
    "Party",
    "Date",
    "Wedding / Festive",
    "Travel",
    "Dinner",
    "Special Event",
];

const STYLES = [
    "Casual",
    "Elegant",
    "Minimal",
    "Classic",
    "Streetwear",
    "Glamorous",
    "Romantic",
    "Trendy",
];

const WEATHER_OPTIONS = [
    "Hot",
    "Warm",
    "Cool",
    "Cold",
    "Rainy",
];

interface ProfileData {
    full_name: string | null;
    age: number | null;
    gender: string | null;
    body_type: string | null;
    skin_tone: string | null;
    preferred_styles: string[] | null;
    favorite_colors: string[] | null;
    avoid_colors: string[] | null;
    common_occasions: string[] | null;
    modesty_preferences: string[] | null;
    fit_preference: string | null;
    comfort_priority: string | null;
    style_goal: string | null;
    accessories_preference: string | null;
    avatar_body_url: string | null;
}

interface WardrobeItem {
    id: string;
    name: string;
    category: string;
    color: string | null;
    brand: string | null;
    size: string | null;
    season: string | null;
    occasion: string | null;
    image_url: string | null;
    display_url?: string | null;
}

interface StylistSettings {
    ai_wardrobe_first: boolean;
    ai_allow_external_suggestions: boolean;
}

interface AIRecommendation {
    title: string;
    summary: string;
    selected_wardrobe_item_ids: string[];
    styling_tips: string[];
    color_notes: string;
    modesty_notes: string;
    weather_notes: string;
    external_suggestions: string[];
    why_it_works: string;
}

export default function AIStylistPage() {
    const [occasion, setOccasion] =
        useState("");

    const [style, setStyle] =
        useState("");

    const [weather, setWeather] =
        useState("");

    const [request, setRequest] =
        useState("");

    const [useWardrobe, setUseWardrobe] =
        useState(true);

    const [profile, setProfile] =
        useState<ProfileData | null>(null);

    const [avatarBodyDisplayUrl, setAvatarBodyDisplayUrl] =
        useState<string | null>(null);

    const [isGeneratingAvatar, setIsGeneratingAvatar] =
        useState(false);

    const [generatedAvatarUrl, setGeneratedAvatarUrl] =
        useState<string | null>(null);

    const [avatarError, setAvatarError] =
        useState("");

    const [wardrobe, setWardrobe] =
        useState<WardrobeItem[]>([]);

    const [stylistSettings, setStylistSettings] =
        useState<StylistSettings>({
            ai_wardrobe_first: true,
            ai_allow_external_suggestions: true,
        });

    const [isLoadingContext, setIsLoadingContext] =
        useState(true);

    const [message, setMessage] =
        useState("");

    const [messageType, setMessageType] =
        useState<
            "success" | "error" | null
        >(null);

    const [isGenerating, setIsGenerating] =
        useState(false);

    const [aiRecommendation, setAiRecommendation] =
        useState<AIRecommendation | null>(null);

    const [aiError, setAiError] =
        useState("");

    const [isSavingLook, setIsSavingLook] =
        useState(false);

    const [lookSaved, setLookSaved] =
        useState(false);

    useEffect(() => {
        const savedRecommendation =
            localStorage.getItem(
                "stylora-ai-recommendation"
            );

        const savedAvatar =
            localStorage.getItem(
                "stylora-generated-avatar"
            );

        if (savedRecommendation) {
            try {
                const parsedRecommendation =
                    JSON.parse(
                        savedRecommendation
                    );

                setAiRecommendation(
                    parsedRecommendation
                );
            } catch {
                localStorage.removeItem(
                    "stylora-ai-recommendation"
                );
            }
        }

        if (savedAvatar) {
            setGeneratedAvatarUrl(
                savedAvatar
            );
        }
    }, []);

    const showMessage = (
        type: "success" | "error",
        text: string
    ) => {
        setMessageType(type);
        setMessage(text);
    };

    /*
     * LOAD USER PROFILE
     * + WARDROBE
     * + AI SETTINGS
     */
    useEffect(() => {
        const loadStylistContext =
            async () => {
                setIsLoadingContext(true);

                const supabase =
                    createClient();

                const {
                    data: { user },
                } =
                    await supabase.auth.getUser();

                if (!user) {
                    showMessage(
                        "error",
                        "Your session has expired. Please log in again."
                    );

                    setIsLoadingContext(false);
                    return;
                }

                const [
                    profileResult,
                    wardrobeResult,
                    settingsResult,
                ] = await Promise.all([
                    supabase
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
                            avatar_body_url
                        `)
                        .eq("id", user.id)
                        .maybeSingle(),

                    supabase
                        .from("wardrobe_items")
                        .select(`
                            id,
                            name,
                            category,
                            color,
                            brand,
                            size,
                            season,
                            occasion,
                            image_url
                        `)
                        .eq(
                            "user_id",
                            user.id
                        )
                        .order(
                            "created_at",
                            {
                                ascending:
                                    false,
                            }
                        ),

                    supabase
                        .from("user_settings")
                        .select(`
                            ai_wardrobe_first,
                            ai_allow_external_suggestions
                        `)
                        .eq(
                            "user_id",
                            user.id
                        )
                        .maybeSingle(),
                ]);

                if (profileResult.error) {
                    showMessage(
                        "error",
                        profileResult.error.message
                    );

                    setIsLoadingContext(false);
                    return;
                }

                if (wardrobeResult.error) {
                    showMessage(
                        "error",
                        wardrobeResult.error.message
                    );

                    setIsLoadingContext(false);
                    return;
                }

                setProfile(
                    profileResult.data ??
                    null
                );

                if (profileResult.data?.avatar_body_url) {
                    const { data: avatarSignedData } =
                        await supabase.storage
                            .from("profile-images")
                            .createSignedUrl(
                                profileResult.data.avatar_body_url,
                                3600
                            );

                    setAvatarBodyDisplayUrl(
                        avatarSignedData?.signedUrl ?? null
                    );
                } else {
                    setAvatarBodyDisplayUrl(null);
                }

                const wardrobeWithImages = await Promise.all(
                    (wardrobeResult.data ?? []).map(async (item) => {
                        if (!item.image_url) {
                            return {
                                ...item,
                                display_url: null,
                            };
                        }

                        const { data: signedData } =
                            await supabase.storage
                                .from("wardrobe-images")
                                .createSignedUrl(
                                    item.image_url,
                                    3600
                                );

                        return {
                            ...item,
                            display_url:
                                signedData?.signedUrl ?? null,
                        };
                    })
                );

                setWardrobe(wardrobeWithImages);

                if (settingsResult.data) {
                    const loadedSettings = {
                        ai_wardrobe_first:
                            settingsResult
                                .data
                                .ai_wardrobe_first ??
                            true,

                        ai_allow_external_suggestions:
                            settingsResult
                                .data
                                .ai_allow_external_suggestions ??
                            true,
                    };

                    setStylistSettings(
                        loadedSettings
                    );

                    setUseWardrobe(
                        loadedSettings
                            .ai_wardrobe_first
                    );
                }

                setIsLoadingContext(false);
            };

        loadStylistContext();
    }, []);

    /*
     * FORM SUBMIT
     *
     * For now this verifies that all
     * information needed by the AI
     * is ready.
     */

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");
        setMessageType(null);
        setAiRecommendation(null);
        setAiError("");
        setLookSaved(false);

        if (!occasion) {
            showMessage(
                "error",
                "Please select an occasion."
            );
            return;
        }

        if (!profile) {
            showMessage(
                "error",
                "Your style profile could not be loaded."
            );
            return;
        }

        if (
            useWardrobe &&
            wardrobe.length === 0
        ) {
            showMessage(
                "error",
                "Your wardrobe is empty. Add some items first or turn off Use My Wardrobe."
            );
            return;
        }

        setIsGenerating(true);

        try {
            const response = await fetch(
                "/api/ai-stylist",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        request: {
                            occasion,
                            style:
                                style ||
                                "Stylora decides",
                            weather:
                                weather ||
                                "Not specified",
                            additional_request:
                                request,
                            use_wardrobe:
                                useWardrobe,
                        },

                        profile,

                        wardrobe:
                            useWardrobe
                                ? wardrobe
                                : [],

                        settings:
                            stylistSettings,
                    }),
                }
            );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.error ||
                    "Stylora could not generate your outfit."
                );
            }

            setAiRecommendation(
                result.recommendation
            );

            localStorage.setItem(
                "stylora-ai-recommendation",
                JSON.stringify(
                    result.recommendation
                )
            );

            showMessage(
                "success",
                "Your outfit recommendation is ready."
            );
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Something went wrong while creating your outfit.";

            setAiError(errorMessage);

            showMessage(
                "error",
                errorMessage
            );
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateAvatar = async () => {
        if (!aiRecommendation) {
            return;
        }

        if (!avatarBodyDisplayUrl) {
            setAvatarError(
                "Please upload a full-body avatar photo from your Profile first."
            );
            return;
        }

        const wardrobeImageUrls =
            selectedWardrobeItems
                .map((item) => item.display_url)
                .filter(
                    (url): url is string =>
                        Boolean(url)
                );

        if (wardrobeImageUrls.length === 0) {
            setAvatarError(
                "No wardrobe images are available for this outfit."
            );
            return;
        }

        setIsGeneratingAvatar(true);
        setAvatarError("");
        setGeneratedAvatarUrl(null);

        try {
            const response = await fetch(
                "/api/ai-stylist/avatar",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        avatarImageUrl:
                            avatarBodyDisplayUrl,

                        wardrobeImageUrls,

                        wardrobeItems: selectedWardrobeItems.map(
                            (item) => ({
                                name: item.name,
                                category: item.category,
                                color: item.color,
                            })
                        ),

                        recommendationTitle:
                            aiRecommendation.title,

                        recommendationSummary:
                            aiRecommendation.summary,

                        modestyNotes:
                            aiRecommendation.modesty_notes,
                    }),
                }
            );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.error ||
                    "Stylora could not create your avatar preview."
                );
            }

            const generatedImage =
                `data:image/png;base64,${result.image}`;

            const supabase = createClient();

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                throw new Error(
                    "Your session has expired. Please log in again."
                );
            }

            const imageResponse =
                await fetch(generatedImage);

            const imageBlob =
                await imageResponse.blob();

            const filePath =
                `${user.id}/current-${crypto.randomUUID()}.png`;

            const { error: uploadError } =
                await supabase.storage
                    .from("saved-look-images")
                    .upload(
                        filePath,
                        imageBlob,
                        {
                            contentType: "image/png",
                            upsert: false,
                        }
                    );

            if (uploadError) {
                throw new Error(
                    uploadError.message
                );
            }

            const { data: publicUrlData } =
                supabase.storage
                    .from("saved-look-images")
                    .getPublicUrl(filePath);

            const generatedImageUrl =
                publicUrlData.publicUrl;

            setGeneratedAvatarUrl(
                generatedImageUrl
            );

            localStorage.setItem(
                "stylora-generated-avatar",
                generatedImageUrl
            );
        } catch (error) {
            setAvatarError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while creating your avatar preview."
            );
        } finally {
            setIsGeneratingAvatar(false);
        }
    };

    const handleClearRecommendation = () => {
        setAiRecommendation(null);
        setGeneratedAvatarUrl(null);
        setAvatarError("");
        setAiError("");
        setMessage("");
        setMessageType(null);
        setLookSaved(false);

        setOccasion("");
        setStyle("");
        setWeather("");
        setRequest("");

        localStorage.removeItem(
            "stylora-ai-recommendation"
        );

        localStorage.removeItem(
            "stylora-generated-avatar"
        );
    };

    const uploadGeneratedAvatar = async (
        userId: string
    ): Promise<string | null> => {
        if (!generatedAvatarUrl) {
            return null;
        }

        const supabase = createClient();

        const response = await fetch(
            generatedAvatarUrl
        );

        const blob =
            await response.blob();

        const filePath =
            `${userId}/look-${crypto.randomUUID()}.png`;

        const { error: uploadError } =
            await supabase.storage
                .from("saved-look-images")
                .upload(
                    filePath,
                    blob,
                    {
                        contentType: "image/png",
                        upsert: false,
                    }
                );

        if (uploadError) {
            throw new Error(
                uploadError.message
            );
        }

        const {
            data: publicUrlData,
        } = supabase.storage
            .from("saved-look-images")
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    };

    const handleSaveLook = async () => {
        if (!aiRecommendation) {
            return;
        }

        setIsSavingLook(true);
        setLookSaved(false);

        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsSavingLook(false);

            showMessage(
                "error",
                "Your session has expired. Please log in again."
            );

            return;
        }

        const savedAvatarUrl =
            generatedAvatarUrl ?? null;


        const notes = [
            aiRecommendation.summary,
            "",
            "Styling Tips:",
            ...aiRecommendation.styling_tips.map(
                (tip) => `• ${tip}`
            ),
            "",
            `Color Notes: ${aiRecommendation.color_notes}`,
            `Weather: ${aiRecommendation.weather_notes}`,
            `Modesty: ${aiRecommendation.modesty_notes}`,
            `Why It Works: ${aiRecommendation.why_it_works}`,
        ].join("\n");

        const { error } = await supabase
            .from("saved_looks")
            .insert({
                user_id: user.id,
                title: aiRecommendation.title,
                occasion: occasion || null,
                notes,
                image_url: savedAvatarUrl,
                wardrobe_item_ids:
                    aiRecommendation.selected_wardrobe_item_ids,
                is_favorite: false,
            });

        setIsSavingLook(false);

        if (error) {
            showMessage(
                "error",
                error.message
            );

            return;
        }

        setLookSaved(true);

        showMessage(
            "success",
            "Look saved successfully."
        );
    };

    const selectedWardrobeItems =
        aiRecommendation
            ? wardrobe.filter((item) =>
                aiRecommendation.selected_wardrobe_item_ids.includes(
                    item.id
                )
            )
            : [];

    return (
        <div className="min-h-screen bg-[#fdf8f6] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1200px]">

                {/* HEADER */}

                {/* AI STYLIST HERO */}
                <section className="relative mb-7 overflow-hidden rounded-[30px] border border-[#eadfe1] bg-gradient-to-br from-[#f7e5e7] via-[#fcf5f3] to-[#f5dedf] px-6 py-8 sm:px-9 sm:py-10">

                    {/* DECOR */}
                    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-28 left-[35%] h-56 w-56 rounded-full bg-[#efcfd5]/45 blur-3xl" />

                    <div className="relative grid gap-8 md:grid-cols-[1fr_300px] md:items-center">

                        {/* LEFT */}
                        <div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-[#e6cfd4] bg-white/65 px-4 py-2">
                                <span className="text-[#a87582]">
                                    ✦
                                </span>

                                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9c6976]">
                                    Your Personal AI Stylist
                                </span>
                            </div>

                            <h1 className="mt-5 max-w-[650px] font-serif text-4xl leading-[1.02] tracking-[-0.045em] text-[#111111] sm:text-5xl lg:text-[58px]">
                                Your wardrobe.
                                <br />
                                <span className="italic text-[#a87582]">
                                    Styled intelligently.
                                </span>
                            </h1>

                            <p className="mt-5 max-w-[570px] text-sm leading-6 text-[#74666a] sm:text-[15px]">
                                Tell Stylora where you&apos;re going and how you want
                                to feel. Your AI stylist will create a personalized
                                look using your profile and the pieces you already own.
                            </p>

                            <div className="mt-6 flex flex-wrap gap-2">

                                <span className="rounded-full border border-[#e5d3d7] bg-white/70 px-4 py-2 text-[10px] font-medium text-[#725f64]">
                                    ✦ Personalized
                                </span>

                                <span className="rounded-full border border-[#e5d3d7] bg-white/70 px-4 py-2 text-[10px] font-medium text-[#725f64]">
                                    ♡ Wardrobe First
                                </span>

                                <span className="rounded-full border border-[#e5d3d7] bg-white/70 px-4 py-2 text-[10px] font-medium text-[#725f64]">
                                    ✧ Virtual Try-On
                                </span>

                            </div>

                        </div>


                        {/* RIGHT EDITORIAL CARD */}
                        <div className="hidden md:block">

                            <div className="relative overflow-hidden rounded-[26px] border border-white/70 bg-white/55 p-6 shadow-[0_18px_50px_rgba(100,64,73,0.08)] backdrop-blur-sm">

                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111111] text-lg text-white">
                                    ✦
                                </div>

                                <p className="mt-7 font-serif text-2xl leading-tight text-[#111111]">
                                    Dress for the
                                    <br />
                                    <span className="italic text-[#a87582]">
                                        moment.
                                    </span>
                                </p>

                                <p className="mt-3 text-xs leading-5 text-[#806e73]">
                                    Occasion, weather, personal style and your own
                                    wardrobe — brought together in one look.
                                </p>

                                <div className="mt-6 border-t border-[#e8dadd] pt-4">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#aa7b86]">
                                        Powered by Stylora AI
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>
                </section>


                {/* PREMIUM STYLING CONTEXT */}
                <section className="mb-7 overflow-hidden rounded-[26px] border border-[#eadfe1] bg-white/75 shadow-[0_12px_35px_rgba(91,58,67,0.05)]">

                    <div className="grid lg:grid-cols-[1fr_auto]">

                        {/* LEFT */}
                        <div className="px-5 py-5 sm:px-6">

                            <div className="flex items-start gap-4">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f8e5e8] text-lg text-[#a87582]">
                                    ✦
                                </div>

                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b47787]">
                                        Styling Intelligence
                                    </p>

                                    <h2 className="mt-1 font-serif text-xl text-[#111111]">
                                        Your Styling Context
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                        Stylora combines your profile, wardrobe and avatar
                                        to personalize every recommendation.
                                    </p>
                                </div>

                            </div>

                        </div>


                        {/* STATUS AREA */}
                        <div className="border-t border-[#eadfe1] bg-[#fcf7f6] px-5 py-5 lg:border-l lg:border-t-0 lg:px-6">

                            {isLoadingContext ? (
                                <div className="flex items-center gap-3">

                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#a87582]">
                                        ✦
                                    </span>

                                    <div>
                                        <p className="text-xs font-semibold text-[#5f5054]">
                                            Preparing your style...
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-[#9b898e]">
                                            Loading your personal context
                                        </p>
                                    </div>

                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">

                                    <StatusTag
                                        label={
                                            profile
                                                ? "Profile Ready"
                                                : "Profile Missing"
                                        }
                                        ready={Boolean(profile)}
                                    />

                                    <StatusTag
                                        label={`${wardrobe.length} Wardrobe ${wardrobe.length === 1
                                                ? "Item"
                                                : "Items"
                                            }`}
                                        ready={wardrobe.length > 0}
                                    />

                                    <StatusTag
                                        label={
                                            avatarBodyDisplayUrl
                                                ? "Avatar Ready"
                                                : "Avatar Missing"
                                        }
                                        ready={Boolean(
                                            avatarBodyDisplayUrl
                                        )}
                                    />

                                </div>
                            )}

                        </div>

                    </div>
                </section>

                {/* MESSAGE */}

                {message && (
                    <div
                        className="mb-6 rounded-xl border px-4 py-3 text-sm"
                        style={{
                            backgroundColor:
                                messageType ===
                                    "success"
                                    ? "#F0FDF4"
                                    : "#FEF2F2",

                            borderColor:
                                messageType ===
                                    "success"
                                    ? "#86EFAC"
                                    : "#FCA5A5",

                            color:
                                messageType ===
                                    "success"
                                    ? "#15803D"
                                    : "#DC2626",
                        }}
                        role="status"
                    >
                        {message}
                    </div>
                )}

                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="relative overflow-hidden rounded-[30px] border border-[#eadfe1] bg-gradient-to-br from-white via-[#fffafa] to-[#f9eeec] p-6 shadow-[0_16px_45px_rgba(91,58,67,0.05)] sm:p-8"
                >
                    {/* SOFT DECOR */}
                    <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#f5dce1]/45 blur-3xl" />

                    {/* FORM HEADER */}
                    <div className="relative mb-7 border-b border-[#eadde0] pb-6">

                        <div className="flex items-start gap-4">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111111] text-lg text-white">
                                ✦
                            </div>

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.26em] text-[#b47787]">
                                    Stylist Consultation
                                </p>

                                <h3 className="mt-1 font-serif text-3xl tracking-[-0.035em] text-[#111111]">
                                    What are you dressing for?
                                </h3>

                                <p className="mt-2 max-w-[560px] text-sm leading-6 text-[#806f73]">
                                    Give Stylora a little context. We&apos;ll combine it
                                    with your personal style and wardrobe to build your look.
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">

                        {/* OCCASION */}

                        <div>
                            
                            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#765f65]">
                                Occasion *
                            </label>

                            <select
                                value={
                                    occasion
                                }
                                onChange={(
                                    event
                                ) =>
                                    setOccasion(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="w-full cursor-pointer rounded-[16px] border border-[#e5d6da] bg-white/80 px-4 py-3.5 text-sm text-[#4f4548] outline-none transition focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                                required
                            >
                                <option value="">
                                    Select occasion
                                </option>

                                {OCCASIONS.map(
                                    (item) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* STYLE */}

                        <div>
                            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#765f65]">
                                Style / Vibe
                            </label>

                            <select
                                value={style}
                                onChange={(
                                    event
                                ) =>
                                    setStyle(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="w-full cursor-pointer rounded-[16px] border border-[#e5d6da] bg-white/80 px-4 py-3.5 text-sm text-[#4f4548] outline-none transition focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                            >
                                <option value="">
                                    Let Stylora decide
                                </option>

                                {STYLES.map(
                                    (item) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* WEATHER */}

                        <div>
                            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#765f65]">
                                Weather
                            </label>

                            <select
                                value={
                                    weather
                                }
                                onChange={(
                                    event
                                ) =>
                                    setWeather(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="w-full cursor-pointer rounded-[16px] border border-[#e5d6da] bg-white/80 px-4 py-3.5 text-sm text-[#4f4548] outline-none transition focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                            >
                                <option value="">
                                    Not specified
                                </option>

                                {WEATHER_OPTIONS.map(
                                    (item) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {
                                                item
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* OUTFIT SOURCE */}
                        <div>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#765f65]">
                                Outfit Source
                            </p>

                            <button
                                type="button"
                                disabled={
                                    isLoadingContext ||
                                    isGenerating
                                }
                                onClick={() =>
                                    setUseWardrobe(
                                        (current) => !current
                                    )
                                }
                                className={`group w-full rounded-[18px] border p-4 text-left transition ${useWardrobe
                                        ? "border-[#d7e2d3] bg-[#f0f6ed]"
                                        : "border-[#e5d6da] bg-white/80"
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-4">

                                    <div className="flex items-center gap-3">

                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base ${useWardrobe
                                                    ? "bg-white text-[#6f8867]"
                                                    : "bg-[#f8edef] text-[#a87582]"
                                                }`}
                                        >
                                            ♡
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-[#111111]">
                                                Use My Wardrobe
                                            </p>

                                            <p className="mt-0.5 text-[10px] text-[#8f7d82]">
                                                Style pieces you already own
                                            </p>
                                        </div>

                                    </div>

                                    {/* TOGGLE */}
                                    <div
                                        className={`relative h-7 w-12 shrink-0 rounded-full transition ${useWardrobe
                                                ? "bg-[#8da184]"
                                                : "bg-[#dfd5d7]"
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${useWardrobe
                                                    ? "left-6"
                                                    : "left-1"
                                                }`}
                                        />
                                    </div>

                                </div>
                            </button>

                            {useWardrobe && (
                                <p className="mt-2 pl-1 text-[10px] text-[#829079]">
                                    ✓ {wardrobe.length} wardrobe{" "}
                                    {wardrobe.length === 1
                                        ? "item is"
                                        : "items are"}{" "}
                                    ready for Stylora.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* PERSONAL REQUEST */}
                    <div className="mt-7 rounded-[22px] border border-[#eadde0] bg-white/65 p-5 sm:p-6">

                        <div className="mb-4 flex items-start justify-between gap-4">

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                    Personal Note To Your Stylist
                                </p>

                                <h4 className="mt-1 font-serif text-xl text-[#111111]">
                                    Anything else you want?
                                </h4>

                                <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                    Add any extra preference for this specific look.
                                </p>
                            </div>

                            <span className="hidden rounded-full bg-[#f8e8eb] px-3 py-1.5 text-[9px] font-semibold text-[#9b6e79] sm:block">
                                OPTIONAL
                            </span>

                        </div>

                        <textarea
                            value={request}
                            onChange={(event) =>
                                setRequest(
                                    event.target.value
                                )
                            }
                            placeholder="Example: Keep it modest, include my hijab, no bag, and make it comfortable for the evening..."
                            rows={4}
                            maxLength={500}
                            className="w-full resize-none rounded-[18px] border border-[#e5d6da] bg-[#fffafa] px-4 py-4 text-sm leading-6 text-[#111111] outline-none transition placeholder:text-[#b1a1a5] focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                        />

                        <div className="mt-2 flex items-center justify-between">

                            <p className="text-[10px] text-[#a18f94]">
                                Write naturally — keep it simple.
                            </p>

                            <p className="text-[10px] font-medium text-[#a18f94]">
                                {request.length}/500
                            </p>

                        </div>

                    </div>

                    {/* PROFILE CONTEXT */}

                    {/* PERSONAL STYLE CONTEXT */}

                    {!isLoadingContext && profile && (
                        <div className="mt-6 overflow-hidden rounded-[22px] border border-[#eadde0] bg-[#fcf7f6]">

                            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5dfe3] text-[#a87582]">
                                        ✦
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                            Your Style DNA
                                        </p>

                                        <h4 className="mt-1 font-serif text-xl text-[#111111]">
                                            Stylora already knows your style.
                                        </h4>

                                        <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                            These preferences will automatically guide your recommendation.
                                        </p>
                                    </div>

                                </div>

                                <span className="w-fit rounded-full border border-[#d9e5d5] bg-[#eef5eb] px-3 py-1.5 text-[9px] font-semibold text-[#657d5e]">
                                    ✓ PROFILE CONNECTED
                                </span>

                            </div>

                            <div className="border-t border-[#eadde0] bg-white/55 px-5 py-4 sm:px-6">

                                <div className="flex flex-wrap gap-2">

                                    {profile.body_type && (
                                        <ContextTag
                                            value={profile.body_type}
                                        />
                                    )}

                                    {profile.skin_tone && (
                                        <ContextTag
                                            value={`${formatValue(
                                                profile.skin_tone
                                            )} Skin Tone`}
                                        />
                                    )}

                                    {profile.preferred_styles?.map(
                                        (item) => (
                                            <ContextTag
                                                key={item}
                                                value={item}
                                            />
                                        )
                                    )}

                                    {profile.favorite_colors?.map(
                                        (item) => (
                                            <ContextTag
                                                key={`color-${item}`}
                                                value={item}
                                            />
                                        )
                                    )}

                                    {profile.modesty_preferences?.map(
                                        (item) => (
                                            <ContextTag
                                                key={`modesty-${item}`}
                                                value={item}
                                            />
                                        )
                                    )}

                                </div>

                            </div>

                        </div>
                    )}

                    {/* GENERATE */}

                    {/* GENERATE OUTFIT */}

                    <div className="mt-7 border-t border-[#eadde0] pt-6">

                        <button
                            type="submit"
                            disabled={
                                isLoadingContext ||
                                isGenerating
                            }
                            className="group flex w-full items-center justify-between rounded-full bg-[#111111] px-6 py-4 text-left text-white shadow-[0_12px_30px_rgba(17,17,17,0.12)] transition hover:bg-[#9f6674] disabled:cursor-not-allowed disabled:opacity-50 sm:px-7"
                        >

                            <div>
                                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/60">
                                    {isGenerating
                                        ? "Your stylist is working"
                                        : "Ready when you are"}
                                </p>

                                <p className="mt-1 text-sm font-semibold tracking-[0.04em]">
                                    {isLoadingContext
                                        ? "LOADING YOUR STYLE..."
                                        : isGenerating
                                            ? "✦ CREATING YOUR OUTFIT..."
                                            : "✦ GENERATE MY OUTFIT"}
                                </p>
                            </div>

                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg text-[#111111] transition group-hover:translate-x-1">
                                →
                            </span>

                        </button>

                        <p className="mt-3 text-center text-[10px] text-[#9c898e]">
                            Personalized using your Style DNA and selected preferences.
                        </p>

                    </div>
                </form>

                {/* AI RECOMMENDATION */}

                {aiRecommendation && (
                    <section className="mt-6 rounded-[24px] border border-[#f1e4e8] bg-white p-6 sm:p-8">

                        {/* PREMIUM VIRTUAL TRY-ON */}

                        <div className="mb-8 overflow-hidden rounded-[30px] border border-[#eadfe1] bg-gradient-to-br from-[#f8e8ea] via-[#fcf5f3] to-[#f4dddf]">

                            <div className="grid md:grid-cols-[minmax(320px,0.9fr)_1.1fr]">

                                {/* AVATAR VISUAL */}
                                <div className="relative min-h-[520px] overflow-hidden bg-[#f4e5e4]">

                                    {generatedAvatarUrl ? (
                                        <img
                                            src={generatedAvatarUrl}
                                            alt="Stylora AI outfit try-on"
                                            className="absolute inset-0 h-full w-full object-contain"
                                        />
                                    ) : avatarBodyDisplayUrl ? (
                                        <img
                                            src={avatarBodyDisplayUrl}
                                            alt="Your full-body Stylora avatar"
                                            className="absolute inset-0 h-full w-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex min-h-[520px] items-center justify-center px-8 text-center">

                                            <div>
                                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#e3cfd4] bg-white/70 text-4xl">
                                                    ♡
                                                </div>

                                                <p className="mt-5 font-serif text-2xl text-[#111111]">
                                                    Your avatar starts here.
                                                </p>

                                                <p className="mx-auto mt-2 max-w-[260px] text-xs leading-5 text-[#88767b]">
                                                    Upload a full-body photo from your Profile
                                                    to unlock Stylora Virtual Try-On.
                                                </p>
                                            </div>

                                        </div>
                                    )}

                                    {/* IMAGE BADGE */}
                                    <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/80 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#795f66] shadow-sm backdrop-blur-md">
                                        {generatedAvatarUrl
                                            ? "✦ AI Try-On Preview"
                                            : "Your Avatar"}
                                    </div>

                                    {generatedAvatarUrl && (
                                        <div className="absolute bottom-4 left-4 rounded-full bg-[#111111]/85 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                                            Styled by Stylora ✦
                                        </div>
                                    )}

                                </div>


                                {/* TRY-ON CONTENT */}
                                <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-10">

                                    <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/55 blur-3xl" />

                                    <div className="relative">

                                        <div className="inline-flex items-center gap-2 rounded-full border border-[#e4cdd2] bg-white/65 px-3.5 py-2">
                                            <span className="text-[#a87582]">
                                                ✦
                                            </span>

                                            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#986a75]">
                                                Stylora Virtual Try-On
                                            </span>
                                        </div>

                                        <h3 className="mt-5 max-w-[420px] font-serif text-3xl leading-[1.05] tracking-[-0.04em] text-[#111111] sm:text-4xl">
                                            See your new look
                                            <span className="italic text-[#a87582]">
                                                {" "}before you wear it.
                                            </span>
                                        </h3>

                                        <p className="mt-4 max-w-[440px] text-sm leading-6 text-[#78686c]">
                                            Stylora brings together your full-body photo and
                                            the wardrobe pieces selected for this recommendation
                                            to create a personalized fashion preview.
                                        </p>


                                        {/* READY STATE */}
                                        {generatedAvatarUrl ? (
                                            <div className="mt-6 rounded-[18px] border border-[#d8e4d4] bg-[#eef5eb] p-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#698062]">
                                                        ✓
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-semibold text-[#5f7658]">
                                                            Your try-on is ready
                                                        </p>

                                                        <p className="mt-0.5 text-[10px] text-[#81907c]">
                                                            Your generated look can now be saved.
                                                        </p>
                                                    </div>

                                                </div>

                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleGenerateAvatar}
                                                disabled={
                                                    isGeneratingAvatar ||
                                                    !avatarBodyDisplayUrl
                                                }
                                                className="group mt-7 flex w-fit items-center gap-4 rounded-full bg-[#111111] px-6 py-3.5 text-white transition hover:bg-[#9f6674] disabled:cursor-not-allowed disabled:opacity-45"
                                            >
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.1em]">
                                                    {isGeneratingAvatar
                                                        ? "✦ Creating Your Try-On..."
                                                        : "✦ Generate Try-On"}
                                                </span>

                                                {!isGeneratingAvatar && (
                                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm text-[#111111]">
                                                        →
                                                    </span>
                                                )}
                                            </button>
                                        )}


                                        {/* ERROR */}
                                        {avatarError && (
                                            <p className="mt-4 rounded-[16px] border border-[#edcdd3] bg-[#fff0f2] px-4 py-3 text-xs leading-5 text-[#a65e6c]">
                                                {avatarError}
                                            </p>
                                        )}


                                        {/* MISSING AVATAR */}
                                        {!avatarBodyDisplayUrl && (
                                            <div className="mt-5 border-t border-[#e3d2d6] pt-4">

                                                <p className="text-[10px] leading-5 text-[#927e83]">
                                                    <span className="font-semibold text-[#725f64]">
                                                        Avatar needed:
                                                    </span>{" "}
                                                    Go to Profile → Stylora Avatar and upload
                                                    your full-body photo first.
                                                </p>

                                            </div>
                                        )}

                                    </div>

                                </div>

                            </div>
                        </div>

                        {/* STYLORA PICK */}

                        <div className="relative overflow-hidden rounded-[24px] border border-[#eadde0] bg-gradient-to-r from-[#fcf6f4] via-white to-[#f8e8eb] p-6 sm:p-7">

                            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#f1d5da]/45 blur-3xl" />

                            <div className="relative">

                                <div className="flex flex-wrap items-center justify-between gap-3">

                                    <div className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-3.5 py-2 text-white">
                                        <span className="text-[#f8d7da]">
                                            ✦
                                        </span>

                                        <span className="text-[9px] font-semibold uppercase tracking-[0.2em]">
                                            Stylora Pick
                                        </span>
                                    </div>

                                    <p className="font-serif text-sm italic text-[#a87582]">
                                        Curated for you ♡
                                    </p>

                                </div>

                                <h3 className="mt-5 max-w-[720px] font-serif text-3xl leading-tight tracking-[-0.035em] text-[#111111] sm:text-4xl">
                                    {aiRecommendation.title}
                                </h3>

                                <p className="mt-3 max-w-[760px] text-sm leading-6 text-[#75666a]">
                                    {aiRecommendation.summary}
                                </p>

                            </div>

                        </div>

                        {/* SELECTED WARDROBE PIECES */}

                        {selectedWardrobeItems.length > 0 && (
                            <div className="mt-8">

                                {/* SECTION HEADER */}
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b47787]">
                                            From Your Closet
                                        </p>

                                        <h4 className="mt-1 font-serif text-2xl text-[#111111]">
                                            Your Outfit
                                        </h4>

                                        <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                            Pieces Stylora selected from your wardrobe for this look.
                                        </p>
                                    </div>

                                    <span className="w-fit rounded-full border border-[#e6d5d9] bg-[#fcf5f5] px-3.5 py-2 text-[9px] font-semibold text-[#8f6871]">
                                        {selectedWardrobeItems.length}{" "}
                                        {selectedWardrobeItems.length === 1
                                            ? "PIECE"
                                            : "PIECES"}
                                    </span>

                                </div>


                                {/* OUTFIT CARDS */}
                                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

                                    {selectedWardrobeItems.map(
                                        (item) => (
                                            <article
                                                key={item.id}
                                                className="group overflow-hidden rounded-[22px] border border-[#eadfe1] bg-[#fcf8f7] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(72,46,53,0.09)]"
                                            >

                                                {/* IMAGE */}
                                                <div className="relative aspect-[4/5] overflow-hidden bg-[#f6ecea]">

                                                    {item.display_url ? (
                                                        <img
                                                            src={item.display_url}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full flex-col items-center justify-center px-4 text-center">

                                                            <span className="text-3xl">
                                                                ♡
                                                            </span>

                                                            <p className="mt-2 text-[10px] text-[#9c888d]">
                                                                No clothing image
                                                            </p>

                                                        </div>
                                                    )}

                                                    <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/85 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#765f65] shadow-sm backdrop-blur-md">
                                                        {item.category}
                                                    </span>

                                                </div>


                                                {/* INFO */}
                                                <div className="p-4">

                                                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#b47787]">
                                                        Selected Piece
                                                    </p>

                                                    <h5 className="mt-1 font-serif text-lg leading-tight text-[#111111]">
                                                        {item.name}
                                                    </h5>

                                                    <div className="mt-3 flex flex-wrap gap-1.5">

                                                        {item.color && (
                                                            <span className="rounded-full border border-[#eadadd] bg-white px-2.5 py-1 text-[9px] text-[#705f64]">
                                                                {item.color}
                                                            </span>
                                                        )}

                                                        {item.brand && (
                                                            <span className="rounded-full border border-[#eadadd] bg-white px-2.5 py-1 text-[9px] text-[#705f64]">
                                                                {item.brand}
                                                            </span>
                                                        )}

                                                    </div>

                                                </div>

                                            </article>
                                        )
                                    )}

                                </div>

                            </div>
                        )}

                        {/* STYLIST NOTES */}

                        {aiRecommendation.styling_tips.length > 0 && (
                            <section className="mt-8 overflow-hidden rounded-[26px] border border-[#eadfe1] bg-gradient-to-br from-[#fcf7f5] via-white to-[#f8ebed]">

                                {/* HEADER */}
                                <div className="border-b border-[#eadde0] px-5 py-5 sm:px-6">

                                    <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b47787]">
                                        ✦ From Your Stylist
                                    </p>

                                    <h4 className="mt-1 font-serif text-2xl text-[#111111]">
                                        Styling Notes
                                    </h4>

                                    <p className="mt-1 text-xs text-[#8c7a7f]">
                                        Small details that bring your complete look together.
                                    </p>

                                </div>

                                {/* TIPS */}
                                <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">

                                    {aiRecommendation.styling_tips.map(
                                        (tip, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-3 rounded-[18px] border border-[#eadde0] bg-white/75 p-4"
                                            >
                                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f8e5e8] text-[10px] font-semibold text-[#a87582]">
                                                    {index + 1}
                                                </span>

                                                <p className="text-xs leading-5 text-[#6f6064]">
                                                    {tip}
                                                </p>
                                            </div>
                                        )
                                    )}

                                </div>

                            </section>
                        )}

                        {/* WHY THIS LOOK WORKS */}

                        <div className="mt-8">

                            <div className="mb-4">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b47787]">
                                    The Details
                                </p>

                                <h4 className="mt-1 font-serif text-2xl text-[#111111]">
                                    Why this look works.
                                </h4>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">

                                <RecommendationNote
                                    icon="🎨"
                                    title="Color Story"
                                    text={aiRecommendation.color_notes}
                                />

                                <RecommendationNote
                                    icon="⛅"
                                    title="Weather Edit"
                                    text={aiRecommendation.weather_notes}
                                />

                                <RecommendationNote
                                    icon="☺️"
                                    title="Modesty & Comfort"
                                    text={aiRecommendation.modesty_notes}
                                />

                                <RecommendationNote
                                    icon="⭐"
                                    title="Why It Works"
                                    text={aiRecommendation.why_it_works}
                                />

                            </div>

                        </div>

                        {/* OPTIONAL ADDITIONS */}

                        {aiRecommendation.external_suggestions.length > 0 && (
                            <section className="mt-8 overflow-hidden rounded-[24px] border border-[#eadfe1] bg-[#fcf8f7]">

                                <div className="flex items-start gap-4 p-5 sm:p-6">

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7e4e7] text-lg">
                                        ➕
                                    </div>

                                    <div className="flex-1">

                                        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                            Complete The Look
                                        </p>

                                        <h4 className="mt-1 font-serif text-xl text-[#111111]">
                                            Optional Additions
                                        </h4>

                                        <p className="mt-1 text-xs leading-5 text-[#8c7a7f]">
                                            You don&apos;t need these pieces, but they could add
                                            another finishing touch to your look.
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2">

                                            {aiRecommendation.external_suggestions.map(
                                                (suggestion, index) => (
                                                    <span
                                                        key={index}
                                                        className="rounded-full border border-[#e5d5d9] bg-white px-3.5 py-2 text-[10px] leading-4 text-[#705f64]"
                                                    >
                                                        + {suggestion}
                                                    </span>
                                                )
                                            )}

                                        </div>

                                    </div>

                                </div>

                            </section>
                        )}

                        {/* FINAL ACTIONS */}

                        <div className="mt-8 border-t border-[#eadde0] pt-7">

                            <div className="flex flex-col gap-4 rounded-[24px] bg-gradient-to-r from-[#f8e7ea] via-[#fcf5f3] to-[#f6e3e5] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                                {/* LEFT */}
                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#b47787]">
                                        Love This Look?
                                    </p>

                                    <h4 className="mt-1 font-serif text-xl text-[#111111]">
                                        Make it part of your style story.
                                    </h4>

                                    <p className="mt-1 text-xs text-[#8c7a7f]">
                                        Save this recommendation or start fresh with a new idea.
                                    </p>
                                </div>


                                {/* BUTTONS */}
                                <div className="flex flex-col gap-2 sm:flex-row">

                                    <button
                                        type="button"
                                        onClick={handleSaveLook}
                                        disabled={
                                            isSavingLook ||
                                            lookSaved
                                        }
                                        className={`rounded-full px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.09em] transition disabled:cursor-not-allowed ${lookSaved
                                                ? "border border-[#d5e2d1] bg-[#edf5ea] text-[#62785b]"
                                                : "bg-[#111111] text-white hover:bg-[#9f6674]"
                                            }`}
                                    >
                                        {isSavingLook
                                            ? "Saving Look..."
                                            : lookSaved
                                                ? "✓ Look Saved"
                                                : "♡ Save This Look"}
                                    </button>


                                    <button
                                        type="button"
                                        onClick={handleClearRecommendation}
                                        className="rounded-full border border-[#dfcbd0] bg-white/80 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#80656c] transition hover:border-[#c88e9b] hover:bg-white hover:text-[#111111]"
                                    >
                                        Start New
                                        <span className="ml-2">↻</span>
                                    </button>

                                </div>

                            </div>

                        </div>

                    </section>
                )}

                {aiError && (
                    <section className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-6">
                        <p className="text-sm text-red-700">
                            {aiError}
                        </p>
                    </section>
                )}
            </div>
        </div>
    );
}

function StatusTag({
    label,
    ready,
}: {
    label: string;
    ready: boolean;
}) {
    return (
        <span
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${ready
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
                }`}
        >
            {ready ? "✓ " : "• "}
            {label}
        </span>
    );
}

function ContextTag({
    value,
}: {
    value: string;
}) {
    return (
        <span className="rounded-full border border-[#e6d6da] bg-white px-3.5 py-2 text-[10px] font-medium text-[#725f64] shadow-[0_4px_12px_rgba(91,58,67,0.03)]">
            {value}
        </span>
    );
}

function RecommendationNote({
    icon,
    title,
    text,
}: {
    icon: string;
    title: string;
    text: string;
}) {
    if (!text) {
        return null;
    }

    return (
        <div className="group rounded-[22px] border border-[#eadfe1] bg-[#fcf8f7] p-5 transition hover:bg-white hover:shadow-[0_12px_30px_rgba(91,58,67,0.06)]">

            <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f7e4e7] text-base">
                    {icon}
                </div>

                <div>
                    <p className="font-serif text-lg text-[#111111]">
                        {title}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#75666a]">
                        {text}
                    </p>
                </div>

            </div>

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