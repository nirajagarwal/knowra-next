import { generateDetailedContent } from './gemini';

const WIKI_MAX_LENGTH = 5000; // characters

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

export async function generateVideoContent(videoId: string, title: string, description: string): Promise<string> {
  try {
    const prompt = `Analyze this YouTube video description and provide a structured response in the following JSON format:
{
  "caption": "A concise title that captures the main focus of the video",
  "thingsToKnow": [
    "Key point 1",
    "Key point 2",
    "Key point 3",
    "Key point 4",
    "Key point 5"
  ]
}

Video Title: ${title}
Description: ${description}

Focus on extracting the most important insights, main points, and practical applications.`;

    const aiResponse = await generateDetailedContent(title, prompt);
    return formatContent(aiResponse as ContentResponse);
  } catch (error) {
    console.error('Error generating video content:', error);
    return `## ${title}\n\n- This video appears to be about ${title}\n- Description is currently unavailable\n- Try watching the video directly for more information\n- Consider checking the video description for details\n- You can also look for similar videos on this topic`;
  }
}

export async function generateBookContent(title: string, authors: string[]): Promise<string> {
  const cacheKey = `book:${title}:${authors.join(',')}`;
  const cached = contentCache.get(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Analyze the book "${title}" by ${authors.join(', ')} and provide a structured response. Focus on the main concepts, arguments, and practical applications.

Please provide your response in the following JSON format:
{
  "caption": "A concise title summarizing the main focus of the book",
  "thingsToKnow": [
    "Key concept or argument from the book",
    "Important finding or insight",
    "Practical application or lesson",
    "Notable quote or example",
    "Critical analysis or perspective"
  ]
}`;

    const response = await generateDetailedContent(title, prompt);
    const formattedResponse = formatContent(response as ContentResponse);
    contentCache.set(cacheKey, formattedResponse);
    return formattedResponse;
  } catch (error) {
    console.error('Error generating book content:', error);
    throw error;
  }
}

export async function generateWikiContent(title: string, extract: string): Promise<string> {
  const cacheKey = `wiki:${title}`;
  const cached = contentCache.get(cacheKey);
  if (cached) return cached;

  try {
    const prompt = `Based on the following Wikipedia extract about "${title}", analyze the content and provide a structured response. Focus on key facts, historical context, and related concepts.

Extract:
${extract.slice(0, WIKI_MAX_LENGTH)}

Please provide your response in the following JSON format:
{
  "caption": "A concise title summarizing the main focus of the Wikipedia article",
  "thingsToKnow": [
    "Key fact or finding from the article",
    "Important historical context",
    "Notable development or event",
    "Related concept or connection",
    "Critical analysis or perspective"
  ]
}`;

    const response = await generateDetailedContent(title, prompt);
    const formattedResponse = formatContent(response as ContentResponse);
    contentCache.set(cacheKey, formattedResponse);
    return formattedResponse;
  } catch (error) {
    console.error('Error generating wiki content:', error);
    throw error;
  }
} 