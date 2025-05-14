import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, tldr, aspects, related } = data;

    if (!title || !tldr || !aspects) {
      return NextResponse.json(
        { error: 'Title, TLDR, and aspects are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if topic already exists
    const TopicModel = Topic as Model<any>;
    const existingTopic = await TopicModel.findOne({ title });
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
      related: related || [], // Include related topics if provided
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