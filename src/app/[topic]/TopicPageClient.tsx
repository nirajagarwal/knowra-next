'use client';

import { Typography, Box, Container, IconButton, Link } from '@mui/material';
import { useRouter } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import TopicCard from '@/components/TopicCard';
import SearchBox from '@/components/SearchBox';

interface TopicPageClientProps {
  topic: {
    title: string;
    tldr: string;
    aspects: Array<{
      caption: string;
      thingsToKnow: string[];
    }>;
    related?: string[];
  };
}

export default function TopicPageClient({ topic }: TopicPageClientProps) {
  const router = useRouter();

  if (!topic || typeof topic !== 'object') {
    return (
      <Container maxWidth="lg" sx={{ px: 1, height: '100vh', display: 'flex', flexDirection: 'column', mt: 0.5 }}>
        <Typography variant="h6" color="error">
          Error: Invalid topic data
        </Typography>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth={false}
      sx={{ 
        maxWidth: '800px',
        px: 1,
        height: 'auto',
        minHeight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        mt: 0.5
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1,
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                mb: 0,
                color: 'text.primary',
                fontWeight: 'bold',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              KNOWRA
            </Typography>
          </Link>
        </Box>
        <Box sx={{ width: '300px' }}>
          <SearchBox />
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'visible' }}>
        <TopicCard
          title={topic.title}
          tldr={topic.tldr}
          aspects={topic.aspects}
          related={topic.related}
        />
      </Box>
    </Container>
  );
} 