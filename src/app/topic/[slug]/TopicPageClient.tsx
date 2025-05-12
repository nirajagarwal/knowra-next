'use client';

import { Typography, Box, Container, IconButton } from '@mui/material';
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
  };
}

export default function TopicPageClient({ topic }: TopicPageClientProps) {
  const router = useRouter();

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        px: 1,
        height: '100vh',
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
          <IconButton 
            onClick={() => router.push('/')}
            sx={{ 
              mr: 1,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              },
              '& .MuiSvgIcon-root': {
                fontSize: '2.5rem'
              }
            }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ mb: 0 }}>
            {topic.title}
          </Typography>
        </Box>
        <Box sx={{ width: '300px' }}>
          <SearchBox />
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TopicCard
          title={topic.title}
          tldr={topic.tldr}
          aspects={topic.aspects}
        />
      </Box>
    </Container>
  );
} 