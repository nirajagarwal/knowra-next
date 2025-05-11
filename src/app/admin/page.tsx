'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { generateTopicContent } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';

export default function AdminPage() {
  const [topics, setTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const topicList = topics.split('\n').filter(t => t.trim());

    try {
      for (const topic of topicList) {
        const content = await generateTopicContent(topic);
        
        await fetch('/api/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: topic,
            ...content,
          }),
        });
      }

      setSuccess(`Successfully generated content for ${topicList.length} topics`);
      setTopics('');
    } catch (error) {
      setError('Error generating content. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin - Generate Topic Content
        </Typography>

        <Paper sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="Enter topics, one per line"
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading || !topics.trim()}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Content'}
            </Button>
          </form>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
} 