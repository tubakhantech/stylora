import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
    request: NextRequest
) {
    try {
        // Make sure only logged-in Stylora users
        // can use the paid AI endpoint.
        const supabase =
            await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "You must be logged in to use the AI Stylist.",
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        const {
            request: stylistRequest,
            profile,
            wardrobe,
            settings,
        } = body;

        if (
            !stylistRequest?.occasion
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Please select an occasion.",
                },
                { status: 400 }
            );
        }

        if (!profile) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Your style profile is missing.",
                },
                { status: 400 }
            );
        }

        const wardrobeItems =
            Array.isArray(wardrobe)
                ? wardrobe
                : [];

        const allowExternalSuggestions =
            settings
                ?.ai_allow_external_suggestions ??
            true;

        const useWardrobe =
            stylistRequest
                ?.use_wardrobe ??
            true;

        const prompt = `
You are Stylora, a thoughtful personal fashion stylist.

Create ONE complete outfit recommendation for this user.

IMPORTANT RULES:

1. Respect the user's explicit clothing and modesty preferences.
2. Never assume religious requirements from gender, name, religion, ethnicity, or appearance.
3. If the user explicitly selected preferences such as:
   - Modest Dressing
   - Full Sleeves
   - Avoid Sleeveless
   - Avoid Deep Necklines
   - Prefer Loose Fit
   - Prefer Longer Lengths
   - Hijab-Friendly
   - Include Dupatta / Scarf

   then treat those preferences as important styling requirements.

4. If the user asks for Muslim/modest styling in their current request,
   follow the restrictions they personally specify.
   Different users may follow different modesty standards.

5. If "Use My Wardrobe" is true:
   - Prefer the supplied wardrobe items.
   - selected_wardrobe_item_ids MUST contain only IDs that exist
     in the supplied wardrobe.
   - Do not invent wardrobe IDs.

6. Consider relevant items such as:
   dupatta, hijab, scarf, stole, shawl and undercap
   when appropriate and available.

7. A normal cap or hat is a fashion accessory.
   Do not treat it as a hijab undercap unless the item data says so.

8. Consider:
   - occasion
   - weather
   - requested style/vibe
   - body type
   - skin tone
   - preferred styles
   - favorite colors
   - colors to avoid
   - fit preference
   - comfort priority
   - style goal
   - accessories preference
   - modesty preferences
   - user's additional request

9. Do not make body-shaming or negative appearance statements.

10. Keep explanations concise and practical.

11. If the wardrobe does not contain enough suitable pieces:
    ${allowExternalSuggestions
                ? `You may suggest generic missing pieces in external_suggestions.
               Do not pretend those pieces already exist in the user's wardrobe.`
                : `Do not suggest external products or missing pieces.
               Make the best possible outfit using only the available wardrobe.`
            }

CURRENT STYLING REQUEST:
${JSON.stringify(
                stylistRequest,
                null,
                2
            )}

USER STYLE PROFILE:
${JSON.stringify(
                profile,
                null,
                2
            )}

AVAILABLE WARDROBE:
${useWardrobe
                ? JSON.stringify(
                    wardrobeItems,
                    null,
                    2
                )
                : "The user chose not to use their wardrobe."
            }

AI SETTINGS:
${JSON.stringify(
                settings ?? {},
                null,
                2
            )}
`;

        const response =
            await openai.responses.create({
                model:
                    "gpt-5.6-luna",

                reasoning: {
                    effort: "none",
                },

                store: false,

                max_output_tokens: 1200,

                input: prompt,

                text: {
                    format: {
                        type:
                            "json_schema",

                        name:
                            "stylora_outfit_recommendation",

                        strict: true,

                        schema: {
                            type:
                                "object",

                            additionalProperties:
                                false,

                            properties: {
                                title: {
                                    type:
                                        "string",
                                },

                                summary: {
                                    type:
                                        "string",
                                },

                                selected_wardrobe_item_ids:
                                {
                                    type:
                                        "array",
                                    items: {
                                        type:
                                            "string",
                                    },
                                },

                                styling_tips:
                                {
                                    type:
                                        "array",
                                    items: {
                                        type:
                                            "string",
                                    },
                                },

                                color_notes: {
                                    type:
                                        "string",
                                },

                                modesty_notes: {
                                    type:
                                        "string",
                                },

                                weather_notes: {
                                    type:
                                        "string",
                                },

                                external_suggestions:
                                {
                                    type:
                                        "array",
                                    items: {
                                        type:
                                            "string",
                                    },
                                },

                                why_it_works: {
                                    type:
                                        "string",
                                },
                            },

                            required: [
                                "title",
                                "summary",
                                "selected_wardrobe_item_ids",
                                "styling_tips",
                                "color_notes",
                                "modesty_notes",
                                "weather_notes",
                                "external_suggestions",
                                "why_it_works",
                            ],
                        },
                    },
                },
            });

        if (!response.output_text) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Stylora could not create a recommendation.",
                },
                { status: 500 }
            );
        }

        const recommendation =
            JSON.parse(
                response.output_text
            );

        // Extra protection:
        // only allow real wardrobe IDs
        // returned by the user's wardrobe.
        const validIds =
            new Set(
                wardrobeItems.map(
                    (item: {
                        id: string;
                    }) => item.id
                )
            );

        recommendation.selected_wardrobe_item_ids =
            recommendation
                .selected_wardrobe_item_ids
                .filter(
                    (id: string) =>
                        validIds.has(id)
                );

        return NextResponse.json({
            success: true,
            recommendation,
        });
    } catch (error) {
        console.error(
            "AI Stylist error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Something went wrong while creating your outfit.",
            },
            { status: 500 }
        );
    }
}