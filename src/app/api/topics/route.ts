import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, tldr, aspects } = data;

    if (!title || !tldr || !aspects) {
      return NextResponse.json(
        { error: 'Title, TLDR, and aspects are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if topic already exists
    const existingTopic = await Topic.findOne({ title });
    if (existingTopic) {
      return NextResponse.json(
        { error: 'Topic already exists' },
        { status: 409 }
      );
    }

    // Create new topic
    const topic = new Topic({
      title,
      tldr,
      aspects,
    });

    await topic.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving topic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 