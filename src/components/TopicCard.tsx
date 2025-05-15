'use client';

import { useState, memo, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Link as MuiLink,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Drawer,
  Grid,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import ContentDisplay from './ContentDisplay';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchResults from './SearchResults';
import { useSearchResults, Book, Video, WikiPage } from '@/hooks/useSearchResults';
import Spinner from './Spinner';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { generateVideoContent, generateBookContent, generateWikiContent } from '@/lib/contentGenerator';

interface TopicCardProps {
  title: string;
  tldr: string;
  aspects: Array<{
    caption: string;
    thingsToKnow: string[];
  }>;
  related?: string[];
}

interface DetailedContent {
  caption: string;
  thingsToKnow: string[];
}

const TopicCard = memo(function TopicCard({ title, tldr, aspects, related = [] }: TopicCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string[]>(['tldr']);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [detailedContent, setDetailedContent] = useState<DetailedContent | null>(null);
  const [loadingTopics, setLoadingTopics] = useState<string[]>([]);
  const [overlayContent, setOverlayContent] = useState<string>('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState(false);

  const { results, isLoading: isSearchLoading } = useSearchResults(title);

  const handleChange = useCallback((panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(prev => 
      isExpanded 
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  }, []);

  const handleItemClick = async (item: string) => {
    setSelectedItem(item);
    setIsPanelOpen(true);
    setIsLoading(true);
    setDetailedContent(null);

    try {
      const response = await fetch('/api/generate-detailed-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setDetailedContent(data);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedItem('');
    setDetailedContent(null);
  };

  const handleRelatedTopicClick = async (topic: string, e: React.MouseEvent) => {
    e.preventDefault();
    setLoadingTopics(prev => [...prev, topic]);
    
    try {
      // First check if the topic exists
      const response = await fetch(`/api/search?q=${encodeURIComponent(topic)}`);
      const data = await response.json();
      
      if (!data.suggestions.includes(topic)) {
        // Topic doesn't exist, create it
        const createResponse = await fetch('/api/topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: topic }),
        });
        
        if (!createResponse.ok) {
          throw new Error('Failed to create topic');
        }

        // Wait for the topic to be created and indexed
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Navigate to the topic
      router.push(`/${encodeURIComponent(topic)}`);
    } catch (error) {
      console.error('Error handling related topic click:', error);
      setLoadingTopics(prev => prev.filter(t => t !== topic));
    }
  };

  const handleSearchItemClick = async (type: 'book' | 'video' | 'wiki', item: Book | Video | WikiPage) => {
    setOverlayContent('');
    setShowOverlay(true);
    setOverlayLoading(true);

    try {
      let content = '';
      if (type === 'video') {
        content = await generateVideoContent((item as Video).videoId, item.title, (item as Video).description);
      } else if (type === 'book') {
        content = await generateBookContent(item.title, (item as Book).authors);
      } else {
        content = await generateWikiContent(item.title, (item as WikiPage).extract);
      }
      setOverlayContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setOverlayContent('Failed to generate content. Please try again.');
    } finally {
      setOverlayLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mb: 4, position: 'relative' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ 
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
            '& + .MuiAccordion-root': {
              marginTop: 0
            },
            '& .MuiAccordionDetails-root': {
              padding: 0,
              '&:last-child': {
                paddingBottom: 0
              }
            }
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
          },
          '& .MuiAccordion-root:last-child .MuiAccordionDetails-root': {
            paddingBottom: 0,
          },
        }}>
          <Accordion
            expanded={expanded.includes('tldr')}
            onChange={handleChange('tldr')}
            disableGutters
            elevation={0}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="tldr-content"
              id="tldr-header"
            >
              <Typography sx={{ 
                fontWeight: 'bold',
                fontSize: '1.25rem',
                color: 'text.primary',
              }}>
                {title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  {tldr}
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          {aspects.map((aspect, index) => (
            <Accordion
              key={aspect.caption}
              expanded={expanded.includes(`panel${index}`)}
              onChange={handleChange(`panel${index}`)}
              disableGutters
              elevation={0}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
              >
                <Typography sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: 'text.primary',
                }}>
                  {aspect.caption}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List disablePadding>
                  {aspect.thingsToKnow.map((point, index) => (
                    <ListItem
                      key={index}
                      button
                      disableGutters
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.08)',
                        },
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                        px: 2,
                        py: 1.5,
                      }}
                    >
                      <ListItemText
                        primary={
                          <ContentDisplay content={point} />
                        }
                        primaryTypographyProps={{
                          variant: 'body1',
                          color: 'text.primary',
                          sx: {
                            '& .markdown-body': {
                              margin: 0,
                              padding: 0,
                              '& p': {
                                margin: 0,
                              },
                              '& ul, & ol': {
                                margin: 0,
                                paddingLeft: 2,
                              },
                            }
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}

          {related.length > 0 && (
            <Accordion
              expanded={expanded.includes('related')}
              onChange={handleChange('related')}
              disableGutters
              elevation={0}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="related-content"
                id="related-header"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountTreeIcon />
                  <Typography sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    color: 'text.primary',
                  }}>
                    Related Topics
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ p: 2 }}>
                  <Grid container spacing={1}>
                    {related.map((topic) => (
                      <Grid item xs={6} sm={4} key={topic}>
                        <Link
                          href={`/${encodeURIComponent(topic)}`}
                          onClick={(e) => handleRelatedTopicClick(topic, e)}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 1,
                            color: 'primary.main',
                            fontSize: '0.875rem',
                            '&:hover': {
                              color: 'primary.dark',
                            }
                          }}>
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {topic}
                            </Typography>
                            {loadingTopics.includes(topic) && (
                              <Spinner size={12} />
                            )}
                          </Box>
                        </Link>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {results.books.length > 0 || results.videos.length > 0 || results.wiki.length > 0 ? (
            <SearchResults
              books={results.books}
              videos={results.videos}
              wiki={results.wiki}
              onItemClick={handleSearchItemClick}
            />
          ) : null}
        </Box>
      </CardContent>

      <Drawer
        anchor="right"
        open={isPanelOpen}
        onClose={handleClosePanel}
        PaperProps={{
          sx: {
            width: '400px',
            p: 2,
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'none',
            '& .MuiBackdrop-root': {
              backgroundColor: 'transparent',
            },
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'transparent',
          },
        }}
      >
        <Box sx={{ 
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            flexShrink: 0,
          }}>
            <Typography sx={{ 
              fontWeight: 'bold',
              fontSize: '1rem',
              color: 'text.primary',
            }}>
              {isLoading ? 'Generating...' : detailedContent?.caption || selectedItem}
            </Typography>
            <IconButton 
              onClick={handleClosePanel} 
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ 
            p: 2,
            flexGrow: 1,
            overflow: 'auto',
          }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Spinner />
              </Box>
            ) : detailedContent ? (
              <ContentDisplay content={detailedContent.thingsToKnow.join('\n\n')} />
            ) : null}
          </Box>
        </Box>
      </Drawer>

      {/* Overlay Panel */}
      {showOverlay && (
        <Drawer
          anchor="right"
          open={showOverlay}
          onClose={() => setShowOverlay(false)}
          PaperProps={{
            sx: {
              width: '90%',
              maxWidth: 800,
              height: '100vh',
              backgroundColor: 'white',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            },
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }}>
              <Typography 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  color: 'text.primary',
                }}
              >
                {overlayLoading ? 'Generating...' : overlayContent.split('\n')[0].replace('## ', '')}
              </Typography>
              <IconButton 
                onClick={() => setShowOverlay(false)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ 
              flexGrow: 1,
              overflow: 'auto',
            }}>
              {overlayLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <Spinner />
                </Box>
              ) : (
                <List disablePadding>
                  {overlayContent
                    .split('\n')
                    .slice(2) // Skip the title and empty line
                    .filter(line => line.startsWith('- '))
                    .map((item, index) => (
                      <ListItem
                        key={index}
                        disableGutters
                        sx={{
                          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                          '&:last-child': {
                            borderBottom: 'none',
                          },
                          px: 2,
                          py: 1.5,
                        }}
                      >
                        <ListItemText
                          primary={
                            <ContentDisplay content={item.replace('- ', '')} />
                          }
                          primaryTypographyProps={{
                            variant: 'body1',
                            color: 'text.primary',
                            sx: {
                              '& .markdown-body': {
                                margin: 0,
                                padding: 0,
                                '& p': {
                                  margin: 0,
                                },
                                '& ul, & ol': {
                                  margin: 0,
                                  paddingLeft: 2,
                                },
                              }
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                </List>
              )}
            </Box>
          </Box>
        </Drawer>
      )}
    </Card>
  );
});

TopicCard.displayName = 'TopicCard';

export default TopicCard; 