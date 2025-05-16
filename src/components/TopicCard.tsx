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
    console.log('handleItemClick called with:', item);
    setSelectedItem(item);
    setShowOverlay(true);
    setOverlayLoading(true);
    setOverlayContent('');

    try {
      console.log('Making API request to /api/generate');
      const response = await fetch('/api/generate', {
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
      console.log('Received API response:', data);
      setOverlayContent(`## ${data.caption}\n\n${data.thingsToKnow.map(point => `- ${point}`).join('\n')}`);
    } catch (error) {
      console.error('Error generating content:', error);
      setOverlayContent('Failed to generate content. Please try again.');
    } finally {
      setOverlayLoading(false);
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
        content = await generateVideoContent((item as Video).videoId, item.title, (item as Video).description, (item as Video).url);
      } else if (type === 'book') {
        content = await generateBookContent(item.title, (item as Book).authors, (item as Book).url);
      } else {
        content = await generateWikiContent(item.title, (item as WikiPage).extract, (item as WikiPage).url);
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
    <Card sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      mb: 4, 
      position: 'relative',
      overflow: 'visible',
      height: 'auto',
      minHeight: 'auto',
      '& .MuiCardContent-root': {
        overflow: 'visible',
        p: 0,
        height: 'auto',
        minHeight: 'auto',
      }
    }}>
      <CardContent>
        <Box sx={{ 
          height: 'auto',
          minHeight: 'auto',
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
            overflow: 'visible',
            height: 'auto',
            minHeight: 'auto',
            '&:last-child': {
              borderBottom: 'none',
            },
            '& + .MuiAccordion-root': {
              marginTop: 0
            },
            '& .MuiAccordionDetails-root': {
              padding: 0,
              overflow: 'visible',
              height: 'auto',
              minHeight: 'auto',
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
            overflow: 'visible',
            height: 'auto',
            minHeight: 'auto',
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
                sx={{
                  minHeight: 'unset',
                  '&.Mui-expanded': {
                    minHeight: 'unset',
                  },
                  py: 0,
                }}
              >
                <Typography sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: 'text.primary',
                  lineHeight: 1.2,
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
                      onClick={() => handleItemClick(point)}
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
                        py: 1,
                        minHeight: 'unset',
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
                                lineHeight: 1.2,
                                padding: 0,
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
              maxWidth: 600,
              height: '100%',
              backgroundColor: 'white',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
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
              flexDirection: 'column',
              p: 2,
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              flexShrink: 0,
            }}>
              <Typography 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  color: 'text.primary',
                  mb: 1,
                }}
              >
                {overlayLoading ? 'Generating...' : overlayContent.split('\n')[0].split('|')[0].replace('## ', '')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {overlayContent.split('\n')[0].split('|')[2] === 'book' && (
                  <MuiLink
                    href={overlayContent.split('\n')[0].split('|')[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Google Books
                  </MuiLink>
                )}
                {overlayContent.split('\n')[0].split('|')[2] === 'video' && (
                  <MuiLink
                    href={overlayContent.split('\n')[0].split('|')[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    YouTube
                  </MuiLink>
                )}
                {overlayContent.split('\n')[0].split('|')[2] === 'wiki' && (
                  <MuiLink
                    href={overlayContent.split('\n')[0].split('|')[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Wikipedia
                  </MuiLink>
                )}
              </Box>
              <IconButton 
                onClick={() => setShowOverlay(false)}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
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
              overflow: 'visible',
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
                          py: 1,
                          minHeight: 'unset',
                          '& .MuiListItemText-root': {
                            margin: 0,
                            padding: 0,
                          }
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
                                  fontSize: '1rem',
                                  lineHeight: 1.4,
                                  padding: '1px 0',
                                },
                                '& ul, & ol': {
                                  margin: 0,
                                  paddingLeft: 1,
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