import { Container, Typography, Box } from '@mui/material';
import SearchBox from '@/components/SearchBox';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';
import FeaturedTopics from '@/components/FeaturedTopics';
import { contentCache } from '@/lib/gemini';

export default async function Home() {
  // Read topics from file
  const filePath = path.join(process.cwd(), 'featured_topics.txt');
  const content = fs.readFileSync(filePath, 'utf-8');
  const allTopics = content.split('\n').filter(Boolean);
  const initialTopics = allTopics.slice(0, 6); // first 6 topics

  // Fetch TLDRs from DB
  await connectDB();
  const TopicModel = Topic as Model<any>;
  const topicDocs = await TopicModel.find({ title: { $in: allTopics } }).select('title tldr').lean();

  // Map to ensure order matches file and cache the TLDRs
  const topicMap = Object.fromEntries(
    topicDocs.map(t => {
      const tldr = t.tldr;
      // Cache the TLDR for future use
      contentCache.set(`tldr:${t.title}`, tldr);
      return [t.title, tldr];
    })
  );

  return (
    <Container maxWidth={false} sx={{ maxWidth: '800px' }}>
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

        <FeaturedTopics
          initialTopics={initialTopics}
          allTopics={allTopics}
          topicMap={topicMap}
        />
      </Box>
    </Container>
  );
} 