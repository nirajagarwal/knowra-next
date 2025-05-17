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
  Grid,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PublicIcon from '@mui/icons-material/Public';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { Book, Video, WikiPage } from '@/hooks/useSearchResults';
import Spinner from './Spinner';

interface SearchResultsProps {
  books: Book[];
  videos: Video[];
  wiki: WikiPage[];
  onItemClick: (type: 'book' | 'video' | 'wiki', item: Book | Video | WikiPage) => void;
  onSectionExpand: (section: 'books' | 'videos' | 'wiki') => void;
  isLoading: {
    books: boolean;
    videos: boolean;
    wiki: boolean;
  };
}

export default function SearchResults({ 
  books, 
  videos, 
  wiki, 
  onItemClick,
  onSectionExpand,
  isLoading 
}: SearchResultsProps) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [bookPage, setBookPage] = useState(0);
  const [videoPage, setVideoPage] = useState(0);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
    
    if (isExpanded) {
      onSectionExpand(panel as 'books' | 'videos' | 'wiki');
    }
  };

  function truncateText(text: string | undefined, maxSentences: number = 3): string {
    if (!text) return '';
    const sentenceEnd = /[.!?]+/;
    const sentences = text.split(sentenceEnd);
    return sentences.slice(0, maxSentences).join('.') + '.';
  }

  const itemsPerPage = 3;
  const maxBookPage = Math.ceil(books.length / itemsPerPage) - 1;
  const maxVideoPage = Math.ceil(videos.length / itemsPerPage) - 1;

  const handleNextPage = (type: 'book' | 'video') => {
    if (type === 'book' && bookPage < maxBookPage) {
      setBookPage(prev => prev + 1);
    } else if (type === 'video' && videoPage < maxVideoPage) {
      setVideoPage(prev => prev + 1);
    }
  };

  const handlePrevPage = (type: 'book' | 'video') => {
    if (type === 'book' && bookPage > 0) {
      setBookPage(prev => prev - 1);
    } else if (type === 'video' && videoPage > 0) {
      setVideoPage(prev => prev - 1);
    }
  };

  const renderMediaSlider = (items: (Book | Video)[], type: 'book' | 'video', currentPage: number, maxPage: number) => {
    const startIndex = currentPage * itemsPerPage;
    const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

    return (
      <Box sx={{ position: 'relative', width: '100%', px: 2, pb: 1 }}>
        <Grid container spacing={2}>
          {visibleItems.map((item, index) => (
            <Grid item xs={4} key={index}>
              <Box
                onClick={() => onItemClick(type, item)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    '& .media-image': {
                      transform: 'scale(1.02)',
                    },
                    '& .media-title': {
                      color: 'primary.main',
                    }
                  }
                }}
              >
                <Box
                  component="img"
                  src={type === 'book' ? (item as Book).thumbnail : (item as Video).thumbnailUrl}
                  alt={item.title}
                  className="media-image"
                  sx={{
                    width: '100%',
                    aspectRatio: type === 'book' ? '2/3' : '16/9',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease-in-out',
                    mb: 1,
                  }}
                />
                <Typography
                  variant="subtitle2"
                  className="media-title"
                  sx={{
                    fontWeight: 'medium',
                    transition: 'color 0.2s ease-in-out',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.2,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {type === 'book' 
                    ? `${(item as Book).authors.join(', ')} • ${(item as Book).publishedYear}`
                    : `${(item as Video).channelTitle} • ${(item as Video).publishedAt}`
                  }
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        {items.length > itemsPerPage && (
          <>
            <IconButton
              onClick={() => handlePrevPage(type)}
              disabled={currentPage === 0}
              size="small"
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                },
                zIndex: 1,
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
            <IconButton
              onClick={() => handleNextPage(type)}
              disabled={currentPage === maxPage}
              size="small"
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                '&.Mui-disabled': {
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                },
                zIndex: 1,
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </>
        )}
      </Box>
    );
  };

  return (
    <>
      <Accordion 
        expanded={expanded.includes('wiki')} 
        onChange={handleChange('wiki')}
        disableGutters
        elevation={0}
        sx={{ 
          '&:first-of-type': {
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          },
          overflow: 'visible',
          '& .MuiAccordionDetails-root': {
            overflow: 'visible',
            height: 'auto',
            minHeight: 'auto',
          }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PublicIcon />
            <Typography>Wikipedia</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {isLoading.wiki ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Spinner />
            </Box>
          ) : (
            <List sx={{ overflow: 'visible' }}>
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
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expanded.includes('books')} 
        onChange={handleChange('books')}
        disableGutters
        elevation={0}
        sx={{
          overflow: 'visible',
          '& .MuiAccordionDetails-root': {
            overflow: 'visible',
            height: 'auto',
            minHeight: 'auto',
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
          {isLoading.books ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Spinner />
            </Box>
          ) : (
            renderMediaSlider(books, 'book', bookPage, maxBookPage)
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion 
        expanded={expanded.includes('videos')} 
        onChange={handleChange('videos')}
        disableGutters
        elevation={0}
        sx={{
          overflow: 'visible',
          '& .MuiAccordionDetails-root': {
            overflow: 'visible',
            height: 'auto',
            minHeight: 'auto',
          }
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoLibraryIcon />
            <Typography>Videos {videos.length > 0 ? `(${videos.length})` : ''}</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {isLoading.videos ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Spinner />
            </Box>
          ) : videos.length > 0 ? (
            renderMediaSlider(videos, 'video', videoPage, maxVideoPage)
          ) : (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography color="text.secondary">No videos found</Typography>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </>
  );
} 