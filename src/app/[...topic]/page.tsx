import { redirect } from 'next/navigation';
import { getTopic } from '@/lib/topics';

interface CatchAllPageProps {
  params: {
    topic: string[];
  };
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  console.log('CatchAllPage received params:', params);
  
  // Skip processing for Next.js internal paths
  if (
    params.topic[0] === '_next' || 
    params.topic.join('/').includes('_next/') ||
    params.topic.includes('favicon.ico') ||
    params.topic.includes('static')
  ) {
    console.log('Skipping Next.js internal path:', params.topic);
    return new Response('Not Found', { status: 404 });
  }
  
  // If the route is just a single segment, try to find it as a topic
  if (params.topic.length === 1) {
    console.log('Single segment route detected, segment:', params.topic[0]);
    const topic = await getTopic(params.topic[0]);
    
    if (topic) {
      console.log('Topic found, redirecting to topic page with slug:', topic.slug);
      // If it's a valid topic, redirect to the topic page using the slug
      redirect(`/${topic.slug}`);
    } else {
      console.log('Topic not found for segment:', params.topic[0]);
    }
  } else {
    console.log('Multi-segment route detected:', params.topic);
  }
  
  // For any other case, redirect to home
  console.log('Redirecting to home');
  redirect('/');
} 