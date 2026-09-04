import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: "No blueprint image provided." },
        { status: 400 }
      );
    }

    // High-precision prompt optimized for security & low-voltage CAD drawings
    const prompt = `
You are an expert Senior Security Design Engineer and Low-Voltage Estimator.
Analyze this architectural/security blueprint drawing meticulously to extract IP camera counts and infrastructure sizing factors.

CRITICAL DETECTION RULES:
1. CAMERA SYMBOLS:
   - Scan every room, hallway, entry point, perimeter boundary, and corner.
   - Look for standard CCTV symbols: cone/triangle field-of-view indicators, circular dome icons, camera body outlines, and text tags like "CAM-XX", "CCTV", "C-01", etc.
   - Pay extra attention to dark-mode/inverted floor plans, low-contrast vector lines, and high-density areas (like MDF/IDF rooms or lobbies).
   - Count EVERY distinct physical camera location shown.

2. INDUSTRY STANDARDS & REFERENCE METHODOLOGY:
   - Base all calculations on ANSI/BICSI 005 (Security System Design), IEEE 802.3at/bt (PoE Standards), and NEC Article 352/358 (Conduit Fill Rules).

RETURN ONLY A VALID JSON OBJECT matching this exact structure (no markdown formatting, no code fences):
{
  "cameraCount": number,
  "confidenceScore": number,
  "detectedZones": [
    { "zoneName": string, "count": number }
  ],
  "reasoningSummary": "Brief 1-2 sentence engineering justification of the count based on detected visual symbols."
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high", // Forces high-resolution tile analysis
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature minimizes hallucinations
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Failed to receive response from OpenAI Vision.");
    }

    const data = JSON.parse(content);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Vision API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse blueprint." },
      { status: 500 }
    );
  }
}