import mongoose, { Schema, model, models } from 'mongoose';

// Schema for aspect (from generateTopicContent)
const aspectSchema = new Schema({
  caption: String,
  thingsToKnow: [String]
});

// Schema for search results
const bookSchema = new Schema({
  title: String,
  authors: [String],
  publishedYear: String,
  description: String,
  thumbnail: String,
  url: String
});

const videoSchema = new Schema({
  title: String,
  channelName: String,
  publishedAt: String,
  description: String,
  thumbnail: String,
  url: String
});

const wikiPageSchema = new Schema({
  title: String,
  description: String,
  thumbnail: String,
  url: String
});

const searchResultsSchema = new Schema({
  books: {
    type: [bookSchema],
    default: []
  },
  videos: {
    type: [videoSchema],
    default: []
  },
  wiki: {
    type: [wikiPageSchema],
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Main topic schema
const topicSchema = new Schema({
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
  related: {
    type: [String],
    default: []
  },
  searchResults: {
    type: searchResultsSchema,
    default: () => ({})
  },
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

const Topic = models.Topic || model('Topic', topicSchema);

export default Topic; 