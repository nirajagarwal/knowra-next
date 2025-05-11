import { NextResponse } from 'next/server';
import { generateDetailedContent } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import TopicImport from '@/models/Topic';
const Topic: any = TopicImport;

export async function POST(request: Request) {
  try {
    const { topic, text } = await request.json();

    if (!topic || !text) {
      return new NextResponse('Topic and text are required', { status: 400 });
    }

    await connectDB();

    // Find the topic and check if we have cached content
    const topicDoc = await Topic.findOne({ title: topic });
    if (!topicDoc) {
      return new NextResponse('Topic not found', { status: 404 });
    }

    // Look for the text in all aspects
    let cachedContent = null;
    let lastUpdated = null;

    for (const aspect of topicDoc.aspects) {
      const thing = aspect.thingsToKnow.find(t => t.text === text);
      if (thing && thing.markdownContent && thing.lastUpdated) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (thing.lastUpdated > thirtyDaysAgo) {
          cachedContent = thing.markdownContent;
          lastUpdated = thing.lastUpdated;
          break;
        }
      }
    }

    let content;
    if (cachedContent && typeof cachedContent === 'string') {
      content = cachedContent;
    } else {
      // Generate new content if not cached or cache is invalid
      content = await generateDetailedContent(topic, text);

      // Update the topic document with the new content
      for (const aspect of topicDoc.aspects) {
        const thing = aspect.thingsToKnow.find(t => t.text === text);
        if (thing) {
          thing.markdownContent = content;
          thing.lastUpdated = new Date();
          break;
        }
      }

      await topicDoc.save();
    }

    return new NextResponse(content, {
      headers: { 'Content-Type': 'text/markdown' }
    });
  } catch (error) {
    console.error('Error in generate-content API:', error);
    return new NextResponse('Failed to generate content', { status: 500 });
  }
} 