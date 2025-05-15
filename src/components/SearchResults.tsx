'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PublicIcon from '@mui/icons-material/Public';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Book, Video, WikiPage } from '@/hooks/useSearchResults';

interface SearchResultsProps {
  books: Book[];
  videos: Video[];
  wiki: WikiPage[];
  onItemClick: (type: 'book' | 'video' | 'wiki', item: Book | Video | WikiPage) => void;
}

export default function SearchResults({ books, videos, wiki, onItemClick }: SearchResultsProps) {
  const [expanded, setExpanded] = useState<string[]>([]);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  function truncateText(text: string | undefined, maxSentences: number = 3): string {
    if (!text) return '';
    const sentenceEnd = /[.!?]+/;
    const sentences = text.split(sentenceEnd);
    return sentences.slice(0, maxSentences).join('.') + '.';
  }

  return (
    <>
      <Accordion 
        expanded={expanded.includes('books')} 
        onChange={handleChange('books')}
        disableGutters
        elevation={0}
        sx={{ 
          '&:first-of-type': {
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBookIcon />
            <Typography>Books</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {books?.map((book, index) => (
              <ListItem 
                key={index}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
                  alignItems: 'flex-start',
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
                onClick={() => onItemClick('book', book)}
              >
                <ListItemText
                  primary={book.title}
                  secondary={
                    <Typography component="span" variant="body2" color="text.primary">
                      {book.authors.join(', ')} • {book.publishedYear}
                    </Typography>
                  }
                  sx={{ 
                    m: 0,
                    '& .MuiListItemText-primary': {
                      mb: 0.5,
                    }
                  }}
                />
                {book.thumbnail && (
                  <Box
                    component="img"
                    src={book.thumbnail}
                    alt={book.title}
                    sx={{
                      width: { xs: 80, sm: 120 },
                      height: 'auto',
                      ml: 2,
                      objectFit: 'contain',
                      borderRadius: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      }
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expanded.includes('videos')} 
        onChange={handleChange('videos')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoLibraryIcon />
            <Typography>Videos</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {videos?.map((video, index) => (
              <ListItem 
                key={index}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
                  alignItems: 'flex-start',
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
                onClick={() => onItemClick('video', video)}
              >
                <ListItemText
                  primary={video.title}
                  secondary={
                    <Typography component="span" variant="body2" color="text.primary">
                      {video.channelTitle} • {video.publishedAt}
                    </Typography>
                  }
                  sx={{ 
                    m: 0,
                    '& .MuiListItemText-primary': {
                      mb: 0.5,
                    }
                  }}
                />
                {video.thumbnailUrl && (
                  <Box
                    component="img"
                    src={video.thumbnailUrl}
                    alt={video.title}
                    sx={{
                      width: { xs: 80, sm: 120 },
                      height: 'auto',
                      ml: 2,
                      objectFit: 'contain',
                      borderRadius: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      }
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expanded.includes('wiki')} 
        onChange={handleChange('wiki')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PublicIcon />
            <Typography>Wikipedia</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {wiki?.map((page, index) => (
              <ListItem 
                key={index}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
                  alignItems: 'flex-start',
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
                onClick={() => onItemClick('wiki', page)}
              >
                <ListItemText
                  primary={page.title}
                  secondary={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {truncateText(page.extract)}
                      </Typography>
                    </Box>
                  }
                  sx={{ 
                    m: 0,
                    '& .MuiListItemText-primary': {
                      mb: 0.5,
                    }
                  }}
                />
                {page.thumbnail && (
                  <Box
                    component="img"
                    src={page.thumbnail}
                    alt={page.title}
                    sx={{
                      width: { xs: 80, sm: 120 },
                      height: 'auto',
                      ml: 2,
                      objectFit: 'contain',
                      borderRadius: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      }
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </>
  );
} 