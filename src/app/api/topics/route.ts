import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';
import { generateTopicContent } from '@/lib/gemini';

// Function to generate a slug and ensure it's unique
async function generateUniqueSlug(title: string, TopicModel: any) {
  // Generate the base slug
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Make it unique
  let uniqueSlug = baseSlug;
  let count = 1;
  
  while (await TopicModel.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${count}`;
    count++;
  }
  
  return uniqueSlug;
}

export async function POST(request: Request) {
  try {
    const startTime = performance.now();
    const data = await request.json();
    const { title, tldr, aspects, related } = data;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    console.log('[POST /api/topics] Creating or finding topic:', title);
    await connectDB();

    // Check if topic already exists by title or slug
    const TopicModel = Topic as Model<any>;
    const estimatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    console.log('[POST /api/topics] Checking for existing topic with title or slug', { title, estimatedSlug });
    
    const existingTopic = await TopicModel.findOne({
      $or: [
        { title },
        { slug: estimatedSlug }
      ]
    });
    
    if (existingTopic) {
      console.log('[POST /api/topics] Found existing topic:', { 
        id: existingTopic._id, 
        title: existingTopic.title, 
        slug: existingTopic.slug 
      });
      const endTime = performance.now();
      console.log(`[POST /api/topics] Returned existing topic in ${(endTime - startTime).toFixed(2)}ms`);
      return NextResponse.json(existingTopic);
    }

    console.log('[POST /api/topics] No existing topic found, creating new topic');
    
    // If only title is provided, generate content
    let topicData = {
      title,
      slug: await generateUniqueSlug(title, TopicModel), // Explicitly set slug
      tldr,
      aspects,
      related: related || [],
      searchResults: {
        books: [],
        videos: [],
        wiki: [],
        lastUpdated: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (!tldr || !aspects) {
      console.log('[POST /api/topics] Missing tldr or aspects, generating content with Gemini API');
      const contentStartTime = performance.now();
      const content = await generateTopicContent(title);
      const contentEndTime = performance.now();
      console.log(`[POST /api/topics] Content generated with Gemini in ${(contentEndTime - contentStartTime).toFixed(2)}ms`);
      
      topicData = {
        ...topicData,
        tldr: content.tldr,
        aspects: content.aspects,
        related: content.related || []
      };
    } else {
      console.log('[POST /api/topics] Using provided content (no Gemini call needed)');
    }

    // Create new topic
    console.log('[POST /api/topics] Saving new topic');
    const topic = new Topic(topicData);
    await topic.save();

    // Ensure we have the complete topic with generated slug
    const savedTopic = await TopicModel.findById(topic._id);
    console.log('[POST /api/topics] Topic saved with generated slug:', savedTopic.slug);
    
    // Return the complete topic
    const endTime = performance.now();
    console.log(`[POST /api/topics] Created and returned new topic in ${(endTime - startTime).toFixed(2)}ms`);
    return NextResponse.json(savedTopic);
  } catch (error) {
    console.error('[POST /api/topics] Error saving topic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 