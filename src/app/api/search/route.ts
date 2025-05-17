import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';

interface TopicResult {
  title: string;
  slug: string;
}

export async function GET(request: Request) {
  try {
    const startTime = performance.now();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ suggestions: [] });
    }

    await connectDB();
    const TopicModel = Topic as Model<any>;

    console.log(`[API] Searching for topics matching: "${query}"`);

    // First check for exact matches by title (case insensitive)
    const exactMatches = await TopicModel.find({
      title: new RegExp(`^${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')
    })
    .select('title slug')
    .limit(3);

    console.log(`[API] Found ${exactMatches.length} exact matches`);

    // Then do a fuzzy search for partial matches
    const fuzzyMatches = await TopicModel.find({
      title: new RegExp(query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'),
      _id: { $nin: exactMatches.map(m => m._id) } // exclude exact matches
    })
    .select('title slug')
    .limit(10 - exactMatches.length);

    console.log(`[API] Found ${fuzzyMatches.length} fuzzy matches`);

    // Combine exact and fuzzy matches, with exact matches first
    const allTopics = [...exactMatches, ...fuzzyMatches];

    // Fix any topics with missing slugs
    const suggestions = allTopics.map(topic => {
      if (!topic.slug || topic.slug === 'undefined') {
        return {
          title: topic.title,
          slug: topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        };
      }
      return {
        title: topic.title,
        slug: topic.slug
      };
    });

    const endTime = performance.now();
    console.log(`[API] Search completed in ${(endTime - startTime).toFixed(2)}ms, returning ${suggestions.length} suggestions`);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 