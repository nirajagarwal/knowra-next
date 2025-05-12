import { Container, Typography, Box } from '@mui/material';
import SearchBox from '@/components/SearchBox';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'medium' }}>
          KNOWRA
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
          Explore topics through interactive learning cards
        </Typography>
        
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <SearchBox />
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Featured Topics
          </Typography>
          {/* Featured topics will be added here */}
        </Box>
      </Box>
    </Container>
  );
} 