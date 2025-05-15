import { NextResponse } from 'next/server';

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    // First, search for pages
    const searchResponse = await fetch(
      `${WIKIPEDIA_API}?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&origin=*`
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to fetch Wikipedia pages');
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.query?.search?.length) {
      return NextResponse.json({ wiki: [] });
    }

    // Get page IDs for all search results
    const pageIds = searchData.query.search
      .map((item: any) => item.pageid)
      .join('|');

    // Get page details including images
    const pageResponse = await fetch(
      `${WIKIPEDIA_API}?action=query&pageids=${pageIds}&prop=extracts|pageimages&exintro=1&explaintext=1&pithumbsize=200&format=json&origin=*`
    );

    if (!pageResponse.ok) {
      throw new Error('Failed to fetch Wikipedia page details');
    }

    const pageData = await pageResponse.json();

    // Transform the results
    const wiki = Object.values(pageData.query.pages)
      .map((page: any) => ({
        title: page.title,
        description: page.extract.split('\n')[0], // Get first paragraph
        thumbnail: page.thumbnail?.source || '',
        url: `https://en.wikipedia.org/?curid=${page.pageid}`
      }));

    return NextResponse.json({ wiki });
  } catch (error) {
    console.error('Error searching Wikipedia:', error);
    return NextResponse.json({ wiki: [] });
  }
} 