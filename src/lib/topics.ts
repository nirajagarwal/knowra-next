import { Model, Document } from 'mongoose';
import connectDB from './mongodb';
import Topic from '@/models/Topic';
import { generateTopicContent } from './gemini';
import mongoose from 'mongoose';

interface TopicDocument extends Document {
  title: string;
  slug: string;
  tldr: string;
  aspects: Array<{
    caption: string;
    thingsToKnow: string[];
  }>;
  related: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getTopic(slugOrTitle: string) {
  await connectDB();
  const decodedValue = decodeURIComponent(slugOrTitle);
  
  const TopicModel = Topic as Model<TopicDocument>;
  
  // Try to find by slug first
  let topic = await TopicModel.findOne({ slug: decodedValue.toLowerCase() });
  
  // If not found by slug, try to find by title (for backward compatibility)
  if (!topic) {
    topic = await TopicModel.findOne({ title: decodedValue });
  }
  
  if (!topic) return null;

  // Convert to plain object and ensure all data is serializable
  const plainTopic = JSON.parse(JSON.stringify(topic));

  // Ensure the data structure is valid
  return {
    title: String(plainTopic.title || ''),
    slug: String(plainTopic.slug || ''),
    tldr: String(plainTopic.tldr || ''),
    aspects: Array.isArray(plainTopic.aspects) ? plainTopic.aspects.map(aspect => ({
      caption: String(aspect.caption || ''),
      thingsToKnow: Array.isArray(aspect.thingsToKnow) ? 
        aspect.thingsToKnow.map(item => String(item || '')) : []
    })) : [],
    related: Array.isArray(plainTopic.related) ? 
      plainTopic.related.map(item => String(item || '')) : []
  };
}

export async function createTopic(title: string) {
  try {
    const content = await generateTopicContent(title);

    if (!content || !content.tldr || !Array.isArray(content.aspects)) {
      throw new Error('Invalid content structure');
    }

    // Convert to plain object and ensure all data is serializable
    const plainContent = JSON.parse(JSON.stringify(content));

    // Prepare the data
    const topicData = {
      title,
      tldr: String(plainContent.tldr || ''),
      aspects: plainContent.aspects.map(aspect => ({
        caption: String(aspect.caption || ''),
        thingsToKnow: Array.isArray(aspect.thingsToKnow) ? 
          aspect.thingsToKnow.map(item => String(item || '')) : []
      })),
      related: Array.isArray(plainContent.related) ? 
        plainContent.related.map(item => String(item || '')).filter(Boolean) : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Connect to MongoDB
    await connectDB();
    const TopicModel = Topic as Model<TopicDocument>;

    // Create new topic (slug will be generated automatically)
    const topic = new TopicModel(topicData);
    await topic.save();

    return getTopic(topic.slug);
  } catch (error) {
    console.error('Error in createTopic:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
} 