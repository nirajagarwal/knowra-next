import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ suggestions: [] });
    }

    await connectDB();

    // Perform fuzzy search on topic titles
    const topics = await Topic.find({
      title: { $regex: query, $options: 'i' }
    })
    .select('title')
    .limit(10);

    const suggestions = topics.map(topic => topic.title);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 