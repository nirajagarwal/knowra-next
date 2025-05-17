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

async function checkDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log('URI:', process.env.MONGODB_URI);
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Get collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });
    
    // Count topics
    const topicCount = await Topic.countDocuments();
    console.log(`\nTotal topics in the database: ${topicCount}`);

    // Check if database is empty or topics collection exists
    if (topicCount === 0) {
      console.log('No topics found in the database.');
      
      // Check if the collection exists at all
      const topicsCollection = collections.find(c => c.name === 'topics');
      if (!topicsCollection) {
        console.log('The topics collection does not exist in the database.');
      } else {
        console.log('The topics collection exists but is empty.');
      }
    } else {
      // Get a sample topic
      const sampleTopic = await Topic.findOne();
      console.log('\nSample topic:');
      console.log(` - Title: ${sampleTopic.title}`);
      console.log(` - Slug: ${sampleTopic.slug}`);
      console.log(` - Has TLDR: ${!!sampleTopic.tldr}`);
      console.log(` - Aspects: ${sampleTopic.aspects ? sampleTopic.aspects.length : 0}`);
      
      // Check related field
      if (sampleTopic.related && Array.isArray(sampleTopic.related)) {
        console.log(` - Related topics: ${sampleTopic.related.length}`);
        if (sampleTopic.related.length > 0) {
          console.log(` - Related topics: ${sampleTopic.related.join(', ')}`);
        }
      } else {
        console.log(` - Related topics: missing or not an array`);
      }
      
      // Count topics with and without related
      const withRelated = await Topic.countDocuments({
        related: { $exists: true, $ne: [], $not: { $size: 0 } }
      });
      
      console.log(`\nTopics with related field: ${withRelated}`);
      console.log(`Topics without related field: ${topicCount - withRelated}`);
      
      // List some topics without related
      if (topicCount > withRelated) {
        const topicsWithoutRelated = await Topic.find({
          $or: [
            { related: { $exists: false } },
            { related: { $size: 0 } },
            { related: null }
          ]
        }).limit(5);
        
        console.log('\nSample topics without related field:');
        topicsWithoutRelated.forEach((topic, index) => {
          console.log(` ${index + 1}. ${topic.title}`);
        });
      }
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
checkDatabase();
