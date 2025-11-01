# Deployment and Tools Questions

## What tools power the app, server, and database?

**Frontend App:**
- **React 19.0.0**: UI library for building interactive interfaces
- **TypeScript 5.5.3**: Type-safe JavaScript development
- **Vite 6.4.0**: Fast build tool and dev server (replaces Webpack)
- **Tailwind CSS 3.4.1**: Utility-first CSS framework for styling
- **Framer Motion 11.3.8**: Animation library for smooth transitions
- **React Router**: Client-side routing (implied from routing patterns)
- **Lucide React**: Icon library for UI elements

**Document Processing:**
- **PDF.js (pdfjs-dist 5.4.149)**: PDF text extraction and viewing
- **Tesseract.js 6.0.1**: OCR fallback for scanned PDFs
- **jsonrepair 3.13.0**: JSON repair library for AI response parsing

**Visualization:**
- **Mermaid 11.11.0**: Diagram generation (flowcharts, timelines)
- **react-chrono 2.4.2**: Timeline component
- **html2canvas 1.4.1 & jspdf 3.0.3**: PDF export functionality

**Backend/Database:**
- **Firebase 12.4.0**: 
  - Authentication (user login/signup)
  - Firestore (cloud database for analysis history)
  - Firebase Hosting (static site hosting)
- **No custom backend server**: Client-side app makes direct API calls

**AI Integration:**
- **@google/generative-ai 0.24.1**: Google Gemini API SDK

**Development Tools:**
- **ESLint**: Code linting
- **PostCSS & Autoprefixer**: CSS processing
- **TypeScript ESLint**: Type checking

## Where do the Google AI tools layer into the product?

**Integration Point: Service Layer**
- **Primary Entry**: `src/services/gemini.ts` acts as the AI service layer
- **Direct API Calls**: Client-side JavaScript directly calls Google's Gemini API
- **No Middleware**: No intermediate server proxies the requests

**Layering Flow:**
1. **UI Layer** (DocumentInput, AnalysisResults, ChatPanel) → triggers actions
2. **App Component** → calls service functions with user input
3. **Gemini Service** → constructs prompts, sends API requests, parses responses
4. **Google Gemini API** → processes requests and returns structured JSON
5. **Gemini Service** → maps responses to TypeScript types
6. **App Component** → updates React state with results
7. **UI Layer** → renders formatted results to user

**Specific Integration Functions:**
- `analyzeDocumentWithGemini()` - Core document analysis
- `generateVisualizationsWithGemini()` - Flowchart/timeline generation  
- `chatWithGemini()` - Interactive Q&A
- `analyzeClauseEnforceabilityWithGemini()` - Jurisdiction analysis

**Configuration:**
- API key stored in environment variable `VITE_GEMINI_API_KEY`
- Model: `gemini-2.0-flash` for fast, cost-effective responses
- Request format: JSON-only responses enforced via `responseMimeType`

## Where is it hosted, and how do you roll out updates?

**Hosting:**
- **Firebase Hosting**: Primary hosting platform (indicated by `firebase.json` config)
- **Static Site**: Built as static HTML/CSS/JS files (no server-side rendering)
- **CDN Distribution**: Firebase Hosting automatically provides CDN for fast global access
- **Fallback Options**: Can also deploy to Netlify, Vercel, AWS S3+CloudFront, or any static hosting

**Build Process:**
- **Build Command**: `npm run build` (runs `vite build`)
- **Output Directory**: `dist/` folder with optimized static assets
- **Asset Optimization**: Vite bundles and minifies JavaScript, CSS, and assets
- **TypeScript Compilation**: TypeScript compiled to JavaScript during build

**Deployment Workflow:**
1. **Development**: `npm run dev` runs Vite dev server locally
2. **Build**: `npm run build` creates production-ready `dist/` folder
3. **Preview**: `npm run preview` tests production build locally
4. **Deploy**: `firebase deploy` (or `firebase deploy --only hosting`) uploads `dist/` to Firebase Hosting
5. **CDN Update**: Firebase CDN automatically updates with new files

**Update Strategy:**
- **Zero-Downtime**: Static file replacement means instant updates
- **Version Control**: Git-based workflow (commit → build → deploy)
- **CI/CD Capable**: Can integrate with GitHub Actions, GitLab CI, or similar
- **Rollback**: Previous versions can be redeployed from Git history
- **Caching**: Firebase CDN handles caching automatically with cache invalidation on deploy

**Environment Configuration:**
- **Environment Variables**: Stored in `.env` file (not committed)
- **API Keys**: `VITE_GEMINI_API_KEY` bundled into client code at build time
- **Firebase Config**: Configured separately in Firebase console and SDK initialization

