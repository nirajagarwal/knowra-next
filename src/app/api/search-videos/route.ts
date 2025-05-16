import { NextResponse } from 'next/server';

const BRAVE_VIDEO_API = 'https://api.search.brave.com/res/v1/videos/search';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!process.env.BRAVE_API_KEY) {
      throw new Error('Brave API key not found');
    }

    const searchUrl = `${BRAVE_VIDEO_API}?q=${encodeURIComponent(topic)}&count=9&search_lang=en&safesearch=moderate`;
    console.log('Searching Brave with URL:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': process.env.BRAVE_API_KEY
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
    console.log('Brave API response:', data);

    if (!data.results?.length) {
      console.log('No video results found');
      return NextResponse.json({ videos: [] });
    }

    // Transform the results to match our Video interface
    const videos = data.results.map((item: any) => ({
      title: item.title,
      channelTitle: item.video.creator || item.video.publisher,
      publishedAt: item.age,
      description: item.description,
      thumbnailUrl: item.thumbnail.src,
      videoId: item.url, // Using the URL as the ID since Brave doesn't provide a separate video ID
      url: item.url
    })).slice(0, 9);

    console.log('Transformed videos:', videos);

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error searching videos:', error);
    return NextResponse.json({ videos: [] });
  }
} 