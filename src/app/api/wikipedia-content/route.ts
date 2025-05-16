import { NextResponse } from 'next/server';

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const MAX_CONTENT_LENGTH = 50000; // characters

export async function POST(req: Request) {
  try {
    const { title } = await req.json();

    // Get full page content
    const response = await fetch(
      `${WIKIPEDIA_API}?action=query&titles=${encodeURIComponent(title)}&prop=extracts&explaintext=1&format=json&origin=*`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Wikipedia content');
    }

    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const content = pages[pageId].extract || '';

    // Truncate content if it's too long
    const truncatedContent = content.length > MAX_CONTENT_LENGTH 
      ? content.slice(0, MAX_CONTENT_LENGTH) + '...'
      : content;

    return NextResponse.json({ content: truncatedContent });
  } catch (error) {
    console.error('Error fetching Wikipedia content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Wikipedia content' },
      { status: 500 }
    );
  }
} 