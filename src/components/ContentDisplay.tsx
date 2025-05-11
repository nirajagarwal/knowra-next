import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Typography } from '@mui/material';

interface ContentDisplayProps {
  content: string;
}

const ContentDisplay = ({ content }: ContentDisplayProps) => {
  if (!content) return null;

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
          h1: ({ node, ...props }) => <Typography variant="h5" component="h1" {...props} />,
          h2: ({ node, ...props }) => <Typography variant="h6" component="h2" {...props} />,
          h3: ({ node, ...props }) => <Typography variant="subtitle1" component="h3" {...props} />,
          h4: ({ node, ...props }) => <Typography variant="subtitle2" component="h4" {...props} />,
          h5: ({ node, ...props }) => <Typography variant="body1" component="h5" fontWeight="bold" {...props} />,
          h6: ({ node, ...props }) => <Typography variant="body2" component="h6" fontWeight="bold" {...props} />,
          p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} />,
          li: ({ node, ...props }) => <Typography variant="body1" component="li" {...props} />,
          code: ({ node, inline, ...props }) => (
            <Typography
              component={inline ? 'span' : 'pre'}
              sx={{
                fontFamily: 'monospace',
                ...(inline ? {} : { display: 'block', whiteSpace: 'pre-wrap' }),
              }}
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};

export default ContentDisplay; 