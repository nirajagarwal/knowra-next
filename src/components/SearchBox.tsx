'use client';

import { useState, useEffect, useRef } from 'react';
import { TextField, Autocomplete, IconButton, Box, InputAdornment, CircularProgress, Paper, List, ListItem, ListItemText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';
import { generateTopicContent } from '@/lib/gemini';
import Spinner from './Spinner';

interface SearchSuggestion {
  title: string;
  slug: string;
}

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const createAndNavigateToTopic = async (topicTitle: string) => {
    setIsCreating(true);
    try {
      // First check if the topic exists by title with an exact search
      const response = await fetch(`/api/search?q=${encodeURIComponent(topicTitle)}`);
      const data = await response.json();
      
      // Look for an exact case-insensitive match
      const exactTitleMatch = data.suggestions.find(
        (s: SearchSuggestion) => s.title.toLowerCase() === topicTitle.toLowerCase()
      );
      
      if (exactTitleMatch?.slug) {
        // Topic exists with a valid slug, navigate to it
        router.push(`/${exactTitleMatch.slug}`);
        return;
      }
      
      if (exactTitleMatch) {
        // Topic exists but slug might be missing, try to fetch directly
        try {
          const encodedTitle = encodeURIComponent(topicTitle);
          router.push(`/${encodedTitle}`);
          return;
        } catch (err) {
          console.error('Error navigating by title:', err);
          // Continue to content generation as fallback
        }
      }
      
      // Topic doesn't exist, create it
      const createResponse = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: topicTitle }),
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create topic');
      }

      const newTopic = await createResponse.json();
      
      if (newTopic?.slug) {
        router.push(`/${newTopic.slug}`);
      } else {
        // Fallback to title for navigation if no slug
        const encodedTitle = encodeURIComponent(topicTitle);
        router.push(`/${encodedTitle}`);
      }
    } catch (error) {
      console.error('Error creating new topic:', error);
    } finally {
      setIsCreating(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  const handleTopicSelect = async (suggestion: SearchSuggestion) => {
    if (!suggestion) return;
    await createAndNavigateToTopic(suggestion.title);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      
      // If there's an exact match in suggestions, use that
      const exactMatch = suggestions.find(
        suggestion => suggestion.title.toLowerCase() === searchQuery.toLowerCase()
      );
      
      if (exactMatch) {
        await handleTopicSelect(exactMatch);
      } else {
        // Create a new topic with the search query as title
        await createAndNavigateToTopic(searchQuery);
      }
    }
  };

  return (
    <Box ref={searchRef} sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search topics..."
        size="small"
        disabled={isCreating}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: isCreating ? (
            <InputAdornment position="end">
              <Spinner size={16} />
            </InputAdornment>
          ) : null
        }}
      />
      {suggestions.length > 0 && !isCreating && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: '300px',
            overflow: 'auto'
          }}
        >
          <List disablePadding>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleTopicSelect(suggestion)}
                sx={{
                  py: 0.5,
                  px: 2,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
              >
                <ListItemText 
                  primary={suggestion.title}
                  sx={{
                    m: 0,
                    '& .MuiTypography-root': {
                      fontSize: '0.95rem',
                      lineHeight: 1.2,
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
} 