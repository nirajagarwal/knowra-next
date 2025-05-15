import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { topic: string } }
) {
  try {
    await connectDB();
    const TopicModel = Topic as Model<any>;
    const topic = await TopicModel.findOne({ title: params.topic });
    
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
      { title: params.topic },
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