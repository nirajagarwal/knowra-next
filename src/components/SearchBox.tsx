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
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleTopicSelect = async (suggestion: SearchSuggestion) => {
    if (!suggestion) return;
    
    setIsLoading(true);
    try {
      // First check if the topic exists
      const response = await fetch(`/api/search?q=${encodeURIComponent(suggestion.title)}`);
      const data = await response.json();
      
      const existingSuggestion = data.suggestions.find((s: SearchSuggestion) => s.title === suggestion.title);
      
      if (existingSuggestion) {
        // Topic exists, navigate to it using the slug
        router.push(`/${existingSuggestion.slug}`);
      } else {
        // Topic doesn't exist, generate content and create it
        const content = await generateTopicContent(suggestion.title);
        
        const createResponse = await fetch('/api/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: suggestion.title,
            tldr: content.tldr,
            aspects: content.aspects,
            related: content.related || [],
          }),
        });
        
        if (!createResponse.ok) {
          throw new Error('Failed to create topic');
        }

        const newTopic = await createResponse.json();
        router.push(`/${newTopic.slug}`);
      }
    } catch (error) {
      console.error('Error handling topic selection:', error);
    } finally {
      setIsLoading(false);
      setSearchQuery('');
      setSuggestions([]);
    }
  };

  return (
    <Box ref={searchRef} sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search topics..."
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: isLoading ? (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ) : null
        }}
      />
      {suggestions.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 1,
            maxHeight: '300px',
            overflow: 'auto'
          }}
        >
          <List>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                button
                onClick={() => handleTopicSelect(suggestion)}
              >
                <ListItemText primary={suggestion.title} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
} 