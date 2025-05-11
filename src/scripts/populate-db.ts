import fs from 'fs';
import path from 'path';
import { generateTopicContent } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import Topic from '@/models/Topic';
import { Model } from 'mongoose';

async function populateDatabase() {
  try {
    // Read the featured topics file
    const filePath = path.join(process.cwd(), 'featured_topics.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    const topics = content.split('\n').filter(t => t.trim());

    // Connect to MongoDB
    await connectDB();

    console.log(`Found ${topics.length} topics to process`);

    const TopicModel = Topic as Model<any>;

    // Process each topic
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      try {
        console.log(`Processing topic ${i + 1}/${topics.length}: ${topic}`);

        // Check if topic already exists
        const existingTopic = await TopicModel.findOne({ title: topic });
        if (existingTopic) {
          console.log(`Topic "${topic}" already exists, skipping...`);
          continue;
        }

        // Generate content using Gemini
        const content = await generateTopicContent(topic);
        
        // Create new topic
        const newTopic = new Topic({
          title: topic,
          tldr: content.tldr,
          aspects: content.aspects,
        });

        await newTopic.save();
        console.log(`Successfully created topic: ${topic}`);

        // Add a small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing topic "${topic}":`, error);
        // Continue with next topic even if one fails
        continue;
      }
    }

    console.log('Database population completed!');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
populateDatabase(); 