import { GoogleGenerativeAI } from '@google/generative-ai';

// Debug environment variables
console.log('Environment variables:', {
  hasKey: !!process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY,
  keyLength: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY?.length,
  nodeEnv: process.env.NODE_ENV
});

if (!process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY) {
  throw new Error('Please define the NEXT_PUBLIC_GOOGLE_AI_API_KEY environment variable inside .env');
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY);

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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Basic string cleaning
    const cleanedText = text.trim();

    const parsed = JSON.parse(cleanedText);

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

  const cacheKey = `${topic}:${text}`;
  const cachedContent = contentCache.get(cacheKey);
  if (cachedContent) {
    return cachedContent;
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-001'
  });

  const prompt = `I am learning about "${topic}". In this context tell me more about: ${text}. Just respond with the content without preamble.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Cache the content
    contentCache.set(cacheKey, content);

    return content;
  } catch (error) {
    console.error('Error in generateDetailedContent:', error);
    throw error;
  }
} 