'use client';

import { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Link from 'next/link';

interface TopicInfo {
  title: string;
  slug: string;
  summary: string;
}

interface FeaturedTopicsProps {
  initialTopics: TopicInfo[];
  allTopics: TopicInfo[];
}

export default function FeaturedTopics({ initialTopics, allTopics }: FeaturedTopicsProps) {
  const [currentTopics, setCurrentTopics] = useState(initialTopics);

  const handleMoreClick = () => {
    const remainingTopics = allTopics.filter(
      topic => !currentTopics.some(current => current.title === topic.title)
    );
    
    if (remainingTopics.length > 0) {
      const randomTopics = remainingTopics
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(6, remainingTopics.length));
      setCurrentTopics(randomTopics);
    } else {
      // If we've shown all topics, start over
      const randomInitialTopics = allTopics
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(6, allTopics.length));
      setCurrentTopics(randomInitialTopics);
    }
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
          <Grid item xs={12} sm={6} key={topic.title}>
            <Link href={`/${topic.slug}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ height: '100%', cursor: 'pointer' }}>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {topic.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                    {topic.summary ? topic.summary.split('.')[0] + '.' : 'No summary available.'}
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