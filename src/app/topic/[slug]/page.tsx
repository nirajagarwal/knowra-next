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

export async function generateMetadata({ params }: TopicPageProps) {
  try {
    const topic = await getTopic(params.slug);
    
    if (!topic) {
      return {
        title: 'Topic Not Found',
      };
    }

    return {
      title: `${topic.title} - Knowra`,
      description: topic.tldr,
      openGraph: {
        title: topic.title,
        description: topic.tldr,
        type: 'article',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
    };
  }
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
    console.log('Content from Gemini:', JSON.stringify(content, null, 2));

    if (!content || !content.tldr || !Array.isArray(content.aspects)) {
      throw new Error('Invalid content structure');
    }

    // Convert to plain object and ensure all data is serializable
    const plainContent = JSON.parse(JSON.stringify(content));
    console.log('Plain content:', JSON.stringify(plainContent, null, 2));

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

    console.log('Topic data before save:', JSON.stringify(topicData, null, 2));

    // Connect to MongoDB
    await connectDB();
    const db = mongoose.connection.db;
    const collection = db.collection('topics');

    try {
      console.log('Attempting to save topic to MongoDB...');
      const result = await collection.insertOne(topicData);
      console.log('Topic saved successfully:', result);

      // Verify the saved data
      const savedTopic = await collection.findOne({ title });
      console.log('Verified saved topic:', JSON.stringify(savedTopic, null, 2));
      console.log('Related field after save:', {
        isArray: Array.isArray(savedTopic?.related),
        value: savedTopic?.related,
        type: typeof savedTopic?.related,
        length: savedTopic?.related?.length
      });

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
    console.log('TopicPage: Starting with params:', params);
    const { slug } = params;
    const decodedSlug = decodeURIComponent(slug);
    console.log('TopicPage: Decoded slug:', decodedSlug);

    await connectDB();
    console.log('TopicPage: Connected to DB');
    
    const TopicModel = Topic as Model<TopicDocument>;
    let topic = await TopicModel.findOne({ title: decodedSlug });
    console.log('TopicPage: Found existing topic:', !!topic);

    // If topic doesn't exist, create it
    if (!topic) {
      console.log('TopicPage: Topic not found, creating new topic...');
      await createTopic(decodedSlug);
      topic = await TopicModel.findOne({ title: decodedSlug });
      console.log('TopicPage: Created new topic:', !!topic);
    } else {
      // If topic exists but has no related items, update it
      if (!Array.isArray(topic.related) || topic.related.length === 0) {
        console.log('TopicPage: Updating existing topic with related items...');
        const content = await generateTopicContent(decodedSlug);
        if (content && Array.isArray(content.related)) {
          const db = mongoose.connection.db;
          const collection = db.collection('topics');
          await collection.updateOne(
            { title: decodedSlug },
            { $set: { related: content.related } }
          );
          console.log('TopicPage: Updated topic with related items');
          // Fetch the updated topic
          topic = await TopicModel.findOne({ title: decodedSlug });
        }
      }
    }

    if (!topic) {
      console.log('TopicPage: No topic found or created, returning 404');
      notFound();
    }

    // Convert to plain object and ensure all data is serializable
    const serializedTopic = JSON.parse(JSON.stringify(topic));
    console.log('TopicPage: Serialized topic:', {
      title: serializedTopic.title,
      hasRelated: Array.isArray(serializedTopic.related),
      relatedLength: serializedTopic.related?.length
    });

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