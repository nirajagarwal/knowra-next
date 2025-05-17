require('dotenv').config();
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

// Define schemas similar to the ones in the application
const aspectSchema = new Schema({
  caption: String,
  thingsToKnow: [String]
});

// Main topic schema
const topicSchema = new Schema({
  title: String,
  slug: String,
  tldr: String,
  aspects: [aspectSchema],
  related: [String],
  createdAt: Date,
  updatedAt: Date,
});

const Topic = model('Topic', topicSchema);

async function inspectTopics() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Query a few topics
    const topics = await Topic.find().limit(10);
    console.log(`Found ${topics.length} topics`);

    // Print topic details
    topics.forEach((topic, index) => {
      console.log(`\nTopic ${index + 1}: ${topic.title}`);
      console.log(`Slug: ${topic.slug}`);
      console.log(`Related topics: ${Array.isArray(topic.related) ? topic.related.length : 'undefined'}`);
      
      if (Array.isArray(topic.related) && topic.related.length > 0) {
        console.log('Related topics:', topic.related);
      }
    });

    // Disconnect
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

inspectTopics();
