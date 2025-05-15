'use client';

import { useState } from 'react';
import { TextField, Autocomplete, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';
import { generateTopicContent } from '@/lib/gemini';
import Spinner from './Spinner';

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    if (value.length > 2) {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleTopicSelect = async (topic: string) => {
    if (!topic) return;
    
    setIsLoading(true);
    try {
      // First check if the topic exists
      const response = await fetch(`/api/search?q=${encodeURIComponent(topic)}`);
      const data = await response.json();
      
      if (data.suggestions.includes(topic)) {
        // Topic exists, navigate to it
        router.push(`/${encodeURIComponent(topic)}`);
      } else {
        // Topic doesn't exist, generate content and create it
        const content = await generateTopicContent(topic);
        
        const createResponse = await fetch('/api/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: topic,
            tldr: content.tldr,
            aspects: content.aspects,
            related: content.related || [],
          }),
        });
        
        if (!createResponse.ok) {
          throw new Error('Failed to create topic');
        }

        // Wait for the topic to be created and indexed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the topic exists before navigating
        const verifyResponse = await fetch(`/api/search?q=${encodeURIComponent(topic)}`);
        const verifyData = await verifyResponse.json();
        
        if (verifyData.suggestions.includes(topic)) {
          router.push(`/${encodeURIComponent(topic)}`);
        } else {
          throw new Error('Topic creation verification failed');
        }
      }
    } catch (error) {
      console.error('Error handling topic selection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Autocomplete
        freeSolo
        options={suggestions}
        inputValue={searchQuery}
        onInputChange={(_, value) => handleSearch(value)}
        onChange={(_, value) => value && handleTopicSelect(value)}
        sx={{ width: '100%' }}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            variant="outlined"
            placeholder="Search for a topic..."
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px 0 0 4px',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderWidth: '1px'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderRight: 'none'
                }
              },
            }}
          />
        )}
      />
      <IconButton
        onClick={() => searchQuery && handleTopicSelect(searchQuery)}
        disabled={isLoading}
        sx={{
          height: '40px',
          width: '40px',
          borderRadius: '0 4px 4px 0',
          backgroundColor: 'primary.main',
          color: 'white',
          border: '1px solid',
          borderColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark',
            borderColor: 'primary.dark',
          },
          '&.Mui-disabled': {
            backgroundColor: 'primary.main',
            borderColor: 'primary.main',
            opacity: 0.7,
          },
        }}
      >
        {isLoading ? (
          <Spinner size={20} color="inherit" />
        ) : (
          <SearchIcon />
        )}
      </IconButton>
    </Box>
  );
} 