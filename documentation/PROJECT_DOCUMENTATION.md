## LegalEase AI — Project Documentation and Planning

### 1) Executive Summary

LegalEase AI is an innovative web application designed to demystify complex legal documents. By leveraging the power of Google's Gemini API, it transforms dense legal text into clear, actionable insights. The platform offers clause-by-clause explanations, risk analysis, and role-specific perspectives, making legal documents accessible to everyone. Its intuitive interface, built with React and TypeScript, provides a seamless user experience, including interactive visualizations and a chat feature for further clarification.

### 2) Overview

LegalEase AI is a web app that analyzes legal documents into clear, structured outputs: clause-by-clause explanations, risks, action points, role-specific perspectives, and visualizations (flows, timelines, responsibilities). It uses React + TypeScript + Tailwind on the frontend and Google's Gemini API for analysis and visualization generation.

### 3) Key Features

- Chunked document analysis with de-duplication (clauses, risks, actions, citations)
- Role-specific perspectives (e.g., Tenant/Landlord, Employee/Employer)
- Bilingual output (English/Hindi) and multiple simplification levels
- Try Sample Contracts (EN/HI): Service Agreement, Mutual NDA, Residential Lease
- Text paste and PDF upload with pdf.js extraction and Tesseract OCR fallback
- Auto-generated Visualizations: Flowchart, Timeline, Responsibilities matrix
- Scroll-safe panels, sticky PDF viewer in Results, and fullscreen modals for Analysis/Visuals/Document
- Optional chat on top of the analyzed document

### 4) Architecture

**Frontend:**

- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Core Components:**
    - `AppShell`: Main application layout with sidebar and top navigation.
    - `DocumentInput`: Handles text pasting, PDF uploads, and sample contract selection.
    - `AnalysisResults`: Displays the structured analysis of the legal document.
    - `Visualizations`: Renders interactive diagrams (flowcharts, timelines).
    - `MermaidDiagram`: A dedicated component for rendering Mermaid.js diagrams.
    - `ChatPanel`: Provides a chat interface for asking questions about the document.
- **State Management:** React Hooks and Context API for managing application state.

**Backend (Services):**

- **`src/services/gemini.ts`:** Core service for interacting with the Gemini API. It constructs prompts, sends requests, and parses the JSON responses into strongly-typed objects.
- **`src/services/analysis.ts`:** Contains the business logic for document analysis, including chunking and de-duplication.
- **`src/services/firebase.ts`:** Manages Firebase integration for features like authentication and data storage.

### 5) Setup & Environment

Prereqs: Node.js 18+, Gemini API key

Steps:

- `npm install`
- Create `.env` with `VITE_GEMINI_API_KEY=your_key`
- `npm run dev` to start; `npm run build && npm run preview` for production preview

### 6) Deployment

The application is deployed as a static website. The deployment process is as follows:

1.  **Build:** The `npm run build` command transpiles the TypeScript code, bundles the assets, and creates a `dist` folder.
2.  **Deploy:** The contents of the `dist` folder are deployed to a static web host.

### 7) Data Model (Summary)

- DocumentAnalysis: id, documentType, plainSummary, clauses[], risks[], actionPoints[], citations[]
- Clause: id, title, originalText, simplifiedText, riskLevel, explanation, rolePerspectives[]
- RolePerspective: role, interpretation, obligations[], risks[]
- VisualizationBundle: timelines[], flows[], responsibilities

See `src/types/legal.ts` for full details.

### 8) Core Workflows

- Document Analysis Workflow (Chunked)

  - Input document (paste/upload/sample) in `DocumentInput`
  - `analyzeDocumentWithGemini` splits content into chunks and calls Gemini per chunk
  - Partial results mapped then merged; UI renders tabs in `AnalysisResults`

- Visualization Generation Workflow

  - `generateVisualizationsWithGemini` runs in background after analysis
  - Produces timelines, flows, responsibilities
  - `Visualizations` renders Mermaid diagrams and table

- Chat Workflow (Optional)
  - `ChatPanel` and `ChatFloating` send prompts via `chatWithGemini` with document context

### 9) UI Flow

1. AppShell sidebar shows pages: Upload, Results, Visuals, Chat, Profile, More
2. Upload page: `DocumentInput` (paste/upload/sample + language + simplification)
3. Results: `AnalysisResults` + sticky `OriginalContent` (PDF viewer)
4. Visuals: flows/timelines/responsibilities
5. Fullscreen buttons on Analysis/Visuals/Original Document open modal pop views
6. Chat available via floating button or Chat page

### 10) Sample Contracts

- Multilingual, long-form samples with selector in `DocumentInput`:
  - EN: Service Agreement, Mutual NDA, Residential Lease
  - HI: सेवा अनुबंध, परस्पर NDA, आवासीय पट्टा
- Selecting a sample and clicking "Try Sample Contract" auto-fills and triggers analysis

### 11) Visualizations (Rendering Notes)

- Mermaid diagrams injected as responsive SVG (`[_svg]:w-full`, `h-auto`)
- Fixed-height containers (480px) with `overflow-auto` to prevent overlap
- Fullscreen modal view for detailed diagrams

### 12) Error Handling & Troubleshooting

- Missing key: ensure `.env` has `VITE_GEMINI_API_KEY` and restart dev server
- Non-JSON output: transient; retry; JSON-only prompt already enforced
- Empty role views: may be irrelevant for provided text; try another sample or adjust level
- Diagram overlap/clipping: use scroll or Fullscreen (containers are scroll-safe)

### 13) Roadmap

- **Export/Share:** PDF/Markdown export of analysis & visuals.
- **User Accounts:** Allow users to save their analysis history.
- **Advanced Settings:** Model selector, temperature, tokens.
- **Fine-tuned Prompts:** Per document type (e.g., Lease vs Employment).
- **Server proxy:** Optional API gateway to hide keys more strictly.
- **Team Collaboration:** Allow multiple users to collaborate on a single document analysis.
- **Integration with Legal Databases:** Connect with legal databases to provide more context and citations.

### 14) Development Notes

- Code style: explicit types, readable names, early returns, minimal nesting
- Mermaid is dynamically loaded; avoid SSR for that component
- Avoid logging sensitive data in production builds

### 15) File Index (Pointers)

- `src/components/DocumentInput.tsx`: input, sample selector, submit
- `src/components/AnalysisResults.tsx`: main analysis tabs
- `src/components/Visualizations.tsx`: flows/timelines/responsibilities + fullscreen
- `src/components/MermaidDiagram.tsx`: Mermaid renderer (responsive)
- `src/services/gemini.ts`: analysis, chat, and visualization service calls
- `src/types/legal.ts`: core types, including VisualizationBundle
