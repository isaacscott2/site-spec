import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    // Strip out the base64 prefix if present (e.g. "data:image/png;base64,")
    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert commercial low-voltage estimator. Analyze the provided floor plan/blueprint image.
Count all camera symbols, access control doors, and data drops.
Return ONLY a valid JSON object matching this schema:
{
  "cameraCount": number,
  "confidenceNotes": "string"
}`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Count the camera symbols in this image.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${cleanBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const parsedData = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('OpenAI Vision Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
