import { useState, useEffect } from 'react';

export interface Book {
  title: string;
  authors: string[];
  publishedYear: string;
  description: string;
  thumbnail: string;
  url: string;
}

export interface Video {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  url: string;
}

export interface WikiPage {
  title: string;
  extract: string;
  thumbnail: string;
  url: string;
}

interface SearchResults {
  books: Book[];
  videos: Video[];
  wiki: WikiPage[];
}

export function useSearchResults(topic: string) {
  const [results, setResults] = useState<SearchResults>({
    books: [],
    videos: [],
    wiki: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First try to get results from MongoDB
        const response = await fetch(`/api/topics/${encodeURIComponent(topic)}`);
        const data = await response.json();
        console.log('MongoDB response:', data);

        if (data.searchResults?.books?.length || data.searchResults?.videos?.length || data.searchResults?.wiki?.length) {
          // If we have cached results, use them
          console.log('Using cached results:', data.searchResults);
          setResults({
            books: data.searchResults.books || [],
            videos: data.searchResults.videos || [],
            wiki: data.searchResults.wiki || []
          });
          setIsLoading(false);
          return;
        }

        // If no cached results, fetch from APIs
        console.log('Fetching from APIs...');
        const [booksResponse, videosResponse, pagesResponse] = await Promise.all([
          fetch('/api/search-books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic })
          }),
          fetch('/api/search-videos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic })
          }),
          fetch('/api/search-wikipedia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic })
          })
        ]);

        const [booksData, videosData, pagesData] = await Promise.all([
          booksResponse.json(),
          videosResponse.json(),
          pagesResponse.json()
        ]);

        console.log('API responses:', {
          books: booksData,
          videos: videosData,
          wiki: pagesData
        });

        const newResults = {
          books: booksData.books || [],
          videos: videosData.videos || [],
          wiki: pagesData.wiki || []
        };

        // Update MongoDB with new results
        console.log('Updating MongoDB with new results:', newResults);
        const updateResponse = await fetch(`/api/topics/${encodeURIComponent(topic)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            searchResults: newResults
          })
        });

        if (!updateResponse.ok) {
          console.error('Failed to update MongoDB:', await updateResponse.text());
        }

        setResults(newResults);
      } catch (err) {
        setError('Failed to fetch search results');
        console.error('Error fetching search results:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (topic) {
      fetchResults();
    }
  }, [topic]);

  return { results, isLoading, error };
} 