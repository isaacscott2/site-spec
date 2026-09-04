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
You are an expert Security Engineer and Low-Voltage Estimator scanning an architectural blueprint.
Identify and categorize all security camera symbols using the blueprint legend, labels, or symbol shapes.

Categories:
- Dome Cameras (interior domes, standard fixed ceiling units)
- Bullet Cameras (exterior/perimeter bullets, long-range IR units)
- PTZ Cameras (pan-tilt-zoom, 90W high-power units)
- Multisensor / Fisheye Cameras (180° / 360° wide-coverage units)

Return ONLY a valid JSON object matching this exact structure:
{
  "cameraCount": number,
  "breakdown": {
    "dome": number,
    "bullet": number,
    "ptz": number,
    "multisensor": number
  },
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
                detail: "auto",
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 400,
    });

    const rawContent = response.choices[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { error: "OpenAI Vision did not return content." },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(rawContent);

    const breakdown = {
      dome: parsedData.breakdown?.dome ?? 0,
      bullet: parsedData.breakdown?.bullet ?? 0,
      ptz: parsedData.breakdown?.ptz ?? 0,
      multisensor: parsedData.breakdown?.multisensor ?? 0,
    };

    const calculatedTotal =
      breakdown.dome + breakdown.bullet + breakdown.ptz + breakdown.multisensor;
    const finalCount =
      parsedData.cameraCount && parsedData.cameraCount > 0
        ? parsedData.cameraCount
        : calculatedTotal;

    return NextResponse.json({
      cameraCount: finalCount,
      breakdown,
      reasoningSummary: parsedData.reasoningSummary || "Scan completed.",
    });
  } catch (error: any) {
    console.error("Vercel Serverless Route Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to parse blueprint.",
        cameraCount: 0,
        breakdown: { dome: 0, bullet: 0, ptz: 0, multisensor: 0 },
      },
      { status: 500 }
    );
  }
}