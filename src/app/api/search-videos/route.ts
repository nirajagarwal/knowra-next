import { NextResponse } from 'next/server';

const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEO_API = 'https://www.googleapis.com/youtube/v3/videos';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not found');
    }

    // First, search for videos
    const searchResponse = await fetch(
      `${YOUTUBE_API}?part=snippet&q=${encodeURIComponent(topic)}&type=video&maxResults=6&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to fetch videos');
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items?.length) {
      return NextResponse.json({ videos: [] });
    }

    // Get video IDs
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // Get detailed video information
    const videoResponse = await fetch(
      `${YOUTUBE_VIDEO_API}?part=snippet,contentDetails&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video details');
    }

    const videoData = await videoResponse.json();

    // Transform the results
    const videos = videoData.items.map((item: any) => ({
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString('en-US', { year: 'numeric' }),
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      videoId: item.id,
      url: `https://www.youtube.com/watch?v=${item.id}`
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error searching videos:', error);
    return NextResponse.json({ videos: [] });
  }
} 