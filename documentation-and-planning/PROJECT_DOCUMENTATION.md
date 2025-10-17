## LegalEase AI — Project Documentation and Planning

### 1) Overview

LegalEase AI is a web app that analyzes legal documents into clear, structured outputs: clause-by-clause explanations, risks, action points, role-specific perspectives, and visualizations (flows, timelines, responsibilities). It uses React + TypeScript + Tailwind on the frontend and Google's Gemini API for analysis and visualization generation.

### 2) Key Features

- Chunked document analysis with de-duplication (clauses, risks, actions, citations)
- Role-specific perspectives (e.g., Tenant/Landlord, Employee/Employer)
- Bilingual output (English/Hindi) and multiple simplification levels
- Try Sample Contracts (EN/HI): Service Agreement, Mutual NDA, Residential Lease
- Text paste and PDF upload with pdf.js extraction and Tesseract OCR fallback
- Auto-generated Visualizations: Flowchart, Timeline, Responsibilities matrix
- Scroll-safe panels, sticky PDF viewer in Results, and fullscreen modals for Analysis/Visuals/Document
- Optional chat on top of the analyzed document

### 3) Architecture

- UI: React (Vite), TypeScript, Tailwind CSS
- Services: `src/services/gemini.ts` builds prompts, calls Gemini, maps JSON response to strong types
- Types: `src/types/legal.ts`, `src/types/chat.ts`
- Components: `AppShell` (sidebar/topbar), `DocumentInput`, `AnalysisResults`, `Visualizations`, `MermaidDiagram`, `ChatPanel`, `ChatFloating`, `OriginalContent`, `PdfViewer`, `FullscreenModal`, `ProfilePage`, `MorePage`, `LoadingScreen`
- Diagram rendering: `MermaidDiagram.tsx` dynamically imports Mermaid and injects responsive SVG

### 4) Setup & Environment

Prereqs: Node.js 18+, Gemini API key

Steps:

- `npm install`
- Create `.env` with `VITE_GEMINI_API_KEY=your_key`
- `npm run dev` to start; `npm run build && npm run preview` for production preview

### 5) Data Model (Summary)

- DocumentAnalysis: id, documentType, plainSummary, clauses[], risks[], actionPoints[], citations[]
- Clause: id, title, originalText, simplifiedText, riskLevel, explanation, rolePerspectives[]
- RolePerspective: role, interpretation, obligations[], risks[]
- VisualizationBundle: timelines[], flows[], responsibilities

See `src/types/legal.ts` for full details.

### 6) Core Workflows

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

### 7) UI Flow

1. AppShell sidebar shows pages: Upload, Results, Visuals, Chat, Profile, More
2. Upload page: `DocumentInput` (paste/upload/sample + language + simplification)
3. Results: `AnalysisResults` + sticky `OriginalContent` (PDF viewer)
4. Visuals: flows/timelines/responsibilities
5. Fullscreen buttons on Analysis/Visuals/Original Document open modal pop views
6. Chat available via floating button or Chat page

### 8) Sample Contracts

- Multilingual, long-form samples with selector in `DocumentInput`:
  - EN: Service Agreement, Mutual NDA, Residential Lease
  - HI: सेवा अनुबंध, परस्पर NDA, आवासीय पट्टा
- Selecting a sample and clicking "Try Sample Contract" auto-fills and triggers analysis

### 9) Visualizations (Rendering Notes)

- Mermaid diagrams injected as responsive SVG (`[_svg]:w-full`, `h-auto`)
- Fixed-height containers (480px) with `overflow-auto` to prevent overlap
- Fullscreen modal view for detailed diagrams

### 10) Error Handling & Troubleshooting

- Missing key: ensure `.env` has `VITE_GEMINI_API_KEY` and restart dev server
- Non-JSON output: transient; retry; JSON-only prompt already enforced
- Empty role views: may be irrelevant for provided text; try another sample or adjust level
- Diagram overlap/clipping: use scroll or Fullscreen (containers are scroll-safe)

### 11) Roadmap

- Export/Share: PDF/Markdown export of analysis & visuals
- More languages: add support beyond EN/HI
- Advanced settings: model selector, temperature, tokens
- Fine-tuned prompts: per document type (e.g., Lease vs Employment)
- Server proxy: optional API gateway to hide keys more strictly

### 12) Development Notes

- Code style: explicit types, readable names, early returns, minimal nesting
- Mermaid is dynamically loaded; avoid SSR for that component
- Avoid logging sensitive data in production builds

### 13) File Index (Pointers)

- `src/components/DocumentInput.tsx`: input, sample selector, submit
- `src/components/AnalysisResults.tsx`: main analysis tabs
- `src/components/Visualizations.tsx`: flows/timelines/responsibilities + fullscreen
- `src/components/MermaidDiagram.tsx`: Mermaid renderer (responsive)
- `src/services/gemini.ts`: analysis, chat, and visualization service calls
- `src/types/legal.ts`: core types, including VisualizationBundle
