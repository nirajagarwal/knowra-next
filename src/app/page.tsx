'use client';

import { useState } from 'react';
import { Container, Typography, Box, TextField, Autocomplete } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
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
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" gutterBottom>
          KNOWRA
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Explore topics through interactive learning cards
        </Typography>
        
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'white',
                  },
                }}
              />
            )}
          />
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Featured Topics
          </Typography>
          {/* Featured topics will be added here */}
        </Box>
      </Box>
    </Container>
  );
} 