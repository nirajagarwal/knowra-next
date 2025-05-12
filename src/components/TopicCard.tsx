'use client';

import { useState, useCallback, memo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Box,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ContentDisplay from './ContentDisplay';

interface Aspect {
  caption: string;
  thingsToKnow: string[];
}

interface TopicCardProps {
  title: string;
  tldr: string;
  aspects: Aspect[];
}

const TopicCard = memo(function TopicCard({ title, tldr, aspects }: TopicCardProps) {
  const [expandedAspect, setExpandedAspect] = useState<string | null>(aspects[0]?.caption || null);
  const [selectedThing, setSelectedThing] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleAspectClick = useCallback((caption: string) => {
    setExpandedAspect(expandedAspect === caption ? null : caption);
    setSelectedThing(null);
    setSelectedContent(null);
  }, [expandedAspect]);

  const handleThingClick = useCallback(async (thing: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!thing || typeof thing !== 'string') return;
    
    setIsLoading(true);
    setSelectedThing(thing);
    setIsDrawerOpen(true);
    
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: title,
          text: thing,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate content');
      }
      
      const content = await response.text();
      if (content) {
        setSelectedContent(content);
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  }, [title]);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <>
      <style jsx global>{`
        .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body p, .markdown-body ul, .markdown-body li {
          margin: 0 0 8px 0;
        }
        .markdown-body ul, .markdown-body ol {
          padding-left: 1.5em;
        }
      `}</style>
      <Box>
        <Box sx={{ 
          maxWidth: 1200, 
          mx: 'auto',
        }}>
          {/* Main Content Card */}
          <Card sx={{ 
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                  Overview
                </Typography>
                <Typography>
                  {tldr}
                </Typography>
              </Box>
              
              <List disablePadding>
                {aspects.map((aspect) => (
                  <Box key={aspect.caption}>
                    <ListItem
                      button
                      onClick={() => handleAspectClick(aspect.caption)}
                      sx={{
                        '&:hover': { backgroundColor: 'action.hover' },
                        py: 1,
                        px: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle1" fontWeight="bold">
                            {aspect.caption}
                          </Typography>
                        } 
                      />
                    </ListItem>
                    <Collapse in={expandedAspect === aspect.caption}>
                      <List component="div" disablePadding>
                        {aspect.thingsToKnow.map((thing, index) => (
                          <ListItem
                            key={index}
                            button
                            onClick={(e) => handleThingClick(thing, e)}
                            selected={selectedThing === thing}
                            sx={{ 
                              py: 0.75,
                              px: 2,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&.Mui-selected': {
                                backgroundColor: 'action.selected',
                              }
                            }}
                          >
                            <ListItemText 
                              primary={
                                <Typography variant="body1">
                                  {thing}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Sliding Panel for Content */}
          <Drawer
            anchor="right"
            open={isDrawerOpen}
            onClose={handleDrawerClose}
            variant={isMobile ? "temporary" : "persistent"}
            sx={{
              '& .MuiDrawer-paper': {
                width: { xs: '100%', sm: 400, md: 500 },
                boxSizing: 'border-box',
                p: 0,
              },
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="h6" noWrap>
                {selectedThing}
              </Typography>
              <IconButton onClick={handleDrawerClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ p: 2, overflow: 'auto', height: 'calc(100% - 64px)' }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    Generating...
                  </Typography>
                </Box>
              ) : selectedContent ? (
                <ContentDisplay content={selectedContent} />
              ) : null}
            </Box>
          </Drawer>
        </Box>
      </Box>
    </>
  );
});

export default TopicCard; 