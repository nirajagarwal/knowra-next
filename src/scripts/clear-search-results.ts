import 'dotenv/config';
import connectDB from '../lib/mongodb';
import Topic from '../models/Topic';
import { Model } from 'mongoose';

async function clearSearchResults() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    const TopicModel = Topic as Model<any>;
    
    // Update all topics to clear search results
    const result = await TopicModel.updateMany(
      {},
      {
        $set: {
          searchResults: {
            books: [],
            videos: [],
            wiki: [],
            lastUpdated: new Date()
          }
        }
      }
    );

    console.log('\nSearch results cleared successfully!');
    console.log(`Modified ${result.modifiedCount} topics`);

  } catch (error) {
    console.error('Error clearing search results:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
clearSearchResults(); 