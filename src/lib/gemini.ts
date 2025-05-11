import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error('Please define the GOOGLE_AI_API_KEY environment variable inside .env');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Cache configuration
const CACHE_CONFIG = {
  maxSize: 1000, // Maximum number of items in cache
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Cache entry type
interface CacheEntry {
  content: string;
  timestamp: number;
}

// LRU Cache implementation
class LRUCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize: number, maxAge: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  get(key: string): string | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.content;
  }

  set(key: string, content: string): void {
    // Remove oldest entry if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      content,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

// Initialize cache
const contentCache = new LRUCache(CACHE_CONFIG.maxSize, CACHE_CONFIG.maxAge);

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 60, // requests per minute
  windowMs: 60 * 1000, // 1 minute
};

const requestQueue: number[] = [];

function isRateLimited(): boolean {
  const now = Date.now();
  // Remove requests older than the window
  while (requestQueue.length > 0 && requestQueue[0] < now - RATE_LIMIT.windowMs) {
    requestQueue.shift();
  }
  
  if (requestQueue.length >= RATE_LIMIT.maxRequests) {
    return true;
  }
  
  requestQueue.push(now);
  return false;
}

function sanitizeJsonString(str: string): string {
  // Remove any markdown code block indicators
  str = str.replace(/```json\n?|\n?```/g, '');
  // Remove any leading/trailing whitespace
  str = str.trim();
  // Remove control characters
  str = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  return str;
}

export async function generateTopicContent(topic: string) {
  if (isRateLimited()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-001',
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `Generate a learning guide for broad and deep understanding of various aspects of the topic "${topic}" in this exact JSON format:
{
  "tldr": "Three sentences with the most important things to know about the topic",
  "aspects": [
    {
      "caption": "Aspect name",
      "thingsToKnow": ["Fact 1", "Fact 2", "Fact 3", ...]
    }
  ]
}`;

  try {
    console.log('Generating content for topic:', topic);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Raw response:', text);

    // Basic string cleaning
    const cleanedText = text.trim();
    console.log('Cleaned text:', cleanedText);

    const parsed = JSON.parse(cleanedText);
    console.log('Parsed JSON:', parsed);

    // Handle array response by taking the first item
    const content = Array.isArray(parsed) ? parsed[0] : parsed;

    // Basic validation
    if (!content.tldr || !Array.isArray(content.aspects)) {
      throw new Error('Invalid response structure');
    }

    return content;
  } catch (error) {
    console.error('Error in generateTopicContent:', error);
    throw error;
  }
}

export async function generateDetailedContent(topic: string, text: string) {
  if (isRateLimited()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Create a cache key from topic and text
  const cacheKey = `${topic}:${text}`;
  
  // Check if content is in cache
  const cachedContent = contentCache.get(cacheKey);
  if (cachedContent) {
    console.log('Returning cached content for:', cacheKey);
    return cachedContent;
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-001'
  });

  const prompt = `Given the topic "${topic}", provide a detailed explanation about "${text}". 
  Format the response in markdown with proper headings, lists, and emphasis.
  Focus on being clear and concise.
  Keep headings short (5-7 words maximum).
  Start with a brief overview, then provide detailed explanations.`;

  try {
    console.log('Generating detailed content for:', { topic, text });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error('Empty response received');
    }

    console.log('Generated content:', content);
    
    // Cache the content before returning
    contentCache.set(cacheKey, content);
    return content;
  } catch (error) {
    console.error('Error in generateDetailedContent:', error);
    throw error;
  }
} 