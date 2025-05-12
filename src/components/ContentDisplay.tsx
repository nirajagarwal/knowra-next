import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography } from '@mui/material';
import { ComponentPropsWithoutRef } from 'react';

interface ContentDisplayProps {
  content: string;
}

interface CodeProps {
  inline?: boolean;
  children: React.ReactNode;
}

const ContentDisplay = ({ content }: ContentDisplayProps) => {
  if (!content) return null;

  // Clean up content if needed
  const cleanContent = content.replace(/^```markdown\n?|\n?```$/g, '').trim();

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
        },
        '& li': {
          marginBottom: 0.5,
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
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <Typography variant="h6" sx={{ fontSize: '1.25rem' }}>{children}</Typography>,
          h2: ({ children }) => <Typography variant="subtitle1" sx={{ fontSize: '1.1rem' }}>{children}</Typography>,
          h3: ({ children }) => <Typography variant="subtitle2" sx={{ fontSize: '1rem' }}>{children}</Typography>,
          h4: ({ children }) => <Typography variant="body1" fontWeight="bold" sx={{ fontSize: '0.95rem' }}>{children}</Typography>,
          h5: ({ children }) => <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>{children}</Typography>,
          h6: ({ children }) => <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>{children}</Typography>,
          p: ({ children }) => <Typography variant="body1" paragraph sx={{ fontSize: '0.95rem' }}>{children}</Typography>,
          li: ({ children }) => <Typography variant="body1" component="li" sx={{ fontSize: '0.95rem' }}>{children}</Typography>,
          code: ({ inline, children }: CodeProps) => (
            <Typography
              component={inline ? 'span' : 'pre'}
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                ...(inline ? {} : { display: 'block', whiteSpace: 'pre-wrap' }),
              }}
            >
              {children}
            </Typography>
          ),
          a: ({ href, children }) => (
            <Typography
              component="a"
              href={href}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {children}
            </Typography>
          ),
          strong: ({ children }) => (
            <Typography
              component="strong"
              sx={{ fontWeight: 'bold' }}
            >
              {children}
            </Typography>
          ),
          em: ({ children }) => (
            <Typography
              component="em"
              sx={{ fontStyle: 'italic' }}
            >
              {children}
            </Typography>
          ),
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </Box>
  );
};

export default ContentDisplay; 