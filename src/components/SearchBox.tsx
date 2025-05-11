'use client';

import { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
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

  const handleTopicSelect = (topic: string) => {
    router.push(`/topic/${encodeURIComponent(topic)}`);
  };

  return (
    <Autocomplete
      freeSolo
      options={suggestions}
      inputValue={searchQuery}
      onInputChange={(_, value) => handleSearch(value)}
      onChange={(_, value) => value && handleTopicSelect(value)}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          variant="outlined"
          placeholder="Search for a topic..."
          size="small"
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'white',
              height: 36,
            },
            '& .MuiOutlinedInput-input': {
              py: 0.75,
            },
          }}
        />
      )}
    />
  );
} 