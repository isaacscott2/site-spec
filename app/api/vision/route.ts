import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API Key is missing in Vercel environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "No blueprint image provided." },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert Security Engineer and Low-Voltage Estimator.
Scan this architectural blueprint meticulously and count all security camera symbols (cones, domes, bullets, PTZs, CAM-XX tags).

Rules:
1. Scan every room, hallway, entry point, perimeter, and corner.
2. Count every single camera symbol visible.

Return ONLY a valid JSON object matching this structure:
{
  "cameraCount": number,
  "reasoningSummary": "Short explanation of detected symbols"
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
                detail: "auto", // Automatically optimizes image resolution payload
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 300,
    });

    const rawContent = response.choices[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { error: "OpenAI Vision did not return content." },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(rawContent);

    // Fallback guarantee
    return NextResponse.json({
      cameraCount: parsedData.cameraCount ?? parsedData.total_cameras ?? 0,
      reasoningSummary: parsedData.reasoningSummary || "Scan completed.",
    });

  } catch (error: any) {
    console.error("Vercel Serverless Route Error:", error);
    
    // GUARANTEE: Always return valid JSON, never raw HTML
    return NextResponse.json(
      { 
        error: error.message || "Failed to parse blueprint.",
        cameraCount: 0 
      },
      { status: 500 }
    );
  }
}