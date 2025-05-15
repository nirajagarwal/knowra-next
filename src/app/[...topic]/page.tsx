import { redirect } from 'next/navigation';
import { getTopic } from '@/lib/topics';

interface CatchAllPageProps {
  params: {
    topic: string[];
  };
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  // If the route is just a single segment, try to find it as a topic
  if (params.topic.length === 1) {
    const topic = await getTopic(params.topic[0]);
    if (topic) {
      // If it's a valid topic, redirect to the topic page
      redirect(`/${params.topic[0]}`);
    }
  }
  
  // For any other case, redirect to home
  redirect('/');
} 