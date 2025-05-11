import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import TopicCard from '@/components/TopicCard';
import SearchBox from '@/components/SearchBox';
import { generateTopicContent } from '@/lib/gemini';
import { Typography, Box } from '@mui/material';

interface TopicPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: TopicPageProps) {
  try {
    const topic = await getTopic(params.slug);
    
    if (!topic) {
      return {
        title: 'Topic Not Found',
      };
    }

    return {
      title: `${topic.title} - Knowra`,
      description: topic.tldr,
      openGraph: {
        title: topic.title,
        description: topic.tldr,
        type: 'article',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
    };
  }
}

async function getTopic(slug: string) {
  try {
    await connectDB();
    const decodedSlug = decodeURIComponent(slug);
    return Topic.findOne({ title: decodedSlug });
  } catch (error) {
    console.error('Error getting topic:', error);
    return null;
  }
}

async function createTopic(title: string) {
  try {
    console.log('Creating topic for:', title);
    const content = await generateTopicContent(title);
    console.log('Generated content:', content);

    if (!content || !content.tldr || !Array.isArray(content.aspects)) {
      throw new Error('Invalid content structure');
    }

    const topic = new Topic({
      title,
      tldr: content.tldr,
      aspects: content.aspects.map(aspect => ({
        caption: aspect.caption,
        thingsToKnow: aspect.thingsToKnow || []
      }))
    });

    console.log('Saving topic:', topic);
    await topic.save();
    return topic;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
}

export default async function TopicPage({ params }: TopicPageProps) {
  try {
    const decodedSlug = decodeURIComponent(params.slug);
    console.log('Fetching topic for slug:', decodedSlug);
    
    let topic = await getTopic(decodedSlug);

    if (!topic) {
      console.log('Topic not found, creating new topic');
      topic = await createTopic(decodedSlug);
    }

    if (!topic) {
      console.log('Failed to create topic');
      notFound();
    }

    // Ensure the data structure is valid before rendering
    const safeTopic = {
      title: topic.title || '',
      tldr: topic.tldr || '',
      aspects: (topic.aspects || []).map(aspect => ({
        caption: aspect.caption || '',
        thingsToKnow: (aspect.thingsToKnow || []).filter(Boolean)
      }))
    };

    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 },
            py: 2,
            borderBottom: '1px solid #eee',
            background: '#fafbfc',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}
          >
            {safeTopic.title}
          </Typography>
          <Box sx={{ minWidth: 250, maxWidth: 340, ml: 2 }}>
            <SearchBox />
          </Box>
        </Box>
        <TopicCard
          title={safeTopic.title}
          tldr={safeTopic.tldr}
          aspects={safeTopic.aspects}
        />
      </Box>
    );
  } catch (error) {
    console.error('Error in TopicPage:', error);
    notFound();
  }
} 