'use client';

import { useState, useEffect } from 'react';
import { Typography, Box, Grid, Card, CardContent, Button } from '@mui/material';
import Link from 'next/link';
import RefreshIcon from '@mui/icons-material/Refresh';

interface FeaturedTopicsProps {
  initialTopics: string[];
  allTopics: string[];
  topicMap: Record<string, string>;
}

export default function FeaturedTopics({ initialTopics, allTopics, topicMap }: FeaturedTopicsProps) {
  const [currentTopics, setCurrentTopics] = useState(initialTopics);

  const getRandomTopics = () => {
    // Filter out current topics to avoid repetition
    const availableTopics = allTopics.filter(topic => !currentTopics.includes(topic));
    
    // If we have fewer than 6 topics available, use all topics
    if (availableTopics.length < 6) {
      const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 6);
    }
    
    // Otherwise, randomly select from available topics
    const shuffled = [...availableTopics].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  const handleMoreClick = () => {
    setCurrentTopics(getRandomTopics());
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">
          Featured Topics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleMoreClick}
          sx={{ textTransform: 'none' }}
        >
          More
        </Button>
      </Box>
      <Grid container spacing={3}>
        {currentTopics.map(topic => (
          <Grid item xs={12} sm={6} key={topic}>
            <Link href={`/${encodeURIComponent(topic)}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ height: '100%', cursor: 'pointer' }}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {topic}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                    {topicMap[topic] ? topicMap[topic].split('.')[0] + '.' : 'No summary available.'}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 