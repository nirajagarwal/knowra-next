'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography, Box } from '@mui/material';

interface ContentDisplayProps {
  content: string;
}

const ContentDisplay = memo(function ContentDisplay({ content }: ContentDisplayProps) {
  if (!content || typeof content !== 'string') {
    return null;
  }

  return (
    <Box sx={{ 
      '& .markdown-body': {
        '& h1, & h2, & h3, & h4, & h5, & h6': {
          marginTop: 2,
          marginBottom: 1,
          fontWeight: 'bold',
        },
        '& p': {
          marginBottom: 1.5,
          lineHeight: 1.6,
        },
        '& ul, & ol': {
          marginBottom: 1.5,
          paddingLeft: 3,
          '& li': {
            marginBottom: 0,
          },
        },
        '& code': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          padding: '0.2em 0.4em',
          borderRadius: 3,
          fontSize: '0.9em',
        },
        '& pre': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          padding: 1,
          borderRadius: 4,
          overflow: 'auto',
          '& code': {
            backgroundColor: 'transparent',
            padding: 0,
          },
        },
        '& blockquote': {
          borderLeft: '4px solid #dfe2e5',
          margin: 0,
          paddingLeft: 1,
          color: 'text.secondary',
        },
      },
    }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </Box>
  );
});

ContentDisplay.displayName = 'ContentDisplay';

export default ContentDisplay; 