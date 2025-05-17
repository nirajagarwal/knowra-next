import { GoogleGenerativeAI } from '@google/generative-ai';

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

// Export the cache
export { contentCache };

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

// Function to generate a safe cache key
function generateSafeCacheKey(parts: string[]): string {
  return parts
    .filter(Boolean)
    .map(part => 
      // For each part, either use it directly if it's short
      // or create a hash if it's long
      part.length < 100 ? part : `${part.substring(0, 50)}_${hashString(part)}`
    )
    .join(':');
}

// Simple string hashing function
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export async function generateTopicContent(topic: string) {
  if (isRateLimited()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-preview-04-17',
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = `Generate a learning guide for broad and deep understanding of various aspects of the topic "${topic}". 
  Also provide a list of related words, entities, or concepts. Use this exact JSON format:
{
  "tldr": "Three sentences with the main thingsto know about the topic",
  "aspects": [
    {
      "caption": "Aspect name",
      "thingsToKnow": ["Knowledge nugget 1", "Knowledge nugget 2", "Knowledge nugget 3", ...],
    }
  ],
  "related": ["related topic 1", "related topic 2", "related topic 3", "..."]
}
Additional instructions: 
1. Aim to select the aspects and thingsToKnow so that the points are mutually exclusive and collectively exhaustive. 
2. High information density for deep learning with a sprinkling of fun facts.
3. Ensure the response is valid JSON with proper commas and braces.
4. Do not include any markdown formatting or code block indicators.
5. Always include at least 3 related topics in the related array.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Basic string cleaning
    const cleanedText = text.trim()
      .replace(/```json\n?|\n?```/g, '') // Remove any markdown code blocks
      .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
      .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
      .replace(/\n/g, ' ') // Remove newlines
      .replace(/\s+/g, ' '); // Normalize whitespace

    try {
      const parsed = JSON.parse(cleanedText);

      // Handle array response by taking the first item
      const content = Array.isArray(parsed) ? parsed[0] : parsed;

      // Basic validation
      if (!content.tldr || !Array.isArray(content.aspects)) {
        throw new Error('Invalid response structure');
      }

      // Ensure related is an array with at least 3 items
      if (!Array.isArray(content.related) || content.related.length < 3) {
        // If related is missing or has less than 3 items, generate some related topics
        const relatedPrompt = `Generate 3 related topics for "${topic}". Return only a JSON array of strings.`;
        const relatedResult = await model.generateContent(relatedPrompt);
        const relatedResponse = await relatedResult.response;
        const relatedText = relatedResponse.text();
        try {
          const relatedTopics = JSON.parse(relatedText);
          content.related = Array.isArray(relatedTopics) ? relatedTopics : [topic + ' basics', topic + ' fundamentals', topic + ' overview'];
        } catch (e) {
          content.related = [topic + ' basics', topic + ' fundamentals', topic + ' overview'];
        }
      }

      return content;
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
    }
  } catch (error) {
    throw error;
  }
}

export async function generateDetailedContent(topic: string, text: string, customPrompt?: string) {
  if (isRateLimited()) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  const cacheKey = generateSafeCacheKey(['detailed', topic, text]);
  const cachedContent = contentCache.get(cacheKey);
  if (cachedContent) {
    return JSON.parse(cachedContent);
  }

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-preview-04-17',
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const prompt = customPrompt || `I am learning about "${topic}". In this context tell me more about: ${text} in this exact JSON format:
  {
    "caption": "Short title",
    "thingsToKnow": ["Knowledge nugget 1", "Knowledge nugget 2", "Knowledge nugget 3", ...]
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Basic string cleaning
    const cleanedText = sanitizeJsonString(text);
    const content = JSON.parse(cleanedText);

    // Basic validation
    if (!content.caption || !Array.isArray(content.thingsToKnow)) {
      throw new Error('Invalid response structure');
    }

    // Cache the raw JSON string
    contentCache.set(cacheKey, cleanedText);

    return content;
  } catch (error) {
    throw error;
  }
} 