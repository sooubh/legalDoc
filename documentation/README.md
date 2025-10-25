## LegalEase AI – Document Analyzer

A fast, modern web app that analyzes legal documents clause-by-clause, generates plain-language explanations, and provides role-specific perspectives (e.g., Tenant vs Landlord, Employee vs Employer, Consumer vs Business). Built with Vite + React + TypeScript + Tailwind and powered by Google's Gemini API.

> 📚 **Comprehensive Documentation Available**: This project includes detailed documentation covering architecture, API services, deployment, and more. See the documentation files below for complete information.

### Key Features

- **Chunked document analysis**: Splits long documents into overlapping chunks for reliable extraction. Merges clauses, risks, action points, and citations across chunks with de-duplication.
  - Ensures Risk Radar, Action Points, and Legal Citations populate consistently on large inputs.
- **Clause insights**: Breaks documents into clauses with titles, original text, simplified explanations, risk levels, and analysis.
- **Role-specific perspectives**: For each clause, shows tailored interpretations, obligations, and risks for relevant roles:
  - Tenancy: Tenant, Landlord
  - Employment: Employee, Employer
  - Consumer contracts: Consumer, Business
- **Plain summary**: A brief summary of the whole document in selected language.
- **Risk radar**: Consolidated list of risks with severities and recommendations.
- **Action points**: Concrete follow-ups derived from the analysis.
- **Citations (optional)**: Includes real, verifiable sources only when confidently inferable.
- **Bilingual support**: English and Hindi outputs for summaries/explanations.
- **Multiple simplification levels**: `professional`, `simple`, `eli5`.
-
- **Try Sample Contracts (EN/HI)**: Built-in long-form samples with selector:
  - Service Agreement, Mutual NDA, Residential Lease
  - Choose a sample and click "Try Sample Contract" to auto-fill and analyze
- **Robust inputs**: Paste text or drag-and-drop PDFs; PDF text extraction with pdf.js and OCR fallback via Tesseract when needed
- **Visualizations**: Auto-generated flowcharts and timelines with fullscreen view and scrollable containers to avoid overlap
- **Modern UI shell**: Sidebar navigation (Upload, Results, Visuals, Chat, Profile, More), top bar with disclaimer, and sticky PDF viewer panel in Results.
- **Fullscreen pop view**: One-click Fullscreen on Analysis, Visualizations, and Original Document opens a modal covering the entire window.
- **Light/Dark theme**: Class-based dark mode with persistent toggle in the sidebar bottom section.

### Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Model API**: Google Generative AI (Gemini)

### Getting Started

#### 1) Prerequisites

- Node.js 18+
- A Google Gemini API key

#### 2) Install dependencies

```bash
npm install
```

#### 3) Environment variables

Create a `.env` file in the project root (same folder as `package.json`):

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Vite exposes env vars prefixed with `VITE_`. The app reads `VITE_GEMINI_API_KEY` at runtime.

#### 4) Start the dev server

```bash
npm run dev
```

#### 5) Build for production

```bash
npm run build
npm run preview
```

### Project Structure

```text
legal/
  src/
    components/
      AnalysisResults.tsx      # Renders summary, clauses, role-specific views, risks, actions, citations
      DocumentInput.tsx        # Paste/upload, sample selector, triggers analysis
      ChatPanel.tsx, ChatFloating.tsx # Optional Q&A on top of the document
      AppShell.tsx              # Top bar + sidebar shell with theme toggle and bottom actions
      FullscreenModal.tsx       # Reusable fullscreen pop-over wrapper
      OriginalContent.tsx       # Sticky panel wrapper for document content/PDF
      PdfViewer.tsx             # Embedded PDF.js canvas viewer (height-aware)
      MermaidDiagram.tsx       # Mermaid renderer (responsive SVG, scroll-safe)
      ProfilePage.tsx           # Placeholder profile view
      MorePage.tsx              # Placeholder more/settings/help view
    services/
      gemini.ts                # Chunked analysis, JSON prompts, API calls, response mapping
    types/
      legal.ts                 # Core types including Clause, RolePerspective, DocumentAnalysis
      chat.ts                  # Chat message and request types
    App.tsx, main.tsx, index.css
  vite.config.ts, tailwind.config.js, tsconfig*.json
```

