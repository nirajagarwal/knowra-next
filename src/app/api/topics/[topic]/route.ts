import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { topic: string } }
) {
  try {
    console.log('API GET /api/topics/[topic] called with:', params.topic);
    
    await connectDB();
    const TopicModel = Topic as Model<any>;
    
    // Try to find by slug first (case insensitive)
    const lowercaseSlug = params.topic.toLowerCase();
    console.log('Looking up topic by slug:', lowercaseSlug);
    
    const topic = await TopicModel.findOne({ slug: lowercaseSlug });
    
    if (!topic) {
      console.log('Topic not found by slug, trying title as fallback');
      // Try by title as fallback
      const topicByTitle = await TopicModel.findOne({ title: params.topic });
      
      if (!topicByTitle) {
        console.log('Topic not found by title either, returning 404');
        return NextResponse.json({ 
          error: 'Topic not found',
          requestedSlug: params.topic,
          lowercaseSlug: lowercaseSlug
        }, { status: 404 });
      }
      
      console.log('Topic found by title:', topicByTitle.title, 'with slug:', topicByTitle.slug);
      return NextResponse.json(topicByTitle);
    }
    
    console.log('Topic found by slug:', topic.title, 'with slug:', topic.slug);
    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { topic: string } }
) {
  try {
    const data = await request.json();
    await connectDB();
    const TopicModel = Topic as Model<any>;
    const topic = await TopicModel.findOneAndUpdate(
      { slug: params.topic.toLowerCase() },
      { $set: data },
      { new: true }
    );

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 