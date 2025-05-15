import { generateDetailedContent } from './gemini';
import { YoutubeTranscript } from 'youtube-transcript';
import { contentCache } from './gemini';

const WIKI_MAX_LENGTH = 5000; // characters

interface ContentResponse {
  caption: string;
  thingsToKnow: string[];
}

export async function generateVideoContent(videoId: string, title: string): Promise<string> {
  const cacheKey = `video:${videoId}`;
  const cached = contentCache.get(cacheKey);
  if (cached) return cached;

  try {
    let transcriptText = '';
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcriptItems.map(item => item.text).join(' ');
    } catch (transcriptError) {
      console.error('Error fetching transcript:', transcriptError);
      // If transcript fetch fails, return a simple format with just the title and description
      return `## ${title}

- Video Description: ${title}
- Transcript not available for this video
- Please watch the video directly for full content`;
    }
    
    const prompt = `Based on the following YouTube video "${title}", analyze the content and provide a structured response. Focus on extracting key insights, main points, and practical applications.

${transcriptText}

Please provide your response in the following JSON format:
{
  "caption": "A concise title summarizing the main focus of the video",
  "thingsToKnow": [
    "Key point or insight from the video",
    "Important concept or finding",
    "Practical application or takeaway",
    "Notable quote or example",
    "Critical analysis or perspective"
  ]
}`;

    const response = await generateDetailedContent(title, prompt);
    const formattedResponse = formatContent(response as ContentResponse);
    contentCache.set(cacheKey, formattedResponse);
    return formattedResponse;
  } catch (error) {
    console.error('Error generating video content:', error);
    // Return a fallback response if content generation fails
    return `## ${title}

- Video Description: ${title}
- Content could not be analyzed at this time
- Please try again later or check the video directly`;
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

function formatContent(content: ContentResponse): string {
  return `## ${content.caption}

${content.thingsToKnow.map(item => `- ${item}`).join('\n')}`;
} 