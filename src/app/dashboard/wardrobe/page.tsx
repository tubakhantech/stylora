import Link from "next/link";

import { createClient } from "@/utils/supabase/server";

const WARDROBE_CATEGORIES = [
    {
        name: "Dresses",
        slug: "dresses",
        description: "Dresses, gowns and one-piece outfits",
        icon: "👗",
        image: "/wardrobe-categories/dress.png",
        itemTypes: [
            "Dress",
            "Gown",
            "One Piece",
        ],
    },
    {
        name: "Tops",
        slug: "tops",
        description: "Tops, shirts, T-shirts and blouses",
        icon: "👚",
        image: "/wardrobe-categories/tops.png",
        itemTypes: [
            "Top",
            "Shirt",
            "T-Shirt",
            "Blouse",
            "Upper Wear",
        ],
    },
    {
        name: "Bottoms",
        slug: "bottoms",
        description: "Jeans, trousers, skirts and shorts",
        icon: "👖",
        image: "/wardrobe-categories/bottoms.png",
        itemTypes: [
            "Bottom",
            "Jeans",
            "Trousers",
            "Skirt",
            "Palazzo",
            "Shorts",
            "Lower Wear",
        ],
    },
    {
        name: "Outerwear",
        slug: "outerwear",
        description: "Jackets, blazers, coats and layers",
        icon: "🧥",
        image: "/wardrobe-categories/outerwear.png",
        itemTypes: [
            "Jacket",
            "Blazer",
            "Coat",
        ],
    },
    {
        name: "Ethnic Wear",
        slug: "ethnic-wear",
        description: "Kurtas, suits, sarees and festive wear",
        icon: "🥻",
        image: "/wardrobe-categories/ethnic-wear.png",
        itemTypes: [
            "Ethnic Wear",
        ],
    },
    {
        name: "Footwear",
        slug: "footwear",
        description: "Heels, flats, sneakers, boots and sandals",
        icon: "👠",
        image: "/wardrobe-categories/footwear.png",
        itemTypes: [
            "Footwear",
        ],
    },
    {
        name: "Bags",
        slug: "bags",
        description: "Handbags, clutches, totes and backpacks",
        icon: "👜",
        image: "/wardrobe-categories/bags.png",
        itemTypes: [
            "Bag",
        ],
    },
    {
        name: "Jewellery",
        slug: "jewellery",
        description: "Necklaces, earrings, rings and bracelets",
        icon: "💎",
        image: "/wardrobe-categories/jewellery.png",
        itemTypes: ["Jewellery"],
    },

    {
        name: "Dupattas & Scarves",
        slug: "dupattas-scarves",
        description: "Dupattas, hijabs, scarves, stoles, shawls and undercaps",
        icon: "🧕",
        image: "/wardrobe-categories/dupattas-scarves.png",

        itemTypes: [
            "Dupatta",
            "Hijab",
            "Scarf",
            "Stole",
            "Shawl",
            "Undercap",
            "Hijab Cap",
        ],
    },

    {
        name: "Accessories",
        slug: "accessories",
        description: "Belts, caps, hats, sunglasses and more",
        icon: "🕶️",
        image: "/wardrobe-categories/accessories.png",
        itemTypes: [
            "Accessory",
            "Cap",
            "Hat",
            "Other",
        ],
    },
];;

