import { generateDetailedContent } from './gemini';

const WIKI_MAX_LENGTH = 50000; // characters

interface ContentResponse {
  caption: string;
  thingsToKnow: string[];
}

// Simple in-memory cache
const contentCache = new Map<string, string>();

async function getCachedContent(key: string): Promise<string | null> {
  return contentCache.get(key) || null;
}

async function cacheContent(key: string, content: string): Promise<void> {
  contentCache.set(key, content);
}

function formatContent(content: ContentResponse): string {
  return `## ${content.caption}\n\n${content.thingsToKnow.map(point => `- ${point}`).join('\n')}`;
}

// Function to generate a safe cache key
function generateCacheKey(parts: string[]): string {
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

export async function generateVideoContent(videoId: string, title: string, description: string, url: string): Promise<string> {
  const cacheKey = generateCacheKey(['video', videoId, title]);
  const cached = await getCachedContent(cacheKey);
  if (cached) {
    return cached;
  }
  
  const prompt = `Tell me more about key takeaways from Youtube video with title "${title}" and desciption : ${description} and url : ${url}
Please respond in this exact JSON format:
{
  "caption": "Short title",
  "thingsToKnow": ["Knowledge nugget 1", "Knowledge nugget 2", "Knowledge nugget 3", ...]
}`;
  const content = await generateDetailedContent(title, description, prompt);
  const formattedContent = `## ${title}|${url}|video\n\n${content.thingsToKnow.map(point => `- ${point}`).join('\n')}`;
  
  await cacheContent(cacheKey, formattedContent);
  return formattedContent;
}

export async function generateBookContent(title: string, authors: string[], description: string, url: string): Promise<string> {
  const cacheKey = generateCacheKey(['book', title, authors.join(',')]);
  const cached = await getCachedContent(cacheKey);
  if (cached) {
    return cached;
  }
  
  const prompt = `Tell me more about the book "${title}" by ${authors.join(', ')} with description : ${description} and url : ${url}
Please respond in this exact JSON format:
{
  "caption": "Short title",
  "thingsToKnow": ["Knowledge nugget 1", "Knowledge nugget 2", "Knowledge nugget 3", ...]
}`;
  const content = await generateDetailedContent(title, description, prompt);
  const formattedContent = `## ${title}|${url}|book\n\n${content.thingsToKnow.map(point => `- ${point}`).join('\n')}`;
  
  await cacheContent(cacheKey, formattedContent);
  return formattedContent;
}

export async function generateWikiContent(title: string, extract: string, url: string): Promise<string> {
  const cacheKey = generateCacheKey(['wiki', title]);
  const cached = await getCachedContent(cacheKey);
  if (cached) {
    return cached;
  }
  
  const prompt = `I am reading the Wikipedia page for "${title}". List out things to know from the text : ${extract}
For longer pages a longer list of things to know is better. Please respond in this exact JSON format:
{
  "tldr": "A brief summary of the key points",
  "caption": "Short title",
  "thingsToKnow": ["Knowledge nugget 1", "Knowledge nugget 2", "Knowledge nugget 3", ...]
}`;
  const content = await generateDetailedContent(title, extract, prompt);
  const formattedContent = `## ${title}|${url}|wiki\n\n${content.thingsToKnow.map(point => `- ${point}`).join('\n')}`;
  
  await cacheContent(cacheKey, formattedContent);
  return formattedContent;
} 