# KNOWRA: Next.js Learning Platform

Knowra is an interactive learning platform built with Next.js, Material UI, and Google Gemini AI. It enables users to explore topics through AI-generated cards, search, and detailed explanations, with a focus on SEO and modern UX.

## Features
- **Interactive Topic Cards:** Explore topics with TLDRs and expandable aspects.
- **AI-Generated Content:** Uses Google Gemini AI for content and detailed explanations.
- **Fuzzy Search:** Fast, suggestion-based search for topics.
- **Admin Tool:** Populate the database with topics in bulk.
- **Caching:** In-memory and DB caching for generated content.
- **SEO Optimized:** Dynamic metadata, Open Graph, and descriptions.
- **Google Analytics:** Integrated for tracking.
- **Responsive UI:** Built with Material UI, mobile-friendly.
- **Markdown Support:** Renders markdown with GFM (tables, lists, etc).

## Tech Stack
- **Next.js 14**
- **TypeScript**
- **Material UI**
- **MongoDB (Mongoose)**
- **Google Gemini AI**
- **ReactMarkdown + remark-gfm**

## Getting Started

### 1. Clone the repo
```sh
git clone https://github.com/nirajagarwal/knowra-next.git
cd knowra-next
```

### 2. Install dependencies
```sh
npm install
```

### 3. Set up environment variables
Create a `.env.local` file with:
```
MONGODB_URI=your_mongodb_connection_string
GOOGLE_AI_API_KEY=your_google_gemini_api_key
RATE_LIMIT_MAX_REQUESTS=60
RATE_LIMIT_WINDOW_MS=60000
```

### 4. Run the development server
```sh
npm run dev
```

### 5. Populate the database (optional)
Add your topics to `featured_topics.txt` and run:
```sh
npm run populate-db
```

### 6. Test Gemini LLM response (optional)
```sh
npm run test-llm "Your Topic Here"
```

## Scripts
- `npm run dev` — Start the dev server
- `npm run populate-db` — Populate DB with topics from `featured_topics.txt`
- `npm run test-llm "Topic"` — Test Gemini AI for a single topic

## Folder Structure
- `src/app/` — Next.js app routes and pages
- `src/components/` — UI components (TopicCard, SearchBox, etc)
- `src/lib/` — Utilities (Gemini, MongoDB)
- `src/models/` — Mongoose schemas
- `src/scripts/` — Utility scripts

## Contributing
Pull requests are welcome! For major changes, please open an issue first.

## License
[MIT](LICENSE)

---

For more, see the [GitHub repo](https://github.com/nirajagarwal/knowra-next) 