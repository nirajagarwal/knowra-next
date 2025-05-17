import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import connectDB from '../lib/mongodb';
import Topic from '../models/Topic';
import { Model } from 'mongoose';

async function generateSitemap() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get all topics
    const TopicModel = Topic as Model<any>;
    const topics = await TopicModel.find().select('title').lean();

    // Base URL - replace with your actual domain
    const baseUrl = 'https://knowra.ai';

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
  </url>
  ${topics.map(topic => `
  <url>
    <loc>${baseUrl}/${encodeURIComponent(topic.title)}</loc>
  </url>`).join('')}
</urlset>`;

    // Write sitemap to public directory
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully!');
    console.log(`Total URLs: ${topics.length + 1}`); // +1 for homepage

  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

generateSitemap(); 