import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { generateTopicContent } from '@/lib/gemini';
import { Model, Document } from 'mongoose';
import TopicPageClient from './TopicPageClient';
import mongoose from 'mongoose';

interface TopicDocument extends Document {
  title: string;
  tldr: string;
  aspects: Array<{
    caption: string;
    thingsToKnow: string[];
  }>;
  related: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface TopicPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug);
  
  try {
    await connectDB();
    const TopicModel = Topic as Model<any>;
    const topic = await TopicModel.findOne({ title: decodedSlug }).lean();

    if (topic) {
      return {
        title: `${decodedSlug} | Knowra`,
        description: topic.tldr,
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Topic Not Found | Knowra',
  };
}

async function getTopic(slug: string) {
  await connectDB();
  const decodedSlug = decodeURIComponent(slug);
  
  const TopicModel = Topic as Model<TopicDocument>;
  const topic = await TopicModel.findOne({ title: decodedSlug });
  
  if (!topic) return null;

  // Convert to plain object and ensure all data is serializable
  const plainTopic = JSON.parse(JSON.stringify(topic));

  // Ensure the data structure is valid
  return {
    title: String(plainTopic.title || ''),
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

async function createTopic(title: string) {
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
    const db = mongoose.connection.db;
    const collection = db.collection('topics');

    try {
      const result = await collection.insertOne(topicData);
      const savedTopic = await collection.findOne({ title });
      return savedTopic;
    } catch (saveError) {
      console.error('Error saving topic to MongoDB:', saveError);
      if (saveError instanceof Error) {
        console.error('Save error details:', saveError.message);
        console.error('Save error stack:', saveError.stack);
      }
      throw saveError;
    }
  } catch (error) {
    console.error('Error in createTopic:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

export default async function TopicPage({ params }: TopicPageProps) {
  try {
    const { slug } = params;
    const decodedSlug = decodeURIComponent(slug);

    await connectDB();
    
    const TopicModel = Topic as Model<TopicDocument>;
    let topic = await TopicModel.findOne({ title: decodedSlug });

    // If topic doesn't exist, create it
    if (!topic) {
      await createTopic(decodedSlug);
      topic = await TopicModel.findOne({ title: decodedSlug });
    } else {
      // If topic exists but has no related items, update it
      if (!Array.isArray(topic.related) || topic.related.length === 0) {
        const content = await generateTopicContent(decodedSlug);
        if (content && Array.isArray(content.related)) {
          const db = mongoose.connection.db;
          const collection = db.collection('topics');
          await collection.updateOne(
            { title: decodedSlug },
            { $set: { related: content.related } }
          );
          // Fetch the updated topic
          topic = await TopicModel.findOne({ title: decodedSlug });
        }
      }
    }

    if (!topic) {
      notFound();
    }

    // Convert to plain object and ensure all data is serializable
    const serializedTopic = JSON.parse(JSON.stringify(topic));

    return <TopicPageClient topic={serializedTopic} />;
  } catch (error) {
    console.error('Error in TopicPage:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    notFound();
  }
} 