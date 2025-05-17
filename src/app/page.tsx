import { Container, Typography, Box } from '@mui/material';
import SearchBox from '@/components/SearchBox';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';
import FeaturedTopics from '@/components/FeaturedTopics';
import { contentCache } from '@/lib/gemini';

interface TopicInfo {
  title: string;
  slug: string;
  summary: string;
}

export default async function Home() {
  // Read topics from file to maintain order
  const filePath = path.join(process.cwd(), 'featured_topics.txt');
  const content = fs.readFileSync(filePath, 'utf-8');
  const topicTitles = content.split('\n').filter(Boolean);

  // Fetch topics from DB with titles, slugs, and TLDRs
  await connectDB();
  const TopicModel = Topic as Model<any>;
  const topicDocs = await TopicModel.find(
    { title: { $in: topicTitles } }
  ).select('title slug tldr').lean();

  // Create a map for quick lookup
  const topicDocsMap = new Map(topicDocs.map(doc => [doc.title, doc]));

  // Create topic info objects with slugs, maintaining file order
  const topicInfos: TopicInfo[] = topicTitles
    .filter(title => topicDocsMap.has(title))
    .map(title => {
      const doc = topicDocsMap.get(title)!;
      return {
        title: doc.title,
        slug: doc.slug || doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        summary: doc.tldr
      };
    });

  // Cache TLDRs for future use
  topicInfos.forEach(topic => {
    contentCache.set(`tldr:${topic.title}`, topic.summary);
  });

  // Get the first 6 topics from the file order
  const initialTopics = topicInfos.slice(0, 6);

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
          allTopics={topicInfos}
        />
      </Box>
    </Container>
  );
} 