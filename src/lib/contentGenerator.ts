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

export async function generateVideoContent(videoId: string, title: string, description: string, url: string): Promise<string> {
  const content = await generateDetailedContent(title, description);
  return `## ${title}|${url}|video\n\n${content.thingsToKnow.map(point => `- ${point}`).join('\n')}`;
}

export async function generateBookContent(title: string, authors: string[], url: string): Promise<string> {
  const content = await generateDetailedContent(title, `Book by ${authors.join(', ')}`);
  return `## ${title}|${url}|book\n\n${content.thingsToKnow.map(point => `- ${point}`).join('\n')}`;
}

export async function generateWikiContent(title: string, extract: string, url: string): Promise<string> {
  const content = await generateDetailedContent(title, extract);
  return `## ${title}|${url}|wiki\n\n${content.thingsToKnow.map(point => `- ${point}`).join('\n')}`;
} 