import 'dotenv/config';
import connectDB from '../lib/mongodb';
import Topic from '../models/Topic';
import { Model } from 'mongoose';

async function checkTopics() {
  try {
    console.log('Connecting to MongoDB database...');
    await connectDB();
    console.log('Connected to MongoDB database');

    const TopicModel = Topic as Model<any>;
    
    // Get a sample of topics
    const topics = await TopicModel.find().limit(10);
    
    console.log(`Found ${topics.length} topics`);
    
    // Check each topic for related field
    topics.forEach((topic, index) => {
      console.log(`\nTopic ${index + 1}: ${topic.title}`);
      
      // Check if related field exists and has items
      if (topic.related && Array.isArray(topic.related)) {
        console.log(`Related topics: ${topic.related.length} items`);
        if (topic.related.length > 0) {
          console.log('Related topics:', topic.related);
        } else {
          console.log('Related topics array exists but is empty');
        }
      } else {
        console.log('Related topics field is missing or not an array');
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTopics();
