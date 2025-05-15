import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TopicPageClient from './TopicPageClient';
import { getTopic } from '@/lib/topics';

interface TopicPageProps {
  params: {
    topic: string;
  };
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const topic = await getTopic(params.topic);
  
  if (!topic) {
    return {
      title: 'Topic Not Found',
    };
  }

  return {
    title: topic.title,
    description: topic.tldr,
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const topic = await getTopic(params.topic);

  if (!topic) {
    notFound();
  }

  return <TopicPageClient topic={topic} />;
} 