"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function SaveLooksPage() {
    const searchParams = useSearchParams();

    const showFavoritesOnly =
        searchParams.get("favorites") === "true";

    const [looks, setLooks] = useState<SavedLook[]>([]);
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

    const loadLooks = async () => {
        setIsLoading(true);

        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsLoading(false);
            return;
        }

        let query = supabase
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
            .eq("user_id", user.id);

        if (showFavoritesOnly) {
            query = query.eq(
                "is_favorite",
                true
            );
        }

        const { data, error } =
            await query.order("created_at", {
                ascending: false,
            });

        if (error) {
            showMessage(
                "error",
                error.message
            );

            setIsLoading(false);
            return;
        }

        setLooks(data ?? []);
        setIsLoading(false);
    };

    useEffect(() => {
        loadLooks();
    }, [showFavoritesOnly]);

    const handleFavorite = async (
        look: SavedLook
    ) => {
        const supabase = createClient();

        const newFavoriteValue =
            !look.is_favorite;

        // UI ko turant update karo
        setLooks((current) =>
            current.map((item) =>
                item.id === look.id
                    ? {
                        ...item,
                        is_favorite:
                            newFavoriteValue,
                    }
                    : item
            )
        );

        const { error } = await supabase
            .from("saved_looks")
            .update({
                is_favorite:
                    newFavoriteValue,
                updated_at:
                    new Date().toISOString(),
            })
            .eq("id", look.id);

        if (error) {
            // Error ho to previous state wapas
            setLooks((current) =>
                current.map((item) =>
                    item.id === look.id
                        ? {
                            ...item,
                            is_favorite:
                                look.is_favorite,
                        }
                        : item
                )
            );

            showMessage(
                "error",
                error.message
            );
        }
    };

    const handleDelete = async (
        look: SavedLook
    ) => {
        const confirmed =
            window.confirm(
                `Remove "${look.title}" from your saved looks?`
            );

        if (!confirmed) {
            return;
        }

        const supabase = createClient();

        const { error } = await supabase
            .from("saved_looks")
            .delete()
            .eq("id", look.id);

        if (error) {
            showMessage(
                "error",
                error.message
            );
            return;
        }

        // Page refresh ki zarurat nahi
        setLooks((current) =>
            current.filter(
                (item) =>
                    item.id !== look.id
            )
        );

        showMessage(
            "success",
            "Look removed successfully."
        );
    };

    return (
        <div className="min-h-screen bg-[#fdf8f6] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1200px]">

                {/* SAVED LOOKS HERO */}

                <section className="relative mb-7 overflow-hidden rounded-[30px] border border-[#eadfe1] bg-gradient-to-br from-[#f7e5e7] via-[#fcf5f3] to-[#f5dedf] px-6 py-8 sm:px-9 sm:py-10">

                    {/* DECOR */}
                    <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/60 blur-3xl" />

                    <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">

                        {/* LEFT */}
                        <div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-[#e6cfd4] bg-white/65 px-4 py-2">

                                <span className="text-[#a87582]">
                                    ♡
                                </span>

                                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9c6976]">
                                    Your Style Archive
                                </span>

                            </div>

                            <h1 className="mt-5 font-serif text-4xl tracking-[-0.045em] text-[#111111] sm:text-5xl">

                                {showFavoritesOnly
                                    ? "Looks You Love."
                                    : "Saved Looks."}

                            </h1>

                            <p className="mt-3 max-w-[560px] text-sm leading-6 text-[#75676b]">

                                {showFavoritesOnly
                                    ? "Your favorite Stylora outfits, collected together for easy inspiration."
                                    : "A personal collection of outfits created with your AI Stylist — ready whenever you need inspiration."}

                            </p>

                            {/* COUNT */}
                            {!isLoading && (
                                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e5d3d7] bg-white/65 px-4 py-2">

                                    <span className="text-[10px] font-semibold text-[#765f65]">
                                        {looks.length}
                                    </span>

                                    <span className="text-[10px] text-[#917c82]">
                                        {looks.length === 1
                                            ? "look"
                                            : "looks"}{" "}
                                        in this collection
                                    </span>

                                </div>
                            )}

                        </div>


                        {/* RIGHT */}
                        <div className="flex flex-wrap gap-2">

                            {showFavoritesOnly ? (
                                <Link
                                    href="/dashboard/save-looks"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#d9c5ca] bg-white/75 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#765f65] transition hover:bg-white"
                                >
                                    ← All Looks
                                </Link>
                            ) : (
                                <Link
                                    href="/dashboard/save-looks?favorites=true"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9f6674]"
                                >
                                    ♥ Favorites
                                </Link>
                            )}

                        </div>

                    </div>

                </section>

                {/* MESSAGE */}

                {message && (
                    <div
                        role="status"
                        className={`mb-6 flex items-center gap-3 rounded-[18px] border px-5 py-4 ${messageType === "success"
                                ? "border-[#d8e5d4] bg-[#eef5eb] text-[#657d5e]"
                                : "border-[#edcdd3] bg-[#fff0f2] text-[#a65e6c]"
                            }`}
                    >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-sm">
                            {messageType === "success" ? "✓" : "!"}
                        </div>

                        <p className="text-xs font-medium leading-5">
                            {message}
                        </p>
                    </div>
                )}

                {/* LOADING */}

                {isLoading && (
                    <div className="rounded-[28px] border border-[#eadfe1] bg-white/70 px-6 py-20 text-center">

                        <div className="mx-auto flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-[#f8e5e8] font-serif text-xl text-[#a87582]">
                            ✦
                        </div>

                        <p className="mt-5 font-serif text-xl text-[#111111]">
                            Opening your style archive...
                        </p>

                        <p className="mt-2 text-xs text-[#958388]">
                            Gathering your saved Stylora looks.
                        </p>

                    </div>
                )}

                {/* EMPTY STATE */}

                {!isLoading && looks.length === 0 && (
                    <section className="relative overflow-hidden rounded-[28px] border border-[#eadfe1] bg-gradient-to-br from-white via-[#fdf8f6] to-[#f8e7e9] px-6 py-16 text-center sm:py-20">

                        <div className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-[#f5dfe3]/50 blur-3xl" />

                        <div className="relative">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#ead5da] bg-white text-2xl text-[#a87582] shadow-[0_8px_25px_rgba(91,58,67,0.06)]">
                                {showFavoritesOnly ? "♥" : "✦"}
                            </div>

                            <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b47787]">
                                {showFavoritesOnly
                                    ? "Your Favorites"
                                    : "Your Style Archive"}
                            </p>

                            <h3 className="mt-2 font-serif text-3xl text-[#111111]">
                                {showFavoritesOnly
                                    ? "No favorites just yet."
                                    : "Your collection starts here."}
                            </h3>

                            <p className="mx-auto mt-3 max-w-[470px] text-xs leading-6 text-[#817176]">
                                {showFavoritesOnly
                                    ? "When you find a look you love, tap the heart and it will appear here."
                                    : "Create outfits with your AI Stylist and save the looks you want to wear again."}
                            </p>

                            {!showFavoritesOnly && (
                                <Link
                                    href="/dashboard/ai-stylist"
                                    className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#111111] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9f6674]"
                                >
                                    ✦ Create A Look
                                    <span>→</span>
                                </Link>
                            )}

                            {showFavoritesOnly && (
                                <Link
                                    href="/dashboard/save-looks"
                                    className="mt-7 inline-flex items-center gap-3 rounded-full border border-[#dfcbd0] bg-white px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#765f65] transition hover:bg-[#f9e8eb]"
                                >
                                    Browse Saved Looks
                                    <span>→</span>
                                </Link>
                            )}

                        </div>

                    </section>
                )}

                {/* SAVED LOOKS GRID */}

                {!isLoading && looks.length > 0 && (
                    <section className="mt-8">

                        {/* SECTION HEADER */}
                        <div className="mb-5 flex items-end justify-between gap-4">

                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#b47787]">
                                    Your Collection
                                </p>

                                <h2 className="mt-1 font-serif text-2xl text-[#111111]">
                                    {showFavoritesOnly
                                        ? "Favorite Outfits"
                                        : "Your Style Gallery"}
                                </h2>
                            </div>

                            <p className="hidden text-[10px] text-[#958388] sm:block">
                                Tap a look to see the full styling details.
                            </p>

                        </div>


                        {/* LOOK CARDS */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                            {looks.map((look) => (

                                <article
                                    key={look.id}
                                    className="group overflow-hidden rounded-[26px] border border-[#eadfe1] bg-white shadow-[0_12px_35px_rgba(91,58,67,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(91,58,67,0.09)]"
                                >

                                    {/* IMAGE */}
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-[#f9eeee] to-[#f6e3e5]">

                                        <Link
                                            href={`/dashboard/save-looks/${look.id}`}
                                            className="block h-full w-full"
                                        >

                                            {look.image_url ? (
                                                <img
                                                    src={look.image_url}
                                                    alt={look.title}
                                                    className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">

                                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                                                        ✦
                                                    </div>

                                                    <p className="mt-3 text-xs text-[#9b858b]">
                                                        Stylora Look Preview
                                                    </p>

                                                </div>
                                            )}

                                        </Link>


                                        {/* TOP LABEL */}
                                        <div className="pointer-events-none absolute left-4 top-4">

                                            <span className="rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#80656c] backdrop-blur-sm">
                                                Stylora Pick
                                            </span>

                                        </div>


                                        {/* FAVORITE */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleFavorite(look)
                                            }
                                            aria-label={
                                                look.is_favorite
                                                    ? "Remove from favorites"
                                                    : "Add to favorites"
                                            }
                                            className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border text-lg shadow-sm backdrop-blur-sm transition hover:scale-105 ${look.is_favorite
                                                    ? "border-[#e7cbd1] bg-[#f9e5e9] text-[#a85f70]"
                                                    : "border-white/70 bg-white/85 text-[#8d747b]"
                                                }`}
                                        >
                                            {look.is_favorite
                                                ? "♥"
                                                : "♡"}
                                        </button>

                                    </div>


                                    {/* DETAILS */}
                                    <div className="p-5">

                                        {/* OCCASION */}
                                        {look.occasion && (
                                            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b47787]">
                                                {look.occasion}
                                            </p>
                                        )}


                                        {/* TITLE */}
                                        <Link
                                            href={`/dashboard/save-looks/${look.id}`}
                                            className="mt-1 block font-serif text-[22px] leading-tight text-[#111111] transition hover:text-[#9f6674]"
                                        >
                                            {look.title}
                                        </Link>


                                        {/* NOTES */}
                                        {look.notes && (
                                            <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#817176]">
                                                {look.notes}
                                            </p>
                                        )}


                                        {/* ITEM COUNT */}
                                        {look.wardrobe_item_ids &&
                                            look.wardrobe_item_ids.length >
                                            0 && (
                                                <div className="mt-4">

                                                    <span className="inline-flex rounded-full bg-[#f9eeee] px-3 py-1.5 text-[9px] font-medium text-[#856b72]">

                                                        {
                                                            look
                                                                .wardrobe_item_ids
                                                                .length
                                                        }{" "}
                                                        wardrobe{" "}
                                                        {look
                                                            .wardrobe_item_ids
                                                            .length === 1
                                                            ? "piece"
                                                            : "pieces"}

                                                    </span>

                                                </div>
                                            )}


                                        {/* CARD FOOTER */}
                                        <div className="mt-5 flex items-center justify-between border-t border-[#eee2e4] pt-4">

                                            <Link
                                                href={`/dashboard/save-looks/${look.id}`}
                                                className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#725f64] transition hover:text-[#a87582]"
                                            >
                                                View Look
                                                <span>→</span>
                                            </Link>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(look)
                                                }
                                                className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#b58d96] transition hover:text-[#a24f60]"
                                            >
                                                Remove
                                            </button>

                                        </div>

                                    </div>

                                </article>

                            ))}

                        </div>

                    </section>
                )}
            </div>
        </div>
    );
}