import { NextResponse } from 'next/server';
import { generateDetailedContent } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { item } = await request.json();

    if (!item) {
      return NextResponse.json(
        { error: 'Item is required' },
        { status: 400 }
      );
    }

    // Generate detailed content using Gemini
    const content = await generateDetailedContent(item, item);

    return NextResponse.json({
      caption: content.caption,
      thingsToKnow: content.thingsToKnow
    });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 