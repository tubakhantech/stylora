
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface SavedLook {
    id: string;
    title: string;
    occasion: string | null;
    notes: string | null;
    image_url: string | null;
    wardrobe_item_ids: string[] | null;
    is_favorite: boolean;
    created_at: string;
}

interface WardrobeItem {
    id: string;
    name: string;
    category: string;
    color: string | null;
    brand: string | null;
    image_url: string | null;
    display_url?: string | null;
}

function isSafeImageUrl(value: string | null): boolean {
    if (!value) return false;

    try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
    } catch {
        return false;
    }
}

export default function SavedLookDetailPage() {
    const params = useParams();
    const router = useRouter();

    const lookId =
        typeof params.id === "string" ? params.id : "";

    const [look, setLook] = useState<SavedLook | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editOccasion, setEditOccasion] = useState("");
    const [editNotes, setEditNotes] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<
        "success" | "error" | null
    >(null);

    const showMessage = (
        type: "success" | "error",
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

    const loadLook = async () => {
        if (!lookId) {
            setIsLoading(false);
            return;
        }

        try {
            const supabase = createClient();

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("saved_looks")
                .select(`
                    id,
                    title,
                    occasion,
                    notes,
                    image_url,
                    wardrobe_item_ids,
                    is_favorite,
                    created_at
                `)
                .eq("id", lookId)
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) {
                showMessage("error", error.message);
                setIsLoading(false);
                return;
            }

            setLook(data ?? null);

            if (data) {
                setEditTitle(data.title ?? "");
                setEditOccasion(data.occasion ?? "");
                setEditNotes(data.notes ?? "");
            }

            if (
                data?.wardrobe_item_ids &&
                data.wardrobe_item_ids.length > 0
            ) {
                const { data: itemData, error: itemError } =
                    await supabase
                        .from("wardrobe_items")
                        .select(`
                            id,
                            name,
                            category,
                            color,
                            brand,
                            image_url
                        `)
                        .eq("user_id", user.id)
                        .in("id", data.wardrobe_item_ids);

                if (itemError) {
                    showMessage("error", itemError.message);
                } else if (itemData) {
                    const itemsWithImages = await Promise.all(
                        itemData.map(async (item) => {
                            if (!item.image_url) {
                                return {
                                    ...item,
                                    display_url: null,
                                };
                            }

                            const { data: signedData } =
                                await supabase.storage
                                    .from("wardrobe-images")
                                    .createSignedUrl(item.image_url, 3600);

                            return {
                                ...item,
                                display_url: signedData?.signedUrl ?? null,
                            };
                        })
                    );

                    setWardrobeItems(itemsWithImages);
                }
            } else {
                setWardrobeItems([]);
            }
        } catch (error) {
            console.error("Error loading saved look:", error);

            showMessage(
                "error",
                "Unable to load this saved look. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLook();
    }, [lookId]);

    const handleFavorite = async () => {
        if (!look) return;

        const supabase = createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            showMessage("error", "Please log in to update favorites.");
            return;
        }

        const newValue = !look.is_favorite;

        setLook({
            ...look,
            is_favorite: newValue,
        });

        const { error } = await supabase
            .from("saved_looks")
            .update({
                is_favorite: newValue,
                updated_at: new Date().toISOString(),
            })
            .eq("id", look.id)
            .eq("user_id", user.id);

        if (error) {
            setLook({
                ...look,
                is_favorite: look.is_favorite,
            });

            showMessage("error", error.message);
        }
    };

    const handleSaveEdit = async () => {
        if (!look || isSavingEdit) return;

        const trimmedTitle = editTitle.trim();
        const trimmedOccasion = editOccasion.trim();
        const trimmedNotes = editNotes.trim();

        if (!trimmedTitle) {
            showMessage("error", "Please enter a look title.");
            return;
        }

        if (trimmedTitle.length > 80) {
            showMessage("error", "Look title must be 80 characters or less.");
            return;
        }

        if (trimmedOccasion.length > 60) {
            showMessage("error", "Occasion must be 60 characters or less.");
            return;
        }

        if (trimmedNotes.length > 500) {
            showMessage("error", "Notes must be 500 characters or less.");
            return;
        }

        setIsSavingEdit(true);

        try {
            const supabase = createClient();

            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                showMessage("error", "Please log in to edit this look.");
                return;
            }

            const { error } = await supabase
                .from("saved_looks")
                .update({
                    title: trimmedTitle,
                    occasion: trimmedOccasion || null,
                    notes: trimmedNotes || null,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", look.id)
                .eq("user_id", user.id);

            if (error) {
                showMessage("error", error.message);
                return;
            }

            setLook({
                ...look,
                title: trimmedTitle,
                occasion: trimmedOccasion || null,
                notes: trimmedNotes || null,
            });

            setIsEditing(false);
            showMessage("success", "Look updated successfully.");
        } catch (error) {
            console.error("Error updating saved look:", error);
            showMessage("error", "Unable to update this look. Please try again.");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleDelete = async () => {
        if (!look) return;

        const confirmed = window.confirm(
            `Remove "${look.title}" from your saved looks?`
        );

        if (!confirmed) return;

        const supabase = createClient();

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            showMessage("error", "Please log in to delete this look.");
            return;
        }

        const { error } = await supabase
            .from("saved_looks")
            .delete()
            .eq("id", look.id)
            .eq("user_id", user.id);

        if (error) {
            showMessage("error", error.message);
            return;
        }

        router.push("/dashboard/save-looks");
        router.refresh();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fdf8f6] p-4 sm:p-6 lg:p-8 dark:bg-[#121112]">
                <div className="mx-auto max-w-[1100px]">
                    <div className="rounded-[28px] border border-[#eadfe1] bg-white/70 px-6 py-20 text-center dark:border-[#3b3437] dark:bg-[#1b191b]">
                        <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-[#f8e5e8] font-serif text-xl text-[#a87582] dark:bg-[#38272d] dark:text-[#d09baa]">
                            ✦
                        </div>

                        <p className="mt-5 font-serif text-xl text-[#111111] dark:text-[#f7f2f3]">
                            Opening your saved look...
                        </p>

                        <p className="mt-2 text-xs text-[#958388] dark:text-[#b8aaae]">
                            Gathering your outfit and wardrobe pieces.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!look) {
        return (
            <div className="min-h-screen bg-[#fdf8f6] p-4 sm:p-6 lg:p-8 dark:bg-[#121112]">
                <div className="mx-auto max-w-[1100px]">
                    <div className="rounded-[28px] border border-[#eadfe1] bg-gradient-to-br from-white via-[#fdf8f6] to-[#f8e7e9] px-6 py-20 text-center dark:border-[#3b3437] dark:from-[#1b191b] dark:via-[#211c1f] dark:to-[#302328]">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#ead5da] bg-white text-2xl text-[#a87582] shadow-sm dark:border-[#594047] dark:bg-[#292327] dark:text-[#d09baa]">
                            ♡
                        </div>

                        <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b47787] dark:text-[#c18b9a]">
                            Saved Looks
                        </p>

                        <h2 className="mt-2 font-serif text-3xl text-[#111111] dark:text-[#f7f2f3]">
                            This look isn&apos;t here.
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-[#817176] dark:text-[#b8aaae]">
                            This saved look may have been removed or is no longer available.
                        </p>

                        <Link
                            href="/dashboard/save-looks"
                            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9f6674] dark:bg-[#d09baa] dark:text-[#21191c] dark:hover:bg-[#e0b3bf]"
                        >
                            ← Back to Saved Looks
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdf8f6] p-4 sm:p-6 lg:p-8 dark:bg-[#121112]">
            <div className="mx-auto max-w-[1100px]">

                <Link
                    href="/dashboard/save-looks"
                    className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e5d3d7] bg-white/70 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#806b71] transition hover:bg-white hover:text-[#111111] dark:border-[#3b3437] dark:bg-[#1b191b] dark:text-[#d0bdc3] dark:hover:bg-[#292327] dark:hover:text-[#f7f2f3]"
                >
                    <span>←</span>
                    Saved Looks
                </Link>

                {message && (
                    <div
                        role="status"
                        className={`mb-6 flex items-center gap-3 rounded-[18px] border px-5 py-4 ${messageType === "success"
                                ? "border-[#d8e5d4] bg-[#eef5eb] text-[#657d5e] dark:border-[#425b42] dark:bg-[#202d22] dark:text-[#b5d0ac]"
                                : "border-[#edcdd3] bg-[#fff0f2] text-[#a65e6c] dark:border-[#68404a] dark:bg-[#352328] dark:text-[#e6aab6]"
                            }`}
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-sm dark:bg-[#30292c]">
                            {messageType === "success" ? "✓" : "!"}
                        </div>

                        <p className="text-xs font-medium leading-5">
                            {message}
                        </p>
                    </div>
                )}

                <section className="overflow-hidden rounded-[30px] border border-[#eadfe1] bg-white shadow-[0_16px_45px_rgba(91,58,67,0.05)] dark:border-[#3b3437] dark:bg-[#1b191b] dark:shadow-none">

                    {/* MAIN LOOK IMAGE */}
                    <div className="relative flex min-h-[620px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8e9e9] via-[#fcf5f3] to-[#f3dfe2] p-5 sm:p-8 dark:from-[#302328] dark:via-[#241e21] dark:to-[#35262c]">
                        {isSafeImageUrl(look.image_url) ? (
                            <img
                                src={look.image_url!}
                                alt={look.title}
                                className="max-h-[720px] w-full object-contain drop-shadow-[0_18px_28px_rgba(70,45,52,0.10)]"
                            />
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center text-center">
                                <span className="text-5xl">✨</span>
                                <p className="mt-3 text-sm text-gray-400 dark:text-[#b8aaae]">
                                    Saved look preview
                                </p>
                            </div>
                        )}

                        <div className="absolute left-5 top-5">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3.5 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8d6b73] backdrop-blur-sm">
                                ✦ Saved Stylora Look
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleFavorite}
                            className={`absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border text-xl shadow-[0_6px_20px_rgba(91,58,67,0.10)] backdrop-blur-sm transition hover:scale-105 ${look.is_favorite
                                    ? "border-[#e5c8ce] bg-[#f8e1e5] text-[#a45f6e] dark:border-[#80515e] dark:bg-[#4a2e37] dark:text-[#f0b8c5]"
                                    : "border-white/70 bg-white/85 text-[#806b71] dark:border-[#65515a] dark:bg-[#292327]/90 dark:text-[#e2c4cd]"
                                }`}
                            aria-label={
                                look.is_favorite
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                            }
                        >
                            {look.is_favorite ? "♥" : "♡"}
                        </button>
                    </div>

                    {/* LOOK CONTENT */}
                    <div className="p-6 sm:p-8">

                        {isEditing ? (
                            <div className="rounded-[24px] border border-[#eadfe1] bg-gradient-to-br from-[#fcf8f7] to-[#f9eeee] p-5 sm:p-6 dark:border-[#3b3437] dark:from-[#242124] dark:to-[#302328]">

                                <div className="mb-5">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b47787] dark:text-[#c18b9a]">
                                        Edit Your Look
                                    </p>

                                    <h2 className="mt-1 font-serif text-2xl text-[#111111] dark:text-[#f7f2f3]">
                                        Make it feel more you.
                                    </h2>

                                    <p className="mt-1 text-xs text-[#8c7a7f] dark:text-[#b8aaae]">
                                        Update the name, occasion or notes for this saved look.
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">

                                    <div>
                                        <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#806b71] dark:text-[#d0bdc3]">
                                            Look Title
                                        </label>

                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(event) =>
                                                setEditTitle(event.target.value)
                                            }
                                            placeholder="Give this look a name"
                                            className="w-full rounded-[16px] border border-[#e5d6da] bg-white px-4 py-3.5 text-sm text-[#4f4548] outline-none transition placeholder:text-[#b3a2a7] focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3] dark:border-[#4a3d42] dark:bg-[#191719] dark:text-[#f7f2f3] dark:placeholder:text-[#887980] dark:focus:border-[#c18b9a] dark:focus:ring-[#493139]"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-[#806b71] dark:text-[#d0bdc3]">
                                            Occasion
                                        </label>

                                        <input
                                            type="text"
                                            value={editOccasion}
                                            onChange={(event) =>
                                                setEditOccasion(event.target.value)
                                            }
                                            placeholder="e.g. Party, Dinner, College"
                                            className="w-full rounded-[16px] border border-[#e5d6da] bg-white px-4 py-3.5 text-sm text-[#4f4548] outline-none transition placeholder:text-[#b3a2a7] focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3] dark:border-[#4a3d42] dark:bg-[#191719] dark:text-[#f7f2f3] dark:placeholder:text-[#887980] dark:focus:border-[#c18b9a] dark:focus:ring-[#493139]"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b47787] dark:text-[#c18b9a]">
                                        Your Saved Style
                                    </p>

                                    <h1 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.03em] text-[#111111] sm:text-4xl dark:text-[#f7f2f3]">
                                        {look.title}
                                    </h1>

                                    {look.occasion && (
                                        <div className="mt-4">
                                            <span className="inline-flex items-center gap-2 rounded-full border border-[#ead5da] bg-[#f9e9ec] px-4 py-2 text-[10px] font-medium text-[#956875] dark:border-[#594047] dark:bg-[#34272d] dark:text-[#e0b3bf]">
                                                ✦ {look.occasion}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* LOOK DETAILS */}
                        <div className="mt-7 grid gap-3 sm:grid-cols-2">

                            <div className="flex items-center gap-4 rounded-[20px] border border-[#eadfe1] bg-[#fcf8f7] p-4 dark:border-[#3b3437] dark:bg-[#242124]">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7e4e7] text-lg dark:bg-[#3a2c32]">
                                    🩷
                                </div>

                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a88a91] dark:text-[#c18b9a]">
                                        Wardrobe Pieces
                                    </p>

                                    <p className="mt-1 font-serif text-lg text-[#111111] dark:text-[#f7f2f3]">
                                        {look.wardrobe_item_ids?.length ?? 0}{" "}
                                        {(look.wardrobe_item_ids?.length ?? 0) === 1
                                            ? "piece used"
                                            : "pieces used"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-[20px] border border-[#eadfe1] bg-[#fcf8f7] p-4 dark:border-[#3b3437] dark:bg-[#242124]">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f7e4e7] text-lg dark:bg-[#3a2c32]">
                                    🕒
                                </div>

                                <div>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a88a91] dark:text-[#c18b9a]">
                                        Saved On
                                    </p>

                                    <p className="mt-1 font-serif text-lg text-[#111111] dark:text-[#f7f2f3]">
                                        {new Date(look.created_at).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            }
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* LOOK NOTES */}
                        {isEditing ? (
                            <div className="mt-7 rounded-[22px] border border-[#eadfe1] bg-[#fcf8f7] p-5 dark:border-[#3b3437] dark:bg-[#242124]">
                                <div className="mb-3">
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b47787] dark:text-[#c18b9a]">
                                        Personal Notes
                                    </p>

                                    <p className="mt-1 font-serif text-lg text-[#111111] dark:text-[#f7f2f3]">
                                        Notes about this look
                                    </p>
                                </div>

                                <textarea
                                    value={editNotes}
                                    onChange={(event) =>
                                        setEditNotes(event.target.value)
                                    }
                                    rows={4}
                                    placeholder="Add notes about this look..."
                                    className="w-full resize-none rounded-[16px] border border-[#e5d6da] bg-white px-4 py-3.5 text-sm leading-6 text-[#4f4548] outline-none transition placeholder:text-[#b3a2a7] focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3] dark:border-[#4a3d42] dark:bg-[#191719] dark:text-[#f7f2f3] dark:placeholder:text-[#887980] dark:focus:border-[#c18b9a] dark:focus:ring-[#493139]"
                                />
                            </div>
                        ) : (
                            look.notes && (
                                <section className="mt-7 rounded-[22px] border border-[#eadfe1] bg-gradient-to-br from-[#fcf8f7] to-[#f9eeee] p-5 dark:border-[#3b3437] dark:from-[#242124] dark:to-[#302328]">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#a87582] shadow-sm dark:bg-[#3a2c32] dark:text-[#d09baa]">
                                            ✎
                                        </div>

                                        <div>
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b47787] dark:text-[#c18b9a]">
                                                Personal Notes
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-[#6f6064] dark:text-[#c0b3b7]">
                                                {look.notes}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            )
                        )}

                        {/* WARDROBE PIECES */}
                        {wardrobeItems.length > 0 && (
                            <section className="mt-9">

                                <div className="mb-5 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b47787] dark:text-[#c18b9a]">
                                            From Your Closet
                                        </p>

                                        <h2 className="mt-1 font-serif text-2xl text-[#111111] dark:text-[#f7f2f3]">
                                            Pieces in this Look
                                        </h2>

                                        <p className="mt-1 text-xs text-[#8c7a7f] dark:text-[#b8aaae]">
                                            Wardrobe pieces selected to create this outfit.
                                        </p>
                                    </div>

                                    <span className="shrink-0 rounded-full border border-[#e5d5d9] bg-[#fcf5f4] px-3.5 py-2 text-[9px] font-semibold text-[#80656c] dark:border-[#594047] dark:bg-[#34272d] dark:text-[#e0b3bf]">
                                        {wardrobeItems.length}{" "}
                                        {wardrobeItems.length === 1
                                            ? "PIECE"
                                            : "PIECES"}
                                    </span>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {wardrobeItems.map((item) => (
                                        <article
                                            key={item.id}
                                            className="group overflow-hidden rounded-[22px] border border-[#eadfe1] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(91,58,67,0.08)] dark:border-[#3b3437] dark:bg-[#1b191b] dark:hover:shadow-none"
                                        >
                                            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br from-[#fbf3f2] to-[#f7e7e9] p-3 dark:from-[#302328] dark:to-[#211c1f]">
                                                {item.display_url ? (
                                                    <img
                                                        src={item.display_url}
                                                        alt={item.name}
                                                        className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center text-center">
                                                        <span className="text-2xl">
                                                            ♡
                                                        </span>

                                                        <p className="mt-2 text-[10px] text-[#9d898e] dark:text-[#b8aaae]">
                                                            No clothing image
                                                        </p>
                                                    </div>
                                                )}

                                                <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#80656c] backdrop-blur-sm">
                                                    {item.category}
                                                </span>
                                            </div>

                                            <div className="p-4">
                                                <h3 className="font-serif text-lg leading-tight text-[#111111] dark:text-[#f7f2f3]">
                                                    {item.name}
                                                </h3>

                                                {(item.color || item.brand) && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {item.color && (
                                                            <span className="rounded-full bg-[#f9eeee] px-3 py-1.5 text-[9px] text-[#80656c] dark:bg-[#34272d] dark:text-[#d5b5bf]">
                                                                {item.color}
                                                            </span>
                                                        )}

                                                        {item.brand && (
                                                            <span className="rounded-full border border-[#eadfe1] bg-white px-3 py-1.5 text-[9px] text-[#80656c] dark:border-[#4a3d42] dark:bg-[#242124] dark:text-[#d0bdc3]">
                                                                {item.brand}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* LOOK ACTIONS */}
                        <div className="mt-9 border-t border-[#eadde0] pt-7 dark:border-[#3b3437]">

                            {isEditing ? (
                                <div className="flex flex-col gap-3 rounded-[22px] bg-[#fcf8f7] p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-[#242124]">
                                    <div>
                                        <p className="font-serif text-lg text-[#111111] dark:text-[#f7f2f3]">
                                            Ready to save your changes?
                                        </p>

                                        <p className="mt-1 text-[10px] text-[#958388] dark:text-[#b8aaae]">
                                            Your updated look details will be saved to your collection.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditTitle(look.title);
                                                setEditOccasion(look.occasion ?? "");
                                                setEditNotes(look.notes ?? "");
                                                setIsEditing(false);
                                            }}
                                            className="rounded-full border border-[#dfcbd0] bg-white px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#80656c] transition hover:bg-[#f9e8eb] dark:border-[#59474e] dark:bg-[#292327] dark:text-[#ead8de] dark:hover:bg-[#3a2c32]"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            disabled={isSavingEdit}
                                            onClick={handleSaveEdit}
                                            className="rounded-full bg-[#111111] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9f6674] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#d09baa] dark:text-[#21191c] dark:hover:bg-[#e0b3bf]"
                                        >
                                            {isSavingEdit ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 rounded-[22px] bg-gradient-to-r from-[#f9e9eb] via-[#fcf6f4] to-[#f7e5e7] p-5 sm:flex-row sm:items-center sm:justify-between dark:from-[#302328] dark:via-[#241e21] dark:to-[#35262c]">
                                    <div>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b47787] dark:text-[#c18b9a]">
                                            Your Look
                                        </p>

                                        <p className="mt-1 font-serif text-lg text-[#111111] dark:text-[#f7f2f3]">
                                            Want to make a change?
                                        </p>

                                        <p className="mt-1 text-[10px] text-[#958388] dark:text-[#b8aaae]">
                                            Edit this look or remove it from your collection.
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="rounded-full border border-[#dfcbd0] bg-white/80 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#a26d78] transition hover:border-[#d9aeb7] hover:bg-white hover:text-[#9f4f60] dark:border-[#59474e] dark:bg-[#292327] dark:text-[#d5a0ad] dark:hover:border-[#80515e] dark:hover:bg-[#3a2c32] dark:hover:text-[#f0a6b4]"
                                        >
                                            Remove Look
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="rounded-full bg-[#111111] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9f6674] dark:bg-[#d09baa] dark:text-[#21191c] dark:hover:bg-[#e0b3bf]"
                                        >
                                            Edit Look
                                            <span className="ml-2">✎</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
