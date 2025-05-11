# Knowra - Interactive Learning Platform

A Next.js-based learning platform that uses Google's Gemini AI to generate and display interactive learning content.

## Features

- Interactive topic cards with expandable aspects
- AI-generated content with 30-day caching
- Fuzzy search with suggestions
- Text selection for detailed explanations
- Admin tool for bulk content generation
- SEO optimized with dynamic metadata
- Google Analytics integration

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Material UI
- MongoDB
- Google Gemini AI
- Vercel Analytics

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   RATE_LIMIT_MAX_REQUESTS=60
   RATE_LIMIT_WINDOW_MS=60000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Admin Tool

Access the admin tool at `/admin` to generate content for multiple topics. Enter topics one per line in the text area and click "Generate Content".

## Deployment

The application is configured for deployment on Vercel. Make sure to set up the environment variables in your Vercel project settings.

## License

MIT 