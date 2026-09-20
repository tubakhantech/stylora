"use client";

import {
    ChangeEvent,
    FormEvent,
    useEffect,
    useState,
} from "react";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";

interface WardrobeItem {
    id: string;
    name: string;
    category: string;
    color: string | null;
    brand: string | null;
    size: string | null;
    season: string | null;
    occasion: string | null;

    // Storage object path
    image_url: string | null;

    // Temporary signed URL used only for display
    display_url?: string | null;
}

const CATEGORY_OPTIONS = [
    "Top",
    "Shirt",
    "T-Shirt",
    "Blouse",
    "Upper Wear",

    "Jeans",
    "Trousers",
    "Skirt",
    "Palazzo",
    "Shorts",
    "Lower Wear",

    "Dress",
    "Gown",
    "One Piece",

    "Jacket",
    "Blazer",
    "Coat",

    "Ethnic Wear",
    "Footwear",
    "Bag",
    "Jewellery",

    "Dupatta",
    "Hijab",
    "Scarf",
    "Stole",
    "Shawl",
    "Undercap",
    "Hijab Cap",

    "Accessory",
    "Cap",
    "Hat",
    "Other",
];

const CATEGORY_GROUPS: Record<string, string[]> = {
    dresses: [
        "Dress",
        "Gown",
        "One Piece",
    ],

    tops: [
        "Top",
        "Shirt",
        "T-Shirt",
        "Blouse",
        "Upper Wear",
    ],

    bottoms: [
        "Jeans",
        "Trousers",
        "Skirt",
        "Palazzo",
        "Shorts",
        "Lower Wear",
    ],

    outerwear: [
        "Jacket",
        "Blazer",
        "Coat",
    ],

    "ethnic-wear": [
        "Ethnic Wear",
    ],

    footwear: [
        "Footwear",
    ],

    bags: [
        "Bag",
    ],

    jewellery: [
        "Jewellery",
    ],

    "dupattas-scarves": [
        "Dupatta",
        "Hijab",
        "Scarf",
        "Stole",
        "Shawl",
        "Undercap",
        "Hijab Cap",
    ],

    accessories: [
        "Accessory",
        "Cap",
        "Hat",
    ],
};

const SEASON_OPTIONS = [
    "All Season",
    "Summer",
    "Winter",
    "Monsoon",
];

const OCCASION_OPTIONS = [
    "Casual",
    "Daily Wear",
    "Office / College",
    "Party",
    "Wedding / Festive",
    "Travel",
    "Date / Outing",
];

type MessageType = "success" | "error" | null;


