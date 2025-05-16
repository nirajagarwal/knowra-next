import { NextResponse } from 'next/server';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key not found');
    }

    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(topic)}&maxResults=9&key=${process.env.GOOGLE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data = await response.json();
    
    // Transform and filter the results
    const books = data.items
      ?.filter((item: any) => item.volumeInfo.description) // Filter out books without descriptions
      .map((item: any) => ({
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ['Unknown Author'],
        publishedYear: new Date(item.volumeInfo.publishedDate).getFullYear().toString(),
        description: item.volumeInfo.description,
        thumbnail: item.volumeInfo.imageLinks?.thumbnail?.replace('zoom=1', 'zoom=2') || '',
        url: item.volumeInfo.infoLink
      }))
      .slice(0, 9) || [];

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error searching books:', error);
    return NextResponse.json({ books: [] });
  }
} 