### Core Data Model (TypeScript)

```ts
export type SimplificationLevel = "professional" | "simple" | "eli5";

export type RoleType =
  | "Tenant"
  | "Landlord"
  | "Employee"
  | "Employer"
  | "Consumer"
  | "Business";

export interface RolePerspective {
  role: RoleType;
  interpretation: string;
  obligations: string[];
  risks: string[];
}

export interface Clause {
  id: string;
  title: string;
  originalText: string;
  simplifiedText: string;
  riskLevel: "low" | "medium" | "high";
  explanation: string;
  rolePerspectives?: RolePerspective[];
}

export interface Risk {
  id: string;
  clause: string;
  description: string;
  severity: "low" | "medium" | "high";
  recommendation: string;
}

export interface Citation {
  title: string;
  url: string;
  description: string;
}

export interface DocumentAnalysis {
  id: string;
  documentType: string;
  plainSummary: string;
  clauses: Clause[];
  risks: Risk[];
  actionPoints: string[];
  citations: Citation[];
}
```

### Prompting, Chunking and Response Mapping

The `src/services/gemini.ts` file builds strict JSON-only prompts and maps responses into the strongly typed `DocumentAnalysis` shape. It performs chunked analysis to improve reliability on long documents.

- The prompts instruct Gemini to:
  - Identify clauses with `title`, `originalText`, `simplifiedText`, `riskLevel`, `explanation`.
  - Include `rolePerspectives` per clause where relevant. Each item includes `role`, `interpretation`, `obligations`, `risks`.
  - Provide risks, action points, and citations only if confidently inferable.
  - Respect selected language (English/Hindi) and simplification level.
- Chunking strategy:
  - Splits text into ~4k-character chunks with ~400-character overlap, tries to end at paragraph boundaries.
  - Analyzes each chunk independently with a chunk-focused prompt.
  - Merges and de-duplicates results across chunks (stable keys for clauses/risks, URL validation for citations).
  - Synthesizes a final plain summary if needed based on merged items.
- The mapper is defensive:
  - Parses JSON only; any non-JSON output raises a parsing error.
  - Falls back to defaults for missing fields and validates enum values.

### UI Flow

1. User lands in the sidebar shell; Upload page shows `DocumentInput` (paste/upload/sample + language + simplification).
2. App calls `analyzeDocumentWithGemini` with chunking enabled.
3. Results page shows `AnalysisResults` with five tabs:
   - Plain Summary
   - Clause Lens (with role-specific views inside each clause accordion)
   - Risk Radar
   - Action Points
   - Legal Citations
4. Sticky Original Document panel (with PDF viewer) stays fixed at the right.
5. Visualizations appear below Analysis (flows, timelines, responsibilities), each with Fullscreen.
6. Optional chat available via floating button or Chat page.

Notes:

- Sample selector (EN/HI) auto-fills text and immediately triggers analysis.
- Flowchart and Timeline panels are scrollable and have fullscreen modals.

### Visualization Outputs (Timelines, Flows, Responsibilities)

- Use `generateVisualizationsWithGemini` to produce a `VisualizationBundle` with:
  - `timelines`: obligations as milestones with when-descriptions (absolute or relative)
  - `flows`: process graphs for termination/renewal/disputes with nodes and edges
  - `responsibilities`: a side-by-side matrix comparing responsibilities for two parties
- Example:

```ts
import { generateVisualizationsWithGemini } from "./src/services/gemini";

const visuals = await generateVisualizationsWithGemini({
  document: contractText,
  language: "en",
  partyALabel: "Tenant",
  partyBLabel: "Landlord",
});

// visuals.timelines -> Gantt-ready data
// visuals.flows -> can be converted to Mermaid/flowchart-js
// visuals.responsibilities -> table-ready data
```

