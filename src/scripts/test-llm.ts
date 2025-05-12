import 'dotenv/config';
import { generateTopicContent } from '../lib/gemini';

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:', {
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ? 'Present' : 'Missing',
  MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing'
});

async function main() {
  const topic = process.argv[2];
  
  if (!topic) {
    console.error('Please provide a topic as an argument');
    process.exit(1);
  }

  try {
    const content = await generateTopicContent(topic);
    
    if (!content) {
      throw new Error('No content generated');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 