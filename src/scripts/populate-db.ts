import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { generateTopicContent } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';

async function populateDatabase(limit?: number) {
  try {
    // Read the featured topics file
    const filePath = path.join(process.cwd(), 'featured_topics.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    let topics = content.split('\n').filter(t => t.trim());

    // Apply limit if specified
    if (limit) {
      topics = topics.slice(0, limit);
    }

    // Connect to MongoDB
    await connectDB();

    console.log(`Found ${topics.length} topics to process${limit ? ` (limited to first ${limit})` : ''}`);

    const TopicModel = Topic as Model<any>;
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Process each topic
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      try {
        console.log(`\nProcessing topic ${i + 1}/${topics.length}: ${topic}`);

        // Check if topic already exists
        const existingTopic = await TopicModel.findOne({ title: topic });
        if (existingTopic) {
          console.log(`Topic "${topic}" already exists, skipping...`);
          skipCount++;
          continue;
        }

        // Generate content using Gemini
        const content = await generateTopicContent(topic);
        
        // Create new topic with updated schema
        const newTopic = new Topic({
          title: topic,
          tldr: content.tldr,
          aspects: content.aspects,
          related: content.related || [],
          searchResults: {
            books: [],
            videos: [],
            wiki: [],
            lastUpdated: new Date()
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });

        await newTopic.save();
        console.log(`Successfully created topic: ${topic}`);
        successCount++;

        // Add a small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing topic "${topic}":`, error);
        errorCount++;
        // Continue with next topic even if one fails
        continue;
      }
    }

    console.log('\nDatabase population completed!');
    console.log(`Summary:\n    - Total topics processed: ${topics.length}\n    - Successfully created: ${successCount}\n    - Skipped (already exist): ${skipCount}\n    - Errors: ${errorCount}`);
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    process.exit(0);
  }
}

// Get limit from command line argument or use default
const limit = process.argv[2] ? parseInt(process.argv[2]) : undefined;

// Run the script
populateDatabase(limit); 