import mongoose from 'mongoose';

const AspectSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  thingsToKnow: {
    type: [String],
    required: true,
  },
});

const TopicSchema = new mongoose.Schema({
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
  aspects: [AspectSchema],
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
TopicSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Topic || mongoose.model('Topic', TopicSchema); 