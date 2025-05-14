import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';
import { Box, Typography, Paper, Container, Divider } from '@mui/material';

interface DebugPageProps {
  params: {
    slug: string;
  };
}

async function getTopic(slug: string) {
  await connectDB();
  const decodedSlug = decodeURIComponent(slug);
  
  const TopicModel = Topic as Model<any>;
  const topic = await TopicModel.findOne({ title: decodedSlug });
  
  if (!topic) return null;

  // Get raw data
  const rawData = topic.toObject();

  // Clean the data
  const cleanedData = {
    title: typeof topic.title === 'string' ? topic.title : '',
    tldr: typeof topic.tldr === 'string' ? topic.tldr : '',
    aspects: Array.isArray(topic.aspects) ? topic.aspects.map(aspect => ({
      caption: typeof aspect.caption === 'string' ? aspect.caption : '',
      thingsToKnow: Array.isArray(aspect.thingsToKnow) ? 
        aspect.thingsToKnow.filter(item => typeof item === 'string') : []
    })) : [],
    related: Array.isArray(topic.related) ? 
      topic.related.filter(item => typeof item === 'string') : []
  };

  // Format content for display
  const formattedContent = {
    tldr: cleanedData.tldr,
    aspects: cleanedData.aspects.map(aspect => ({
      caption: aspect.caption,
      content: [
        `## ${aspect.caption}`,
        '',
        ...aspect.thingsToKnow.map(point => `- ${point}`)
      ].join('\n')
    }))
  };

  return {
    raw: rawData,
    cleaned: cleanedData,
    formatted: formattedContent,
    validation: {
      title: {
        type: typeof topic.title,
        isString: typeof topic.title === 'string',
        length: typeof topic.title === 'string' ? topic.title.length : 0
      },
      tldr: {
        type: typeof topic.tldr,
        isString: typeof topic.tldr === 'string',
        length: typeof topic.tldr === 'string' ? topic.tldr.length : 0
      },
      aspects: {
        isArray: Array.isArray(topic.aspects),
        length: Array.isArray(topic.aspects) ? topic.aspects.length : 0,
        items: Array.isArray(topic.aspects) ? topic.aspects.map(aspect => ({
          caption: {
            type: typeof aspect.caption,
            isString: typeof aspect.caption === 'string'
          },
          thingsToKnow: {
            isArray: Array.isArray(aspect.thingsToKnow),
            length: Array.isArray(aspect.thingsToKnow) ? aspect.thingsToKnow.length : 0,
            items: Array.isArray(aspect.thingsToKnow) ? 
              aspect.thingsToKnow.map(item => ({
                type: typeof item,
                isString: typeof item === 'string'
              })) : []
          }
        })) : []
      }
    }
  };
}

export default async function DebugTopicPage({ params }: DebugPageProps) {
  try {
    const { slug } = params;
    const topicData = await getTopic(slug);

    if (!topicData) {
      notFound();
    }

    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" gutterBottom>
            Debug View: {topicData.cleaned.title}
          </Typography>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Data Validation
            </Typography>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              backgroundColor: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(topicData.validation, null, 2)}
            </pre>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Raw Data
            </Typography>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              backgroundColor: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(topicData.raw, null, 2)}
            </pre>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cleaned Data
            </Typography>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              backgroundColor: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(topicData.cleaned, null, 2)}
            </pre>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Formatted Content
            </Typography>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              backgroundColor: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(topicData.formatted, null, 2)}
            </pre>
          </Paper>
        </Box>
      </Container>
    );
  } catch (error) {
    console.error('Error in DebugTopicPage:', error);
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" color="error" gutterBottom>
            Error Loading Topic
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {error instanceof Error ? error.message : String(error)}
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }
} 