export default function WardrobePage() {
    const params = useParams();

    const routeCategory =
        typeof params.category === "string"
            ? params.category.toLowerCase()
            : "";

    const allowedCategories =
        CATEGORY_GROUPS[routeCategory] ?? [];

    const [items, setItems] = useState<WardrobeItem[]>([]);

    const [showForm, setShowForm] = useState(false);

    // When null = adding new item
    // When string = editing existing item
    const [editingItemId, setEditingItemId] =
        useState<string | null>(null);

    const [existingImagePath, setExistingImagePath] =
        useState<string | null>(null);

    const [existingImagePreview, setExistingImagePreview] =
        useState<string | null>(null);

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [color, setColor] = useState("");
    const [brand, setBrand] = useState("");
    const [size, setSize] = useState("");
    const [season, setSeason] = useState("");
    const [occasion, setOccasion] = useState("");

    const [imageFile, setImageFile] =
        useState<File | null>(null);

    const [imagePreview, setImagePreview] =
        useState<string | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [message, setMessage] = useState("");

    const [messageType, setMessageType] =
        useState<MessageType>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [colorFilter, setColorFilter] = useState("");
    /*
     * Revoke browser preview URL when a new
     * image is selected or component closes.
     */
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const showMessage = (
        type: MessageType,
        text: string
    ) => {
        setMessageType(type);
        setMessage(text);

        if (type === "success") {
            setTimeout(() => {
                setMessage("");
                setMessageType(null);
            }, 3000);
        }
    };

    /*
     * LOAD WARDROBE
     */
    const loadWardrobe = async () => {
        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsLoading(false);
            return;
        }

        let query = supabase
            .from("wardrobe_items")
            .select(
                `
        id,
        name,
        category,
        color,
        brand,
        size,
        season,
        occasion,
        image_url
        `
            )
            .eq("user_id", user.id);

        if (allowedCategories.length > 0) {
            query = query.in(
                "category",
                allowedCategories
            );
        }

        const { data, error } = await query.order(
            "created_at",
            {
                ascending: false,
            }
        );

        if (error) {
            showMessage("error", error.message);
            setIsLoading(false);
            return;
        }

        if (!data) {
            setItems([]);
            setIsLoading(false);
            return;
        }

        /*
         * Because bucket is PRIVATE,
         * generate a signed URL for each image.
         */
        const itemsWithImages =
            await Promise.all(
                data.map(async (item) => {
                    if (!item.image_url) {
                        return {
                            ...item,
                            display_url: null,
                        };
                    }

                    const {
                        data: signedData,
                    } = await supabase.storage
                        .from("wardrobe-images")
                        .createSignedUrl(
                            item.image_url,
                            3600
                        );

                    return {
                        ...item,
                        display_url:
                            signedData?.signedUrl ??
                            null,
                    };
                })
            );

        setItems(itemsWithImages);
        setIsLoading(false);
    };

    useEffect(() => {
        loadWardrobe();
    }, [routeCategory]);
    /*
     * RESET FORM
     */
    const resetForm = () => {
        setName("");
        setCategory("");
        setColor("");
        setBrand("");
        setSize("");
        setSeason("");
        setOccasion("");

        setEditingItemId(null);

        setExistingImagePath(null);
        setExistingImagePreview(null);

        setImageFile(null);

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }

        setImagePreview(null);
    };

    /*
     * CANCEL FORM
     */
    const handleCancelForm = () => {
        resetForm();
        setShowForm(false);
        setMessage("");
        setMessageType(null);
    };

    /*
     * IMAGE SELECTION
     */
    const handleImageChange = (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        setMessage("");
        setMessageType(null);

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        if (
            !file.type.startsWith("image/")
        ) {
            showMessage(
                "error",
                "Please select a valid image file."
            );
            return;
        }

        // 5MB client-side limit
        if (file.size > 5 * 1024 * 1024) {
            showMessage(
                "error",
                "Image must be smaller than 5 MB."
            );
            return;
        }

        if (imagePreview) {
            URL.revokeObjectURL(
                imagePreview
            );
        }

        const preview =
            URL.createObjectURL(file);

        setImageFile(file);
        setImagePreview(preview);
    };

    /*
     * UPLOAD IMAGE
     */
    const uploadImage = async (
        userId: string
    ): Promise<{
        path: string | null;
        error: string | null;
    }> => {
        if (!imageFile) {
            return {
                path: existingImagePath,
                error: null,
            };
        }

        const supabase =
            createClient();

        const extension =
            imageFile.name
                .split(".")
                .pop()
                ?.toLowerCase() || "jpg";

        const fileName =
            `${crypto.randomUUID()}.${extension}`;

        /*
         * IMPORTANT:
         * First folder = user ID.
         *
         * This matches the Storage RLS
         * policies we created earlier.
         */
        const filePath =
            `${userId}/${fileName}`;

        const { error } =
            await supabase.storage
                .from("wardrobe-images")
                .upload(
                    filePath,
                    imageFile,
                    {
                        cacheControl: "3600",
                        upsert: false,
                    }
                );

        if (error) {
            return {
                path: null,
                error: error.message,
            };
        }

        return {
            path: filePath,
            error: null,
        };
    };

    /*
     * ADD / UPDATE
     */
    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setMessage("");
        setMessageType(null);

        if (!name.trim()) {
            showMessage(
                "error",
                "Please enter an item name."
            );
            return;
        }

        if (!category) {
            showMessage(
                "error",
                "Please select a category."
            );
            return;
        }

        setIsSubmitting(true);

        const supabase =
            createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setIsSubmitting(false);

            showMessage(
                "error",
                "Your session has expired. Please log in again."
            );

            return;
        }

        /*
         * Upload new image if selected.
         * If editing without selecting a new image,
         * existing path is returned.
         */
        const {
            path: uploadedImagePath,
            error: uploadError,
        } = await uploadImage(user.id);

        if (uploadError) {
            setIsSubmitting(false);

            showMessage(
                "error",
                uploadError
            );

            return;
        }

        /*
         * EDIT EXISTING ITEM
         */
        if (editingItemId) {
            const oldImagePath =
                existingImagePath;

            const { error } =
                await supabase
                    .from("wardrobe_items")
                    .update({
                        name: name.trim(),
                        category,
                        color:
                            color.trim() || null,
                        brand:
                            brand.trim() || null,
                        size:
                            size.trim() || null,
                        season:
                            season || null,
                        occasion:
                            occasion || null,
                        image_url:
                            uploadedImagePath,
                        updated_at:
                            new Date().toISOString(),
                    })
                    .eq(
                        "id",
                        editingItemId
                    )
                    .eq(
                        "user_id",
                        user.id
                    );

            if (error) {
                /*
                 * New image uploaded but DB update
                 * failed, so remove orphan image.
                 */
                if (
                    imageFile &&
                    uploadedImagePath &&
                    uploadedImagePath !==
                    oldImagePath
                ) {
                    await supabase.storage
                        .from(
                            "wardrobe-images"
                        )
                        .remove([
                            uploadedImagePath,
                        ]);
                }

                setIsSubmitting(false);

                showMessage(
                    "error",
                    error.message
                );

                return;
            }

            /*
             * New image successfully saved.
             * Old image can now safely be removed.
             */
            if (
                imageFile &&
                oldImagePath &&
                uploadedImagePath !==
                oldImagePath
            ) {
                await supabase.storage
                    .from(
                        "wardrobe-images"
                    )
                    .remove([
                        oldImagePath,
                    ]);
            }

            setIsSubmitting(false);

            showMessage(
                "success",
                "Wardrobe item updated successfully."
            );
        } else {
            /*
             * ADD NEW ITEM
             */
            const { error } =
                await supabase
                    .from("wardrobe_items")
                    .insert({
                        user_id: user.id,
                        name: name.trim(),
                        category,
                        color:
                            color.trim() || null,
                        brand:
                            brand.trim() || null,
                        size:
                            size.trim() || null,
                        season:
                            season || null,
                        occasion:
                            occasion || null,
                        image_url:
                            uploadedImagePath,
                    });

            if (error) {
                /*
                 * Upload succeeded but DB insert
                 * failed — clean up image.
                 */
                if (uploadedImagePath) {
                    await supabase.storage
                        .from(
                            "wardrobe-images"
                        )
                        .remove([
                            uploadedImagePath,
                        ]);
                }

                setIsSubmitting(false);

                showMessage(
                    "error",
                    error.message
                );

                return;
            }

            setIsSubmitting(false);

            showMessage(
                "success",
                "Item added to your wardrobe."
            );
        }

        resetForm();
        setShowForm(false);

        await loadWardrobe();
    };

    /*
     * EDIT BUTTON
     */
    const handleEdit = (
        item: WardrobeItem
    ) => {
        setMessage("");
        setMessageType(null);

        setEditingItemId(item.id);

        setName(item.name);
        setCategory(item.category);

        setColor(item.color ?? "");
        setBrand(item.brand ?? "");
        setSize(item.size ?? "");

        setSeason(
            item.season ?? ""
        );

        setOccasion(
            item.occasion ?? ""
        );

        setExistingImagePath(
            item.image_url
        );

        setExistingImagePreview(
            item.display_url ?? null
        );

        setImageFile(null);

        if (imagePreview) {
            URL.revokeObjectURL(
                imagePreview
            );
        }

        setImagePreview(null);
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    /*
     * DELETE ITEM
     */
    const handleDelete = async (
        item: WardrobeItem
    ) => {
        const confirmed =
            window.confirm(
                "Remove this item from your wardrobe?"
            );

        if (!confirmed) {
            return;
        }

        const supabase =
            createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            showMessage(
                "error",
                "Your session has expired."
            );
            return;
        }

        /*
         * First delete DB row.
         */
        const { error } =
            await supabase
                .from("wardrobe_items")
                .delete()
                .eq("id", item.id)
                .eq(
                    "user_id",
                    user.id
                );

        if (error) {
            showMessage(
                "error",
                error.message
            );
            return;
        }

        /*
         * Then remove image from Storage.
         */
        if (item.image_url) {
            await supabase.storage
                .from("wardrobe-images")
                .remove([
                    item.image_url,
                ]);
        }

        setItems((currentItems) =>
            currentItems.filter(
                (currentItem) =>
                    currentItem.id !==
                    item.id
            )
        );

        showMessage(
            "success",
            "Item removed from your wardrobe."
        );
    };

    const currentPreview =
        imagePreview ||
        existingImagePreview;

    const colorOptions = Array.from(
        new Set(
            items
                .map((item) => item.color)
                .filter(
                    (value): value is string =>
                        Boolean(value)
                )
        )
    ).sort();

    const filteredItems = items.filter((item) => {
        const search = searchQuery.trim().toLowerCase();

        const matchesSearch =
            !search ||
            item.name.toLowerCase().includes(search) ||
            item.brand?.toLowerCase().includes(search) ||
            item.color?.toLowerCase().includes(search);

        const matchesType =
            !typeFilter ||
            item.category === typeFilter;

        const matchesColor =
            !colorFilter ||
            item.color?.toLowerCase() ===
            colorFilter.toLowerCase();

        return (
            matchesSearch &&
            matchesType &&
            matchesColor
        );
    });

    return (
        <div className="min-h-screen bg-[#fdf8f6] p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1200px]">

                {/* CATEGORY EDITORIAL HEADER */}
                <section className="relative mb-7 overflow-hidden rounded-[28px] border border-[#eadfe1] bg-gradient-to-r from-[#f8efec] via-[#fcf7f5] to-[#f6e5e6] px-6 py-7 sm:px-8 sm:py-8">

                    <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/60 blur-3xl" />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b47787]">
                                Your Wardrobe Collection
                            </p>

                            <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#111111] sm:text-5xl">
                                {routeCategory
                                    .split("-")
                                    .map(
                                        (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1)
                                    )
                                    .join(" ")}
                            </h1>

                            <p className="mt-3 max-w-[520px] text-sm leading-6 text-[#75676b]">
                                Explore, organize and manage the pieces in this
                                collection. Every item can become part of your next
                                Stylora look.
                            </p>

                            <div className="mt-5 flex items-center gap-3">
                                <span className="rounded-full border border-[#e8d3d8] bg-white/70 px-4 py-2 text-xs font-medium text-[#765e65]">
                                    {items.length}{" "}
                                    {items.length === 1 ? "piece" : "pieces"}
                                </span>

                                <span className="font-serif text-sm italic text-[#a87582]">
                                    Style what you already own ♡
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (showForm) {
                                    handleCancelForm();
                                } else {
                                    resetForm();
                                    setShowForm(true);
                                }
                            }}
                            className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#111111] px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9f6674]"
                        >
                            {showForm ? "Cancel" : "Add New Item"}

                            <span>
                                {showForm ? "×" : "+"}
                            </span>
                        </button>

                    </div>
                </section>

                {/* Message */}
                {message && (
                    <p
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
                    </p>
                )}

                {/* Form */}
                {showForm && (
                    <div className="relative mb-8 overflow-hidden rounded-[28px] border border-[#eadfe1] bg-gradient-to-br from-[#fcf7f5] via-[#fffafa] to-[#f8e9eb] p-6 sm:p-8">

                        {/* SOFT DECOR */}
                        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#f3d7dc]/45 blur-3xl" />

                        {/* FORM HEADER */}
                        <div className="relative mb-7 border-b border-[#eadde0] pb-6">

                            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b47787]">
                                {editingItemId
                                    ? "Update Your Collection"
                                    : "Add To Your Collection"}
                            </p>

                            <h3 className="mt-2 font-serif text-3xl tracking-[-0.035em] text-[#111111]">
                                {editingItemId
                                    ? "Edit Wardrobe Item"
                                    : "New Wardrobe Piece"}
                            </h3>

                            <p className="mt-2 max-w-[520px] text-sm leading-6 text-[#806f73]">
                                {editingItemId
                                    ? "Refresh the details of this piece or replace its photo."
                                    : "Add a photo and a few details so Stylora can understand and style this piece for you."}
                            </p>

                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="grid gap-5 sm:grid-cols-2"
                        >
                            {/* PREMIUM IMAGE UPLOAD */}
                            <div className="relative sm:col-span-2">

                                <label className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9f6d79]">
                                    Clothing Photo
                                </label>

                                <div className="grid gap-5 rounded-[22px] border border-[#eadde0] bg-white/65 p-4 sm:grid-cols-[180px_1fr] sm:items-center sm:p-5">

                                    {/* IMAGE PREVIEW */}
                                    <div className="relative mx-auto w-full max-w-[180px] overflow-hidden rounded-[20px] border border-[#eadadd] bg-[#f9eeec] shadow-[0_10px_30px_rgba(91,58,67,0.07)]">

                                        <div className="flex aspect-[4/5] items-center justify-center overflow-hidden">

                                            {currentPreview ? (
                                                <img
                                                    src={currentPreview}
                                                    alt="Clothing preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="px-5 text-center">

                                                    <div className="text-4xl">
                                                        👗
                                                    </div>

                                                    <p className="mt-3 text-xs font-medium text-[#7d6a6f]">
                                                        Add your piece
                                                    </p>

                                                    <p className="mt-1 text-[10px] leading-4 text-[#aa979c]">
                                                        Your photo preview will appear here.
                                                    </p>

                                                </div>
                                            )}

                                        </div>

                                        {currentPreview && (
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-3 py-1 text-[9px] font-semibold text-[#966a75] shadow-sm backdrop-blur">
                                                ✦ PHOTO READY
                                            </div>
                                        )}

                                    </div>


                                    {/* UPLOAD CONTENT */}
                                    <div>

                                        <p className="font-serif text-xl text-[#111111]">
                                            Show Stylora your piece.
                                        </p>

                                        <p className="mt-2 max-w-[430px] text-xs leading-5 text-[#89777c]">
                                            Upload a clear photo of the clothing item so Stylora can
                                            recognize it and use it in personalized outfit ideas.
                                        </p>


                                        <label className="mt-4 inline-flex cursor-pointer items-center gap-3 rounded-full bg-[#111111] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9f6674]">

                                            {currentPreview
                                                ? "Change Photo"
                                                : "Choose Photo"}

                                            <span>＋</span>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />

                                        </label>


                                        <p className="mt-3 text-[10px] text-[#a18f94]">
                                            JPG, PNG or other image formats · Maximum 5 MB
                                        </p>


                                        {editingItemId &&
                                            existingImagePath &&
                                            !imageFile && (
                                                <p className="mt-3 inline-flex rounded-full bg-[#edf5eb] px-3 py-1.5 text-[10px] font-medium text-[#67815f]">
                                                    ✓ Current photo will be kept unless you choose a new one.
                                                </p>
                                            )}

                                    </div>

                                </div>
                            </div>

                            <Input
                                type="text"
                                label="Item Name"
                                placeholder="e.g. Black Blazer"
                                value={name}
                                onChange={(
                                    event
                                ) =>
                                    setName(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                required
                            />

                            {/* Category */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-[#5f5054]">
                                    Category *
                                </label>

                                <select
                                    value={
                                        category
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCategory(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-[14px] border border-[#e7d8dc] bg-white/80 px-4 py-3 text-sm text-[#4f4548] outline-none transition focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                                    required
                                >
                                    <option value="">
                                        Select
                                        category
                                    </option>

                                    {allowedCategories.map(
                                        (option) => (
                                            <option
                                                key={
                                                    option
                                                }
                                                value={
                                                    option
                                                }
                                            >
                                                {
                                                    option
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <Input
                                type="text"
                                label="Color"
                                placeholder="e.g. Pink"
                                value={color}
                                onChange={(
                                    event
                                ) =>
                                    setColor(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />

                            <Input
                                type="text"
                                label="Brand"
                                placeholder="Optional"
                                value={brand}
                                onChange={(
                                    event
                                ) =>
                                    setBrand(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />

                            <Input
                                type="text"
                                label="Size"
                                placeholder="e.g. M, 28, UK 6"
                                value={size}
                                onChange={(
                                    event
                                ) =>
                                    setSize(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            />

                            {/* Season */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold text-[#5f5054]">
                                    Season
                                </label>

                                <select
                                    value={
                                        season
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSeason(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    className="w-full rounded-[14px] border border-[#e7d8dc] bg-white/80 px-4 py-3 text-sm text-[#4f4548] outline-none transition focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                                >
                                    <option value="">
                                        Select
                                        season
                                    </option>

                                    {SEASON_OPTIONS.map(
                                        (
                                            option
                                        ) => (
                                            <option
                                                key={
                                                    option
                                                }
                                                value={
                                                    option
                                                }
                                            >
                                                {
                                                    option
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Occasion */}
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <label className="text-xs font-semibold text-[#5f5054]">
                                    Occasion
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
                                    className="w-full rounded-[14px] border border-[#e7d8dc] bg-white/80 px-4 py-3 text-sm text-[#4f4548] outline-none transition focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                                >
                                    <option value="">
                                        Select
                                        occasion
                                    </option>

                                    {OCCASION_OPTIONS.map(
                                        (
                                            option
                                        ) => (
                                            <option
                                                key={
                                                    option
                                                }
                                                value={
                                                    option
                                                }
                                            >
                                                {
                                                    option
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="mt-2 flex flex-col gap-3 border-t border-[#eadde0] pt-6 sm:col-span-2 sm:flex-row sm:justify-end">

                                {editingItemId && (
                                    <button
                                        type="button"
                                        onClick={handleCancelForm}
                                        className="rounded-full border border-[#dfcbd0] bg-white px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#856870] transition hover:bg-[#f9e8eb]"
                                    >
                                        Cancel Edit
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-full bg-[#111111] px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#9f6674] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? editingItemId
                                            ? "Updating..."
                                            : "Adding..."
                                        : editingItemId
                                            ? "Save Changes"
                                            : "Add To Wardrobe"}

                                    {!isSubmitting && (
                                        <span className="ml-3">→</span>
                                    )}
                                </button>

                            </div>
                        </form>
                    </div>
                )}

                {items.length > 0 && (
                    <section className="mb-7 overflow-hidden rounded-[24px] border border-[#eadfe1] bg-[#fcf8f7] p-4 sm:p-5">

                        {/* FILTER HEADER */}
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#b47787]">
                                    Find Your Pieces
                                </p>

                                <p className="mt-1 text-xs text-[#8a797d]">
                                    Search or filter your wardrobe collection.
                                </p>
                            </div>

                            <p className="hidden font-serif text-sm italic text-[#a87582] sm:block">
                                {filteredItems.length} of {items.length} pieces
                            </p>
                        </div>


                        {/* SEARCH + FILTERS */}
                        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">

                            {/* SEARCH */}
                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#aa8d94]">
                                    ⌕
                                </span>

                                <input
                                    type="search"
                                    placeholder="Search your wardrobe..."
                                    value={searchQuery}
                                    onChange={(event) =>
                                        setSearchQuery(event.target.value)
                                    }
                                    className="w-full rounded-full border border-[#e8dadd] bg-white py-3 pl-10 pr-4 text-sm text-[#111111] outline-none transition placeholder:text-[#b1a3a6] focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                                />
                            </div>


                            {/* TYPE FILTER */}
                            <select
                                value={typeFilter}
                                onChange={(event) =>
                                    setTypeFilter(event.target.value)
                                }
                                className="cursor-pointer rounded-full border border-[#e8dadd] bg-white px-4 py-3 text-sm text-[#62575a] outline-none transition focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                            >
                                <option value="">
                                    All Types
                                </option>

                                {allowedCategories.map((option) => (
                                    <option
                                        key={option}
                                        value={option}
                                    >
                                        {option}
                                    </option>
                                ))}
                            </select>


                            {/* COLOR FILTER */}
                            <select
                                value={colorFilter}
                                onChange={(event) =>
                                    setColorFilter(event.target.value)
                                }
                                className="cursor-pointer rounded-full border border-[#e8dadd] bg-white px-4 py-3 text-sm text-[#62575a] outline-none transition focus:border-[#c88e9b] focus:ring-2 focus:ring-[#f4dfe3]"
                            >
                                <option value="">
                                    All Colors
                                </option>

                                {colorOptions.map((colorOption) => (
                                    <option
                                        key={colorOption}
                                        value={colorOption}
                                    >
                                        {colorOption}
                                    </option>
                                ))}
                            </select>


                            {/* CLEAR */}
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery("");
                                    setTypeFilter("");
                                    setColorFilter("");
                                }}
                                className="rounded-full border border-[#dfcbd0] bg-white px-5 py-3 text-xs font-semibold text-[#8d6871] transition hover:border-[#c88e9b] hover:bg-[#f9e8eb] hover:text-[#111111]"
                            >
                                Clear
                            </button>

                        </div>


                        {/* MOBILE RESULT COUNT */}
                        <p className="mt-3 text-[11px] text-[#9b898d] sm:hidden">
                            Showing {filteredItems.length} of {items.length} pieces
                        </p>

                    </section>
                )}

                {/* Wardrobe */}
                {isLoading ? (
                    <div className="rounded-[28px] border border-[#eadfe1] bg-white/70 px-6 py-16 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f8e5e8] text-xl">
                            ✦
                        </div>

                        <p className="mt-4 font-serif text-xl text-[#111111]">
                            Curating your wardrobe...
                        </p>

                        <p className="mt-2 text-xs text-[#9a878c]">
                            Your collection will be ready in a moment.
                        </p>

                    </div>
                ) : items.length === 0 ? (
                    <div className="relative overflow-hidden rounded-[28px] border border-dashed border-[#dfcbd0] bg-gradient-to-br from-white via-[#fffafa] to-[#f8e8ea] px-6 py-16 text-center">

                        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#f3d7dc]/50 blur-3xl" />

                        <div className="relative">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#ead6da] bg-white text-2xl shadow-[0_10px_30px_rgba(91,58,67,0.06)]">
                                ♡
                            </div>

                            <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#b47787]">
                                Your Collection
                            </p>

                            <h3 className="mt-2 font-serif text-3xl tracking-[-0.03em] text-[#111111]">
                                This collection is waiting for you.
                            </h3>

                            <p className="mx-auto mt-3 max-w-[440px] text-sm leading-6 text-[#806f73]">
                                Add your first piece and Stylora can start using it
                                in personalized outfit ideas and styling recommendations.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                                className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#111111] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#9f6674]"
                            >
                                Add Your First Item
                                <span>＋</span>
                            </button>

                        </div>
                    </div>
                ) : (
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredItems.map((item) => (
                                    <article
                                        key={item.id}
                                        className="group overflow-hidden rounded-[24px] border border-[#eadfe1] bg-[#fcf8f7] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(72,46,53,0.10)]"
                                    >

                                        {/* ITEM IMAGE */}
                                        <div className="relative aspect-[4/5] overflow-hidden bg-[#f6ecea]">

                                            {item.display_url ? (
                                                <img
                                                    src={item.display_url}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center px-5 text-center">
                                                    <span className="text-4xl">
                                                        ♡
                                                    </span>

                                                    <p className="mt-3 text-xs text-[#9c888d]">
                                                        No clothing image
                                                    </p>
                                                </div>
                                            )}

                                            {/* CATEGORY BADGE */}
                                            <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#765f65] shadow-sm backdrop-blur-md">
                                                {item.category}
                                            </span>

                                        </div>


                                        {/* ITEM DETAILS */}
                                        <div className="p-5">

                                            <div>
                                                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#b47787]">
                                                    Wardrobe Piece
                                                </p>

                                                <h3 className="mt-1 font-serif text-xl leading-tight text-[#111111]">
                                                    {item.name}
                                                </h3>

                                                {item.brand && (
                                                    <p className="mt-1 text-xs text-[#938287]">
                                                        {item.brand}
                                                    </p>
                                                )}
                                            </div>


                                            {/* DETAILS */}
                                            <div className="mt-4 flex flex-wrap gap-2">

                                                {item.color && (
                                                    <span className="rounded-full border border-[#eadadd] bg-white px-3 py-1.5 text-[10px] font-medium text-[#705f64]">
                                                        {item.color}
                                                    </span>
                                                )}

                                                {item.size && (
                                                    <span className="rounded-full border border-[#eadadd] bg-white px-3 py-1.5 text-[10px] font-medium text-[#705f64]">
                                                        Size {item.size}
                                                    </span>
                                                )}

                                                {item.season && (
                                                    <span className="rounded-full border border-[#eadadd] bg-white px-3 py-1.5 text-[10px] font-medium text-[#705f64]">
                                                        {item.season}
                                                    </span>
                                                )}

                                                {item.occasion && (
                                                    <span className="rounded-full border border-[#eadadd] bg-white px-3 py-1.5 text-[10px] font-medium text-[#705f64]">
                                                        {item.occasion}
                                                    </span>
                                                )}

                                            </div>


                                            {/* ACTIONS */}
                                            <div className="mt-5 flex items-center gap-2 border-t border-[#eee2e4] pt-4">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(item)
                                                    }
                                                    className="flex-1 rounded-full bg-[#111111] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#9f6674]"
                                                >
                                                    Edit Item
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(item)
                                                    }
                                                    className="rounded-full border border-[#e6cfd4] bg-white px-4 py-2.5 text-[10px] font-semibold text-[#b16c7b] transition hover:bg-[#f9e7ea] hover:text-[#8f4f5e]"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        </div>
                                    </article>
                                ))}
                            </div>
                )}
            </div>
        </div>
    );
}