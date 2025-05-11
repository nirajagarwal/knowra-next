'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Box,
  Paper,
} from '@mui/material';
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
  const [expandedAspect, setExpandedAspect] = useState<string | null>(null);
  const [selectedThing, setSelectedThing] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleTextSelection = useCallback(async (e: React.MouseEvent) => {
    if (!e.ctrlKey) return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    const selectedText = selection.toString().trim();
    if (!selectedText) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: title,
          text: selectedText,
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

  // Debug log for selectedContent
  useEffect(() => {
    if (selectedContent !== null) {
      // eslint-disable-next-line no-console
      console.log('selectedContent:', selectedContent);
    }
  }, [selectedContent]);

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
      <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          maxWidth: 1200, 
          mx: 'auto',
          flexDirection: { xs: 'column', md: 'row' }
        }}>
          {/* Left Card - Navigation */}
          <Card sx={{ 
            flex: { md: '0 0 300px' },
            maxHeight: { md: '80vh' },
            overflow: 'auto'
          }}>
            <CardContent sx={{ p: 0 }}>
              <List dense disablePadding>
                {aspects.map((aspect) => (
                  <Box key={aspect.caption}>
                    <ListItem
                      button
                      onClick={() => handleAspectClick(aspect.caption)}
                      sx={{
                        borderRadius: 0,
                        '&:hover': { backgroundColor: 'action.hover' },
                        py: 0.5,
                        px: 1.5
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography variant="subtitle2" fontWeight="bold">
                            {aspect.caption}
                          </Typography>
                        } 
                      />
                    </ListItem>
                    <Collapse in={expandedAspect === aspect.caption}>
                      <List component="div" disablePadding dense>
                        {aspect.thingsToKnow.map((thing, index) => (
                          <ListItem
                            key={index}
                            button
                            onClick={(e) => handleThingClick(thing, e)}
                            selected={selectedThing === thing}
                            sx={{ 
                              py: 0.5,
                              px: 1.5,
                              borderRadius: 0,
                              '&.Mui-selected': {
                                backgroundColor: 'action.selected',
                              }
                            }}
                          >
                            <ListItemText 
                              primary={
                                <Typography variant="body2">
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

          {/* Right Panel - Content Display */}
          <Paper 
            elevation={3}
            sx={{ 
              flex: 1,
              p: 3,
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Typography variant="body1" color="text.secondary">
                  Generating...
                </Typography>
              </Box>
            ) : selectedContent ? (
              <ContentDisplay content={selectedContent} />
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Overview
                </Typography>
                <Typography>
                  {tldr}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  );
});

export default TopicCard; 