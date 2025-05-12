# KNOWRA: Next.js Learning Platform

Knowra is an interactive learning platform built with Next.js, Material UI, and Google Gemini AI. It enables users to explore topics through AI-generated cards, search, and detailed explanations, with a focus on SEO and modern UX.

## Features
- **Interactive Topic Cards:** Explore topics with TLDRs and expandable aspects
- **AI-Generated Content:** Uses Google Gemini AI for content and detailed explanations
- **Fuzzy Search:** Fast, suggestion-based search for topics with MongoDB text search
- **Admin Tool:** Populate the database with topics in bulk using the included script
- **Caching:** In-memory and DB caching for generated content
- **SEO Optimized:** Dynamic metadata, Open Graph, and descriptions
- **Google Analytics:** Integrated for tracking user engagement
- **Responsive UI:** Built with Material UI, fully mobile-friendly
- **Markdown Support:** Renders markdown with GFM (tables, lists, etc)
- **TypeScript:** Full type safety and better development experience
- **API Routes:** RESTful API endpoints for search and topic management

## Tech Stack
- **Frontend:**
  - Next.js 14.2.28
  - React 18.2.0
  - Material UI 5.15.12
  - ReactMarkdown 9.0.1
  - TypeScript 5.4.2
- **Backend:**
  - MongoDB 8.2.1 (Mongoose)
  - Google Gemini AI (genai 0.13.0)
- **Development:**
  - ESLint 8.57.0
  - TailwindCSS 3.4.1
  - ts-node 10.9.2

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
Create a `.env.local` file with the following variables:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# AI
GOOGLE_AI_API_KEY=your_google_gemini_api_key

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=60
RATE_LIMIT_WINDOW_MS=60000

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
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

## Available Scripts
- `npm run dev` — Start the development server
- `npm run build` — Build the production application
- `npm run start` — Start the production server
- `npm run lint` — Run ESLint for code quality
- `npm run populate-db` — Populate DB with topics from `featured_topics.txt`
- `npm run test-llm "Topic"` — Test Gemini AI for a single topic

## Project Structure
```
src/
├── app/                    # Next.js app router pages and API routes
│   ├── api/               # API endpoints (search, topics)
│   └── [topic]/           # Dynamic topic pages
├── components/            # React components
│   ├── ContentDisplay.tsx # Markdown renderer
│   ├── SearchBox.tsx     # Search component
│   └── TopicCard.tsx     # Topic display component
├── lib/                   # Utility functions
│   ├── mongodb.ts        # Database connection
│   └── gemini.ts         # AI integration
├── models/               # Mongoose schemas
└── scripts/             # Utility scripts
    ├── populate-db.ts   # Database population
    └── test-llm.ts      # AI testing
```

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use ESLint for code quality
- Follow Material UI component patterns
- Write meaningful commit messages

### Adding New Features
1. Create a new branch
2. Implement the feature
3. Add tests if applicable
4. Update documentation
5. Submit a pull request

### API Endpoints
- `GET /api/search` - Search topics
- `POST /api/topics` - Create new topic
- `GET /api/topics/[id]` - Get topic details

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
[MIT](LICENSE)

---

For more information, visit the [GitHub repository](https://github.com/nirajagarwal/knowra-next) 