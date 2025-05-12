import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import TopicCard from '@/components/TopicCard';
import { generateTopicContent } from '@/lib/gemini';
import { Model } from 'mongoose';
import TopicPageClient from './TopicPageClient';

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
  
  const TopicModel = Topic as Model<any>;
  return TopicModel.findOne({ title: decodedSlug });
}

async function createTopic(title: string) {
  try {
    const content = await generateTopicContent(title);

    if (!content || !content.tldr || !Array.isArray(content.aspects)) {
      throw new Error('Invalid content structure');
    }

    const topic = new Topic({
      title,
      tldr: content.tldr,
      aspects: content.aspects.map(aspect => ({
        caption: aspect.caption,
        thingsToKnow: aspect.thingsToKnow || []
      }))
    });

    await topic.save();
    return topic;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
}

export default async function TopicPage({ params }: TopicPageProps) {
  try {
    const decodedSlug = decodeURIComponent(params.slug);
    
    let topic = await getTopic(decodedSlug);

    if (!topic) {
      topic = await createTopic(decodedSlug);
    }

    if (!topic) {
      notFound();
    }

    // Ensure the data structure is valid before rendering
    const safeTopic = {
      title: topic.title || '',
      tldr: topic.tldr || '',
      aspects: (topic.aspects || []).map(aspect => ({
        caption: aspect.caption || '',
        thingsToKnow: (aspect.thingsToKnow || []).filter(Boolean)
      }))
    };

    return <TopicPageClient topic={safeTopic} />;
  } catch (error) {
    console.error('Error in TopicPage:', error);
    notFound();
  }
} 