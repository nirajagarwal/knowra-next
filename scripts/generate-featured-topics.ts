import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import connectDB from '../src/lib/mongodb';
import Topic from '../src/models/Topic';
import { Model } from 'mongoose';

// Utility function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function setupFeaturedTopics() {
  try {
    // Read topics from file
    const filePath = path.join(process.cwd(), 'featured_topics.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    const topics = content.split('\n').filter(Boolean);

    // Connect to MongoDB
    await connectDB();
    const TopicModel = Topic as Model<any>;

    console.log('Setting up featured topics...');
    
    // Get all topics that match the titles
    const existingTopics = await TopicModel.find({ title: { $in: topics } });
    console.log(`Found ${existingTopics.length} topics in database`);

    // Update any topics without slugs
    for (const topic of existingTopics) {
      if (!topic.slug) {
        const slug = generateSlug(topic.title);
        console.log(`Generating slug for "${topic.title}": ${slug}`);
        topic.slug = slug;
        await topic.save();
        console.log(`Updated topic with slug "${slug}"`);
      }
    }

    // Report any topics that weren't found
    const existingTitles = new Set(existingTopics.map(t => t.title));
    const missingTopics = topics.filter(t => !existingTitles.has(t));
    if (missingTopics.length > 0) {
      console.log('\nMissing topics:');
      missingTopics.forEach(t => console.log(`- ${t}`));
    }

    console.log('\nFinished setting up featured topics');
    process.exit(0);
  } catch (error) {
    console.error('Error in setupFeaturedTopics:', error);
    process.exit(1);
  }
}

setupFeaturedTopics(); 