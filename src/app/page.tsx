import { Container, Typography, Box } from '@mui/material';
import SearchBox from '@/components/SearchBox';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { Card, CardContent, Grid } from '@mui/material';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';

export default async function Home() {
  // Read topics from file
  const filePath = path.join(process.cwd(), 'featured_topics.txt');
  const content = fs.readFileSync(filePath, 'utf-8');
  const topics = content.split('\n').filter(Boolean).slice(0, 6); // first 6 topics

  // Fetch TLDRs from DB
  await connectDB();
  const TopicModel = Topic as Model<any>;
  const topicDocs = await TopicModel.find({ title: { $in: topics } }).select('title tldr').lean();

  // Map to ensure order matches file
  const topicMap = Object.fromEntries(topicDocs.map(t => [t.title, t.tldr]));

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'medium' }}>
          KNOWRA
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Explore topics through interactive learning cards
        </Typography>
        
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <SearchBox />
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Featured Topics
          </Typography>
          <Grid container spacing={3}>
            {topics.map(topic => (
              <Grid item xs={12} sm={6} key={topic}>
                <Link href={`/topic/${encodeURIComponent(topic)}`} style={{ textDecoration: 'none' }}>
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
      </Box>
    </Container>
  );
} 