import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';
import { generateTopicContent } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, tldr, aspects, related } = data;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
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

    // If only title is provided, generate content
    let topicData = {
      title,
      tldr,
      aspects,
      related: related || [],
      searchResults: {
        books: [],
        videos: [],
        wiki: [],
        lastUpdated: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!tldr || !aspects) {
      const content = await generateTopicContent(title);
      topicData = {
        ...topicData,
        tldr: content.tldr,
        aspects: content.aspects,
        related: content.related || []
      };
    }

    // Create new topic
    const topic = new Topic(topicData);
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