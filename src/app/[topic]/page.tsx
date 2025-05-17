import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TopicPageClient from './TopicPageClient';
import { getTopic } from '@/lib/topics';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';
import fs from 'fs';
import path from 'path';

interface TopicPageProps {
  params: {
    topic: string;
  };
}

// Allow dynamic rendering in development, but use ISR in production
export const dynamic = process.env.NODE_ENV === 'development' ? 'force-dynamic' : 'auto';
export const revalidate = 3600; // Revalidate every hour in production

// Pre-generate pages for featured topics only
export async function generateStaticParams() {
  try {
    // Read the featured topics file
    const filePath = path.join(process.cwd(), 'featured_topics.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    const featuredTopicTitles = content.split('\n').filter(Boolean);
    
    await connectDB();
    const TopicModel = Topic as Model<any>;
    
    // Only generate static paths for featured topics
    const topics = await TopicModel.find({
      title: { $in: featuredTopicTitles }
    }).select('slug');
    
    const params = topics.map(topic => ({
      topic: topic.slug
    }));
    
    return params;
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const topic = await getTopic(params.topic);
  
  if (!topic) {
    return {
      title: 'Topic Not Found | KNOWRA',
      description: 'The requested topic could not be found.',
    };
  }

  // Get the first aspect's first point as a preview if available
  const firstPoint = topic.aspects[0]?.thingsToKnow[0] || '';
  
  // Create a description that combines TLDR and first point
  const description = `${topic.tldr} ${firstPoint}`.trim();
  
  // Get related topics as keywords
  const keywords = [...(topic.related || []), topic.title];

  return {
    title: `${topic.title} - Learn on KNOWRA`,
    description: description,
    keywords: keywords,
    openGraph: {
      title: `${topic.title} - Learn on KNOWRA`,
      description: description,
      type: 'article',
      url: `https://knowra.ai/${topic.slug}`,
      siteName: 'KNOWRA',
      locale: 'en_US',
      images: [
        {
          url: 'https://knowra.ai/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `Learn about ${topic.title} on KNOWRA`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${topic.title} - Learn on KNOWRA`,
      description: description,
      creator: '@knowra_tweets',
      images: ['https://knowra.ai/og-image.jpg'],
    },
    alternates: {
      canonical: `https://knowra.ai/${topic.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  // Get the topic data
  const topic = await getTopic(params.topic);
  
  if (!topic) {
    notFound();
  }
  
  return <TopicPageClient topic={topic} />;
} 