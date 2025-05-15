import { CircularProgress, Box } from '@mui/material';

interface SpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'inherit';
}

export default function Spinner({ size = 24, color = 'primary' }: SpinnerProps) {
  return (
    <Box sx={{ display: 'inline-flex' }}>
      <CircularProgress
        size={size}
        color={color}
        thickness={4}
        sx={{
          animation: 'spinner-grow 0.75s linear infinite',
          '@keyframes spinner-grow': {
            '0%': {
              transform: 'scale(0)',
              opacity: 0,
            },
            '50%': {
              opacity: 1,
            },
            '100%': {
              transform: 'scale(1)',
              opacity: 0,
            },
          },
        }}
      />
    </Box>
  );
} 