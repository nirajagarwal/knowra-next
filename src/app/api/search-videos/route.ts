import { NextResponse } from 'next/server';

const BRAVE_VIDEO_API = 'https://api.search.brave.com/res/v1/videos/search';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    console.log('Search topic:', topic);

    // Debug log to check environment variables
    console.log('Environment variables check:', {
      BRAVE_API_KEY: process.env.BRAVE_API_KEY ? 'Present' : 'Missing',
      BRAVE_API_KEY_LENGTH: process.env.BRAVE_API_KEY?.length || 0,
      NEXT_PUBLIC_BRAVE_API_KEY: process.env.NEXT_PUBLIC_BRAVE_API_KEY ? 'Present' : 'Missing'
    });

    // Try to use either the regular or public version of the API key
    const apiKey = process.env.BRAVE_API_KEY || process.env.NEXT_PUBLIC_BRAVE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Brave API key not found');
    }

    const searchUrl = `${BRAVE_VIDEO_API}?q=${encodeURIComponent(topic)}&count=9&search_lang=en&safesearch=moderate`;
    console.log('Search URL:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Brave API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response structure:', {
      hasResults: !!data.results,
      resultsLength: data.results?.length || 0,
      firstResult: data.results?.[0] ? 'Present' : 'Missing'
    });
    
    // Log the first result if available
    if (data.results?.[0]) {
      console.log('First result example:', JSON.stringify(data.results[0]).substring(0, 300) + '...');
    }

    if (!data.results?.length) {
      console.log('No results returned from Brave API');
      return NextResponse.json({ videos: [] });
    }

    try {
      // Transform the results to match our Video interface
      const videos = data.results.map((item: any) => ({
        title: item.title,
        channelTitle: item.video?.creator || item.video?.publisher || 'Unknown',
        publishedAt: item.age || 'Unknown date',
        description: item.description || '',
        thumbnailUrl: item.thumbnail?.src || '',
        videoId: item.url, // Using the URL as the ID since Brave doesn't provide a separate video ID
        url: item.url
      })).slice(0, 9);
      
      console.log(`Processed ${videos.length} videos successfully`);
      return NextResponse.json({ videos });
    } catch (mappingError) {
      console.error('Error mapping video results:', mappingError);
      return NextResponse.json({ videos: [], error: 'Error processing video data' });
    }
  } catch (error) {
    console.error('Error searching videos:', error);
    return NextResponse.json({ videos: [] });
  }
} 