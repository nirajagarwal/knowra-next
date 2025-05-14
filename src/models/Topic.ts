import mongoose from 'mongoose';

// Schema for aspect (from generateTopicContent)
const aspectSchema = new mongoose.Schema({
  caption: String,
  thingsToKnow: [String]
});

// Main topic schema
const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  tldr: {
    type: String,
    required: true,
  },
  aspects: {
    type: [aspectSchema],
    default: []
  },
  related: [{
    type: String,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
topicSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema);

export default Topic; 