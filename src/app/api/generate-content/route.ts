import { NextResponse } from 'next/server';
import { generateDetailedContent } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';

export async function POST(request: Request) {
  try {
    const { topic, text } = await request.json();

    if (!topic || !text) {
      return NextResponse.json(
        { error: 'Topic and text are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const TopicModel = Topic as Model<any>;
    const topicDoc = await TopicModel.findOne({ title: topic });

    if (!topicDoc) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Verify that the text exists in one of the aspects
    const textExists = topicDoc.aspects.some(aspect => 
      aspect.thingsToKnow.includes(text)
    );

    if (!textExists) {
      return NextResponse.json(
        { error: 'Text not found in any aspect' },
        { status: 404 }
      );
    }

    // Generate or get cached content
    const content = await generateDetailedContent(topic, text);
    return NextResponse.json(content);

  } catch (error) {
    console.error('Error in generate-content API:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
} 