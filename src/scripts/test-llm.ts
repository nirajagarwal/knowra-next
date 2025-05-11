import 'dotenv/config';
import { generateTopicContent } from '../lib/gemini';

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:', {
  GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ? 'Present' : 'Missing',
  MONGODB_URI: process.env.MONGODB_URI ? 'Present' : 'Missing'
});

async function testLLM() {
  try {
    const topic = process.argv[2];
    if (!topic) {
      console.error('Please provide a topic as an argument');
      console.log('Usage: npm run test-llm "Your Topic"');
      process.exit(1);
    }

    console.log(`Generating content for topic: "${topic}"`);
    const content = await generateTopicContent(topic);
    
    console.log('\nGenerated Content:');
    console.log('------------------');
    console.log('TLDR:', content.tldr);
    console.log('\nAspects:');
    content.aspects.forEach((aspect, index) => {
      console.log(`\n${index + 1}. ${aspect.caption}`);
      console.log('Things to know:');
      aspect.thingsToKnow.forEach((thing, i) => {
        console.log(`   ${i + 1}. ${thing}`);
      });
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testLLM(); 