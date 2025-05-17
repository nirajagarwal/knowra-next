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
  title: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
  thumbnailUrl: string;
  videoId: string;
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
  const [isLoading, setIsLoading] = useState({
    books: false,
    videos: false,
    wiki: false
  });
  const [error, setError] = useState<string | null>(null);

  const fetchSectionResults = async (section: 'books' | 'videos' | 'wiki') => {
    setIsLoading(prev => ({ ...prev, [section]: true }));
    setError(null);

    try {
      // First try to get results from MongoDB
      const response = await fetch(`/api/topics/${encodeURIComponent(topic)}`);
      const data = await response.json();

      if (data.searchResults?.[section]?.length) {
        // If we have cached results, use them
        setResults(prev => ({
          ...prev,
          [section]: data.searchResults[section]
        }));
        setIsLoading(prev => ({ ...prev, [section]: false }));
        return;
      }

      // If no cached results, fetch from API
      const apiEndpoint = {
        books: '/api/search-books',
        videos: '/api/search-videos',
        wiki: '/api/search-wikipedia'
      }[section];

      const apiResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const apiData = await apiResponse.json();
      const newResults = apiData[section] || [];

      // Update MongoDB with new results
      const updateResponse = await fetch(`/api/topics/${encodeURIComponent(topic)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchResults: {
            ...results,
            [section]: newResults
          }
        })
      });

      if (!updateResponse.ok) {
        console.error('Failed to update MongoDB:', await updateResponse.text());
      }

      setResults(prev => ({
        ...prev,
        [section]: newResults
      }));
    } catch (err) {
      setError(`Failed to fetch ${section} results`);
      console.error(`Error fetching ${section} results:`, err);
    } finally {
      setIsLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  return { results, isLoading, error, fetchSectionResults };
} 