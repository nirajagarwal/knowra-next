require('dotenv').config();
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Configure the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

async function generateRelatedTopics(topic) {
  console.log(`Generating related topics for: ${topic}`);

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-preview-04-17',
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `Generate 5 related topics for "${topic}". Return only a JSON array of strings.`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse the response
    const cleanedText = text.trim()
      .replace(/```json\n?|\n?```/g, '') // Remove any markdown code blocks
      .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
      .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
      .replace(/\n/g, ' ') // Remove newlines
      .replace(/\s+/g, ' '); // Normalize whitespace
    
    const relatedTopics = JSON.parse(cleanedText);
    
    if (Array.isArray(relatedTopics)) {
      console.log(`Generated ${relatedTopics.length} related topics:`, relatedTopics);
      return relatedTopics.slice(0, 5); // Ensure we don't exceed 5 topics
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error(`Error generating related topics: ${error.message}`);
    // Fallback related topics
    return [
      `${topic} basics`, 
      `${topic} history`, 
      `${topic} applications`, 
      `${topic} future trends`, 
      `${topic} research`
    ];
  }
}

async function updateTopics() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Find topics with missing or empty related array
    const topicsToUpdate = await Topic.find({
      $or: [
        { related: { $exists: false } },
        { related: { $size: 0 } },
        { related: null }
      ]
    });

    console.log(`Found ${topicsToUpdate.length} topics with missing related fields`);

    // Update each topic
    for (let i = 0; i < topicsToUpdate.length; i++) {
      const topic = topicsToUpdate[i];
      console.log(`\nProcessing topic ${i + 1}/${topicsToUpdate.length}: ${topic.title}`);
      
      // Generate related topics
      const relatedTopics = await generateRelatedTopics(topic.title);
      
      // Update the topic with new related topics
      await Topic.updateOne(
        { _id: topic._id },
        { $set: { related: relatedTopics } }
      );
      
      console.log(`Updated topic: ${topic.title} with ${relatedTopics.length} related topics`);
      
      // Delay between API calls to avoid rate limits
      if (i < topicsToUpdate.length - 1) {
        const delay = 2000; // 2 seconds delay
        console.log(`Waiting ${delay/1000} seconds before next request...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log('\nAll topics updated successfully!');
    
    // Verify the updates
    const updatedCount = await Topic.countDocuments({
      related: { $exists: true, $ne: [], $not: { $size: 0 } }
    });
    
    console.log(`Total topics with related field: ${updatedCount}`);

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the update function
updateTopics();
