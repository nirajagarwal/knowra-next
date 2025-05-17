'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography, Box } from '@mui/material';

interface ContentDisplayProps {
  content: string;
  renderParagraphsAsSpans?: boolean;
  compact?: boolean;
}

const ContentDisplay = memo(function ContentDisplay({ content, renderParagraphsAsSpans, compact }: ContentDisplayProps) {
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
          marginBottom: compact ? 0 : 1.5,
          lineHeight: compact ? 1.2 : 1.6,
          margin: compact ? 0 : undefined,
          padding: compact ? 0 : undefined,
        },
        '& ul, & ol': {
          marginBottom: compact ? 0 : 1.5,
          paddingLeft: compact ? 0 : 3,
          margin: compact ? 0 : undefined,
          padding: compact ? 0 : undefined,
          '& li': {
            marginBottom: compact ? 0 : 0.5,
            lineHeight: compact ? 1.2 : 1.6,
            margin: compact ? 0 : undefined,
            padding: compact ? 0 : undefined,
          },
        },
        '& code': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          padding: '0.2em 0.4em',
          borderRadius: 3,
          fontSize: '0.9em',
          fontFamily: 'monospace',
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
        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        '& img': {
          maxWidth: '100%',
          height: 'auto',
          borderRadius: 4,
        },
        '& table': {
          borderCollapse: 'collapse',
          width: '100%',
          marginBottom: 1.5,
          '& th, & td': {
            border: '1px solid #dfe2e5',
            padding: '0.5em',
          },
          '& th': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    }}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={renderParagraphsAsSpans ? {
          p: ({ node, ...props }) => <span {...props} />,
        } : {}}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
});

ContentDisplay.displayName = 'ContentDisplay';

export default ContentDisplay; 