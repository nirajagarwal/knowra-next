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
  channelTitle: String,
  publishedAt: String,
  description: String,
  thumbnailUrl: String,
  videoId: String,
  url: String
});

const wikiPageSchema = new Schema({
  title: String,
  extract: String,
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
  slug: {
    type: String,
    required: true,
    unique: true,
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

// Utility function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Utility function to make slug unique
async function makeSlugUnique(slug: string, Topic: any): Promise<string> {
  const baseSlug = slug;
  let currentSlug = slug;
  let count = 1;
  
  while (await Topic.findOne({ slug: currentSlug })) {
    currentSlug = `${baseSlug}-${count}`;
    count++;
  }
  
  return currentSlug;
}

// Pre-save hook to generate and ensure unique slug
topicSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    const baseSlug = generateSlug(this.title);
    this.slug = await makeSlugUnique(baseSlug, this.constructor);
  }
  this.updatedAt = new Date();
  next();
});

const Topic = models.Topic || model('Topic', topicSchema);

export default Topic; 