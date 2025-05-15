import { Box } from '@mui/material';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    background-color: #1976d2;
  }
  50% {
    transform: scale(1);
    background-color: #e3f2fd;
  }
  100% {
    transform: scale(0.95);
    background-color: #1976d2;
  }
`;

interface SpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'inherit';
}

export default function Spinner({ 
  size = 24, 
  color = 'primary'
}: SpinnerProps) {
  return (
    <Box 
      sx={{ 
        display: 'inline-flex',
      }}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          animation: `${pulse} 1.5s ease-in-out infinite`,
        }}
      />
    </Box>
  );
} 