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
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PublicIcon from '@mui/icons-material/Public';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Book {
  title: string;
  authors: string[];
  publishedYear: string;
  description: string;
  thumbnail: string;
  url: string;
}

interface Video {
  title: string;
  channelName: string;
  publishedAt: string;
  description: string;
  thumbnail: string;
  url: string;
}

interface WikiPage {
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

interface SearchResultsProps {
  books: Book[];
  videos: Video[];
  wiki: WikiPage[];
  onItemClick: (type: 'book' | 'video' | 'wiki', item: Book | Video | WikiPage) => void;
}

const truncateText = (text: string, lines: number) => {
  const words = text.split(' ');
  if (words.length <= lines * 10) return text;
  return words.slice(0, lines * 10).join(' ') + '...';
};

export default function SearchResults({ books, videos, wiki, onItemClick }: SearchResultsProps) {
  const [expanded, setExpanded] = useState<string[]>([]);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  return (
    <Box sx={{ 
      mt: 0.5,
      '& .MuiAccordion-root': {
        '&:not(:last-child)': {
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        },
        '&:before': {
          display: 'none',
        },
        backgroundColor: 'white',
        boxShadow: 'none',
        borderRadius: 0,
        overflow: 'hidden',
        '&:last-child': {
          borderBottom: 'none',
        },
      },
      '& .MuiAccordionSummary-root': {
        minHeight: '48px',
        '&.Mui-expanded': {
          minHeight: '48px',
        },
        px: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
      '& .MuiAccordionDetails-root': {
        padding: 0,
        '&:last-child': {
          paddingBottom: 0
        }
      },
      '& .MuiList-root': {
        padding: 0,
        '&:last-child': {
          paddingBottom: 0
        }
      },
    }}>
      <Accordion
        expanded={expanded.includes('search')}
        onChange={handleChange('search')}
        disableGutters
        elevation={0}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="search-content"
          id="search-header"
        >
          <Typography sx={{ 
            fontSize: '1rem',
            fontWeight: 'bold',
            color: 'text.primary'
          }}>
            Search Results
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Accordion 
              expanded={expanded.includes('books')} 
              onChange={handleChange('books')}
              disableGutters
              elevation={0}
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
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
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
                            objectFit: 'contain'
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
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
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
                            {video.channelName} • {video.publishedAt}
                          </Typography>
                        }
                        sx={{ 
                          m: 0,
                          '& .MuiListItemText-primary': {
                            mb: 0.5,
                          }
                        }}
                      />
                      {video.thumbnail && (
                        <Box
                          component="img"
                          src={video.thumbnail}
                          alt={video.title}
                          sx={{
                            width: { xs: 80, sm: 120 },
                            height: 'auto',
                            ml: 2,
                            objectFit: 'contain'
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
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
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
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {truncateText(page.description, 3)}
                          </Typography>
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
                            objectFit: 'contain'
                          }}
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
} 