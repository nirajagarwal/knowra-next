'use client';

import { useState, memo, useCallback } from 'react';
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
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import ContentDisplay from './ContentDisplay';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  const handleRelatedTopicClick = (topic: string, e: React.MouseEvent) => {
    e.preventDefault();
    setLoadingTopics(prev => [...prev, topic]);
    router.push(`/${encodeURIComponent(topic)}`);
  };

  return (
    <Card sx={{ mb: 0 }}>
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
                  {aspect.thingsToKnow.map((item) => (
                    <ListItem
                      key={item}
                      button
                      disableGutters
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                        px: 2,
                        py: 1.5,
                      }}
                      onClick={() => handleItemClick(item)}
                    >
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{
                          sx: { 
                            fontSize: '1rem',
                            color: 'text.primary',
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
                <Typography sx={{ 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: 'text.primary',
                }}>
                  Related Topics
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List disablePadding>
                  {related.map((topic) => (
                    <ListItem
                      key={topic}
                      disableGutters
                      sx={{
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <Link 
                        href={`/${encodeURIComponent(topic)}`}
                        style={{ 
                          textDecoration: 'none',
                          width: '100%',
                        }}
                        onClick={(e) => handleRelatedTopicClick(topic, e)}
                      >
                        <Box
                          sx={{
                            color: 'primary.main',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            py: 1.5,
                            px: 2,
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        >
                          {topic}
                          {loadingTopics.includes(topic) && (
                            <CircularProgress
                              size={16}
                              sx={{
                                ml: 1,
                                color: 'primary.main',
                              }}
                            />
                          )}
                        </Box>
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>

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
              overflow: 'auto',
              flexGrow: 1,
              backgroundColor: 'white',
            }}>
              {isLoading ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : detailedContent && (
                <List disablePadding>
                  {detailedContent.thingsToKnow.map((item, index) => (
                    <ListItem 
                      key={index} 
                      disableGutters
                      sx={{ 
                        py: 1.5,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                        px: 2,
                      }}
                    >
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{
                          sx: { 
                            fontSize: '1rem',
                            color: 'text.primary',
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
      </CardContent>
    </Card>
  );
});

TopicCard.displayName = 'TopicCard';

export default TopicCard; 