export default async function WardrobePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    let wardrobeItems: { category: string | null }[] = [];

    if (user) {
        const { data } = await supabase
            .from("wardrobe_items")
            .select("category")
            .eq("user_id", user.id);

        wardrobeItems = data ?? [];
    }

    const getCategoryCount = (
        itemTypes: string[]
    ) => {
        return wardrobeItems.filter((item) =>
            item.category
                ? itemTypes.includes(item.category)
                : false
        ).length;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1200px]">

                {/* WARDROBE EDITORIAL HERO */}
                <section className="relative mb-8 overflow-hidden rounded-[32px] border border-[#eadfe1] bg-[#f8efec]">

                    <div className="grid min-h-[350px] lg:grid-cols-[0.9fr_1.1fr]">

                        {/* LEFT CONTENT */}
                        <div className="relative z-10 flex flex-col justify-center px-7 py-10 sm:px-10 lg:px-12">

                            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#6f6064]">
                                Your Digital Closet
                            </p>

                            <h1 className="mt-5 font-serif text-5xl leading-[0.95] tracking-[-0.05em] text-[#111111] sm:text-6xl">
                                Curate Today.
                                <br />

                                <span className="italic text-[#bd7b87]">
                                    Style
                                </span>{" "}
                                Tomorrow.
                            </h1>

                            <p className="mt-6 max-w-[480px] text-sm leading-6 text-[#655a5d]">
                                Organize your wardrobe, explore your pieces and
                                let Stylora create new looks from what you
                                already own.
                            </p>

                            <div className="mt-6">
                                <a
                                    href="#wardrobe-collections"
                                    className="inline-flex items-center gap-4 rounded-full bg-[#111111] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#9f6674]"
                                >
                                    Your Wardrobe
                                    <span>→</span>
                                </a>
                            </div>

                            {/* STATS */}
                            <div className="mt-7 flex items-center gap-8">

                                <div>
                                    <p className="font-serif text-3xl text-[#111111]">
                                        {wardrobeItems.length}
                                    </p>

                                    <p className="mt-1 text-xs text-[#74676a]">
                                        Total Pieces
                                    </p>
                                </div>

                                <div className="h-11 w-px bg-[#cfbfc2]" />

                                <div>
                                    <p className="font-serif text-3xl text-[#111111]">
                                        {WARDROBE_CATEGORIES.length}
                                    </p>

                                    <p className="mt-1 text-xs text-[#74676a]">
                                        Categories
                                    </p>
                                </div>

                            </div>
                        </div>


                        {/* RIGHT VISUAL */}
                        <div className="relative hidden min-h-[350px] overflow-hidden lg:block">

                            <img
                                src="/wardrobe-categories/wardrobe-hero-female.png"
                                alt="Stylora wardrobe collection"
                                className="absolute inset-0 h-full w-full object-cover object-center"
                            />

                            {/* SOFT OVERLAY */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#f8efec]/20 via-transparent to-black/[0.04]" />

                            {/* EDITORIAL LABEL */}
                            <div className="absolute bottom-7 left-7 rounded-full border border-white/40 bg-white/75 px-4 py-2 backdrop-blur-md">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6f555c]">
                                    ✦ Styled by Stylora
                                </p>
                            </div>

                        </div>

                    </div>
                </section>

                {/* WARDROBE COLLECTIONS */}
                <section
                    id="wardrobe-collections"
                    className="mt-9"
                >
                    {/* HEADING */}
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#bd7b87]">
                                Explore Your Closet
                            </p>

                            <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] text-[#111111] sm:text-4xl">
                                Shop your own wardrobe.
                            </h2>
                        </div>

                        <p className="hidden font-serif text-sm italic text-[#77696d] sm:block">
                            Every piece has a story. Find yours.
                        </p>
                    </div>


                    {/* CATEGORY CARDS */}
                    <div className="grid gap-4 lg:grid-cols-2">

                        {WARDROBE_CATEGORIES.map(
                            (category, index) => {
                                const itemCount =
                                    getCategoryCount(
                                        category.itemTypes
                                    );

                                const imageBackgrounds = [
                                    "bg-[#ead2d2]",
                                    "bg-[#eaded3]",
                                    "bg-[#dedbd8]",
                                    "bg-[#dfd1c6]",
                                    "bg-[#e8d8cf]",
                                    "bg-[#ead2ce]",
                                    "bg-[#dfcec7]",
                                    "bg-[#e8d8c9]",
                                    "bg-[#d7d4ca]",
                                    "bg-[#dfcfc1]",
                                ];

                                return (
                                    <Link
                                        key={category.slug}
                                        href={`/dashboard/wardrobe/${category.slug}`}
                                        className="group grid min-h-[165px] grid-cols-[125px_1fr] overflow-hidden rounded-[26px] border border-[#eadfe1] bg-[#fcf8f7] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(72,46,53,0.09)] sm:grid-cols-[155px_1fr]"
                                    >

                                        {/* IMAGE AREA */}
                                        <div
                                            className={`relative flex items-center justify-center overflow-hidden ${imageBackgrounds[
                                                index %
                                                imageBackgrounds.length
                                                ]
                                                }`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />

                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        </div>


                                        {/* DETAILS */}
                                        <div className="relative flex flex-col justify-center p-5 sm:p-6">

                                            <h3 className="font-serif text-2xl text-[#111111]">
                                                {category.name}
                                            </h3>

                                            <p className="mt-1 text-sm font-medium text-[#8d6d75]">
                                                {itemCount}{" "}
                                                {itemCount === 1
                                                    ? "piece"
                                                    : "pieces"}
                                            </p>

                                            <p className="mt-3 max-w-[300px] text-xs leading-5 text-[#817478]">
                                                {category.description}
                                            </p>


                                            {/* ARROW */}
                                            <span className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-sm text-white transition duration-300 group-hover:bg-[#bd7b87] group-hover:translate-x-1">
                                                →
                                            </span>

                                        </div>

                                    </Link>
                                );
                            }
                        )}

                    </div>
                </section>
            </div>
        </div>
    );
}