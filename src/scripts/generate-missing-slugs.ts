import dotenv from 'dotenv';
dotenv.config();

import { Model } from 'mongoose';
import connectDB from '../lib/mongodb';
import Topic from '../models/Topic';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function makeSlugUnique(slug: string, TopicModel: any): Promise<string> {
  const baseSlug = slug;
  let currentSlug = slug;
  let count = 1;
  
  while (await TopicModel.findOne({ slug: currentSlug })) {
    currentSlug = `${baseSlug}-${count}`;
    count++;
  }
  
  return currentSlug;
}

async function generateMissingSlugs() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');
    
    const TopicModel = Topic as Model<any>;
    
    // Find all topics with missing or undefined slugs
    const topicsWithoutSlugs = await TopicModel.find({ 
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: "" }
      ]
    });
    
    console.log(`Found ${topicsWithoutSlugs.length} topics without slugs`);
    
    let updateCount = 0;
    for (const topic of topicsWithoutSlugs) {
      // Generate a new slug
      const baseSlug = generateSlug(topic.title);
      const uniqueSlug = await makeSlugUnique(baseSlug, TopicModel);
      
      // Update the topic with the new slug
      await TopicModel.updateOne(
        { _id: topic._id },
        { $set: { slug: uniqueSlug } }
      );
      
      console.log(`Updated topic "${topic.title}" with slug "${uniqueSlug}"`);
      updateCount++;
    }
    
    console.log(`Updated ${updateCount} topics with missing slugs`);
    
    // Also find topics with undefined slugs but stored as "undefined" string
    const topicsWithUndefinedSlugs = await TopicModel.find({ slug: "undefined" });
    
    console.log(`Found ${topicsWithUndefinedSlugs.length} topics with "undefined" slugs`);
    
    for (const topic of topicsWithUndefinedSlugs) {
      // Generate a new slug
      const baseSlug = generateSlug(topic.title);
      const uniqueSlug = await makeSlugUnique(baseSlug, TopicModel);
      
      // Update the topic with the new slug
      await TopicModel.updateOne(
        { _id: topic._id },
        { $set: { slug: uniqueSlug } }
      );
      
      console.log(`Updated topic "${topic.title}" with new slug "${uniqueSlug}" (was "undefined")`);
      updateCount++;
    }
    
    // Check all topics for properly formatted slugs
    console.log('\nChecking all topics for properly formatted slugs...');
    const allTopics = await TopicModel.find({});
    console.log(`Found ${allTopics.length} total topics`);
    
    let improperSlugCount = 0;
    for (const topic of allTopics) {
      if (topic.slug) {
        const properSlug = generateSlug(topic.title);
        
        // Check if current slug doesn't follow proper format (but ignore intentional uniqueness numbers)
        const baseCurrentSlug = topic.slug.split('-').slice(0, -1).join('-');
        const lastPart = topic.slug.split('-').pop();
        const isNumberSuffix = lastPart && !isNaN(Number(lastPart));
        
        // If the slug doesn't match the proper format (accounting for uniqueness numbers)
        if (topic.slug !== properSlug && !(isNumberSuffix && baseCurrentSlug === properSlug)) {
          console.log(`Topic "${topic.title}" has improper slug: "${topic.slug}" (should be "${properSlug}")`);
          
          // Generate a proper slug
          const uniqueSlug = await makeSlugUnique(properSlug, TopicModel);
          
          // Update the topic with the proper slug
          await TopicModel.updateOne(
            { _id: topic._id },
            { $set: { slug: uniqueSlug } }
          );
          
          console.log(`Updated topic "${topic.title}" with proper slug "${uniqueSlug}"`);
          improperSlugCount++;
          updateCount++;
        }
      }
    }
    
    console.log(`Updated ${improperSlugCount} topics with improper slugs`);
    console.log(`\nTotal topics updated: ${updateCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating missing slugs:', error);
    process.exit(1);
  }
}

// Run the script
generateMissingSlugs(); 