import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
    request: NextRequest
) {
    try {
        const body =
            await request.json();

        const {
            avatarImageUrl,
            wardrobeImageUrls,
            wardrobeItems,
            recommendationTitle,
            recommendationSummary,
            modestyNotes,
        } = body;

        if (!avatarImageUrl) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Full-body avatar photo is required.",
                },
                { status: 400 }
            );
        }

        if (
            !Array.isArray(
                wardrobeImageUrls
            ) ||
            wardrobeImageUrls.length === 0
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Wardrobe images are required.",
                },
                { status: 400 }
            );
        }

        const wardrobeDetails =
            Array.isArray(wardrobeItems)
                ? wardrobeItems
                    .map(
                        (
                            item: {
                                name?: string;
                                category?: string;
                                color?: string;
                            },
                            index: number
                        ) =>
                            `${index + 1}. ${item.name || "Wardrobe item"
                            } | Category: ${item.category || "Unknown"
                            } | Color: ${item.color || "Use reference image color"
                            }`
                    )
                    .join("\n")
                : "";

        const content = [
            {
                type: "input_text" as const,
                text: `Create a realistic fashion virtual try-on preview.

Use the FIRST image as the person's full-body reference.
Use all remaining images as the exact wardrobe item references.

Preserve the person's face, identity, body proportions, skin tone, and pose as closely as possible.

SELECTED WARDROBE ITEMS:
${wardrobeDetails}

Recommendation:
${recommendationTitle ?? ""}

Summary:
${recommendationSummary ?? ""}

Modesty requirements:
${modestyNotes ?? "No specific modesty requirement."}

IMPORTANT WARDROBE FIDELITY RULES:

- Dress the person using the supplied wardrobe reference items.
- Preserve each wardrobe item's ORIGINAL COLOR from its reference image and wardrobe details.
- DO NOT recolor any garment or accessory to match the recommendation title, summary, or overall color palette.
- If the wardrobe details say an item is pink, keep that item pink.
- Preserve the garment's pattern, approximate cut, length, silhouette, and overall design as closely as possible.
- Match each wardrobe image with its corresponding wardrobe item detail in the same order.
- Do not replace a selected wardrobe item with a different garment.
- Do not invent random clothing pieces.
- Do not change an item's color just to make the outfit look more coordinated.
- The supplied wardrobe references have priority over descriptive words in the recommendation.
- Respect all stated modesty requirements.

The final image should look like a realistic full-body fashion try-on of the supplied wardrobe pieces on the supplied person.
`,
            },
            {
                type: "input_image" as const,
                image_url: avatarImageUrl,
                detail: "auto" as const,
            },
            ...wardrobeImageUrls.map((url: string) => ({
                type: "input_image" as const,
                image_url: url,
                detail: "auto" as const,
            })),
        ];

        const response =
            await openai.responses.create({
                model: "gpt-5.6",

                input: [
                    {
                        role: "user",
                        content,
                    },
                ],

                tools: [
                    {
                        type: "image_generation",
                        quality: "medium",
                        size: "1024x1536",
                    },
                ],
            });

        const imageCall =
            response.output.find(
                (item) =>
                    item.type ===
                    "image_generation_call"
            );

        if (
            !imageCall ||
            !(
                "result" in imageCall
            ) ||
            !imageCall.result
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Stylora could not create the avatar preview.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            image:
                imageCall.result,
        });
    } catch (error) {
        console.error(
            "Avatar generation error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong while creating the avatar preview.",
            },
            { status: 500 }
        );
    }
}