Rendering:

- Flowchart and Timeline are rendered with Mermaid inside fixed-height, scrollable containers to prevent overlap.
- Fullscreen buttons open large modal views for detailed inspection.

### Role-specific Views in the UI

In `AnalysisResults.tsx`, each expanded clause shows a "Role-specific views" section when `rolePerspectives` is present. For each role, it renders:

- **Interpretation**: A concise explanation of the clause from that role’s perspective.
- **Obligations**: Bullet points listing what that role must do/avoid.
- **Risks**: Bullet points listing risks or watch-outs.

### Internationalization (English/Hindi)

- The analysis prompt switches language for `plainSummary` and explanations based on user selection.
- The UI text uses a small translation map (`en`/`hi`) for common labels.

### Styling & Theming

- Tailwind CSS utility classes with a light, accessible theme.
- Components use soft borders, subtle shadows, and a responsive grid.
- Dark mode uses `dark` class on `document.documentElement` (configured via `tailwind.config.js` with `darkMode: "class"`). Toggle is in the sidebar bottom.

### Performance Considerations

- **Model selection**: Uses `gemini-2.0-flash` (or current Gemini Flash) for fast, cost-effective responses.
- **Token usage**: Prompt compaction for chat; JSON-only responses for analysis.
- **Client rendering**: Clause accordions virtualize content by expanding on demand.

### Security and Reliability

- API key is never committed; supplied via Vite env var `VITE_GEMINI_API_KEY`.
- The app logs raw model output and the mapped object to aid debugging during development. Remove or reduce logging for production builds.
- Defensive JSON parsing and minimal runtime validation to avoid UI breakage.

### Extensibility Guide

- **Add more roles**: Extend `RoleType` in `types/legal.ts`, update prompt roles, and optionally add UI badges.
- **Add languages**: Extend the UI translations and pass the new language flag through to prompting.
- **Add models**: Swap `MODEL_NAME` in `services/gemini.ts` or add a selector in settings.
- **Server-side proxy**: If you need to hide the key fully, add a small server (e.g., Cloud Functions/Node) that proxies requests to Gemini.

### Troubleshooting

- "Missing Gemini API key": Ensure `.env` contains `VITE_GEMINI_API_KEY` and that you restarted `npm run dev`.
- "Failed to parse Gemini response as JSON": The model returned text around JSON. Reduce temperature or retry. The current prompt already requests JSON-only; transient errors can still occur.
- Nothing appears under Role-specific views: The model may have deemed roles irrelevant given the text. Try specifying document type hints in the document or re-run with a different simplification level.
- Flowchart/Timeline overlap: Containers are now scrollable; if a diagram still looks clipped, use the Fullscreen button.

### Scripts

```bash
# Start dev server
npm run dev

# Type-check and build
npm run build

# Preview production build locally
npm run preview
```

## 📖 Documentation

This project includes comprehensive documentation:

- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** - Complete project overview, architecture, components, and technical details
- **[API_SERVICES_DOCUMENTATION.md](./API_SERVICES_DOCUMENTATION.md)** - Detailed API integration guide, services, and error handling
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions, environment setup, and troubleshooting

### Quick Start

For a quick start, follow the basic setup below. For detailed instructions, refer to the comprehensive documentation files.

#### 1) Prerequisites

- Node.js 18+
- A Google Gemini API key
- Firebase project setup

#### 2) Install dependencies

```bash
npm install
```

#### 3) Environment variables

Create a `.env` file in the project root:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 4) Start the dev server

```bash
npm run dev
```

#### 5) Build for production

```bash
npm run build
npm run preview
```

## License

This project is provided as-is for demonstration and educational purposes. Review and adapt before using in production. AI-generated content is not legal advice.

---

**Created by Sourabh Singh** - For educational and demonstration purposes.
