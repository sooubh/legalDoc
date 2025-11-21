# LegalEase AI - System Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Component Hierarchy](#component-hierarchy)
5. [State Management](#state-management)
6. [Routing System](#routing-system)
7. [Data Flow](#data-flow)
8. [Module Dependencies](#module-dependencies)
9. [Design Principles](#design-principles)

---

## System Overview

LegalEase AI is a client-side React application that analyzes legal documents using Google's Gemini AI API. The application follows a modular, component-based architecture with clear separation of concerns between UI components, business logic services, and data types.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │ Analysis │  │ ChatBot  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                    Application Logic Layer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   App    │  │  Hooks   │  │  Utils   │  │  Types   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                      Services Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Gemini  │  │ Firebase │  │   PDF    │  │  Analysis│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                    External Services Layer                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Gemini   │  │ Firebase │  │  PDF.js  │  │Tesseract │   │
│  │   API    │  │ Services │  │          │  │   OCR    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Framework
- **React 19.0.0**: Modern UI library with hooks
- **TypeScript 5.5.3**: Type-safe development
- **Vite 6.4.0**: Fast build tool and dev server

### Styling & UI
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Framer Motion 11.3.8**: Animation library
- **Lucide React 0.400.0**: Icon library
- **Custom CSS Variables**: Semantic theming system

### AI & API Integration
- **@google/generative-ai 0.24.1**: Gemini API client
- **Firebase 12.4.0**: Authentication and Firestore database
- **OpenAI 5.19.1**: Alternative AI provider (optional)

### PDF Processing
- **pdfjs-dist 5.4.149**: PDF rendering and text extraction
- **Tesseract.js 6.0.1**: OCR for scanned PDFs
- **jsPDF 3.0.3**: PDF generation
- **html2canvas 1.4.1**: HTML to canvas conversion

### Visualization & Markdown
- **Mermaid 11.11.0**: Diagram rendering
- **react-markdown 9.0.3**: Markdown rendering
- **react-chrono 2.4.2**: Timeline visualization
- **remark-gfm 4.0.0**: GitHub Flavored Markdown

### Build & Development Tools
- **ESLint**: Code linting
- **PostCSS & Autoprefixer**: CSS processing
- **TypeScript ESLint**: TypeScript linting

---

## Architecture Patterns

### 1. Component-Based Architecture
The application is built using React functional components with hooks for state and side effects.

### 2. Service Layer Pattern
Business logic is separated into service modules:
- **gemini.ts**: AI analysis and chat
- **firebase.ts**: Authentication and database
- **analysis.ts**: Analysis history management
- **pdfService.ts**: PDF processing
- **userService.ts**: User profile management

### 3. Type-Driven Development
All data structures are defined in TypeScript interfaces in `src/types/`:
- **legal.ts**: Core analysis types
- **history.ts**: History management types
- **chat.ts**: Chat system types
- **user.ts**: User profile types

### 4. Client-Side Routing
Single-page application with client-side route management using a custom routing system based on React state.

### 5. Optimistic UI Updates
User actions (save, delete) update the UI immediately with rollback on error.

---

## Component Hierarchy

```
App (Root Component)
├── AppShell (Main Layout)
│   ├── Header (Mobile)
│   ├── Sidebar (Desktop)
│   │   ├── Navigation Items
│   │   ├── AnalysisHistorySidebar
│   │   └── Theme Toggle
│   └── Main Content Area
│       ├── DocumentInput (Upload Page)
│       ├── AnalysisResults (Results Page)
│       ├── Visualizations (Visuals Page)
│       ├── ChatPanel (Chat Page)
│       ├── LawyerLocatorPage (Lawyer Page)
│       ├── ProfilePage (Profile Page)
│       ├── SettingsPage (Settings Page)
│       ├── RoadmapPage (Roadmap Page)
│       ├── VideoShowcasePage (Video Page)
│       ├── MorePage (More Page)
│       ├── LoginPage (Login Modal)
│       ├── SignupPage (Signup Modal)
│       ├── TermsAndConditionsPage
│       └── PrivacyPolicyPage
├── ChatFloating (Floating Chat Button)
├── FullscreenModal (Reusable Modal)
├── VideoShowcaseModal (Onboarding Video)
├── ToastContainer (Toast Notifications)
└── LoadingScreen (Loading Overlay)
```

### Component Organization

#### Core Components (`src/components/`)
- `AppShell.tsx`: Main application layout
- `DocumentInput.tsx`: Document upload and input
- `FullscreenModal.tsx`: Fullscreen modal wrapper
- `LoadingScreen.tsx`: Loading animation
- `MermaidDiagram.tsx`: Mermaid diagram renderer
- `OriginalContent.tsx`: Document content display
- `PdfViewer.tsx`: PDF rendering component
- `Toast.tsx` & `ToastContainer.tsx`: Notification system
- `VideoShowcaseModal.tsx`: Video showcase popup
- `Visualizations.tsx`: Visualization container
- `LegalNoticeTimelinePOV.tsx`: POV-based timeline

#### Analysis Components (`src/analysis/`)
- `AnalysisResults.tsx`: Main analysis display
- `AnalysisHistorySidebar.tsx`: History sidebar

#### Chat Components (`src/chatbot/`)
- `ChatPanel.tsx`: Full chat interface
- `ChatFloating.tsx`: Floating chat button

#### Map Components (`src/mapsComponents/`)
- `LawyerCard.tsx`: Lawyer information card
- `LawyerDetailModal.tsx`: Lawyer detail modal
- `LawyerList.tsx`: List of lawyers
- `LawyerSearch.tsx`: Search interface
- `LawyerCardSkeleton.tsx`: Loading skeleton
- `LegalAnalyzer.tsx`: Legal analysis integration
- `Spinner.tsx`: Loading spinner
- `Header.tsx`: Map header
- `Icons.tsx`: Custom icons

#### Page Components (`src/pages/`)
- `LawyerLocatorPage.tsx`: Find lawyers near you
- `LoginPage.tsx`: User login
- `SignupPage.tsx`: User registration
- `ProfilePage.tsx`: User profile
- `SettingsPage.tsx`: User settings
- `MorePage.tsx`: Additional options
- `RoadmapPage.tsx`: Feature roadmap
- `VideoShowcasePage.tsx`: Video tutorials
- `TermsAndConditionsPage.tsx`: Terms of service
- `PrivacyPolicyPage.tsx`: Privacy policy

#### PDF Components (`src/pdfDownlode/`)
- `generatePdfFromAnalysis.ts`: PDF generation logic
- `Loader.tsx`: PDF loading state
- `PdfPreview.tsx`: PDF preview component
- `icons.tsx`: PDF-related icons

---

## State Management

### Global State (React State in App.tsx)
The application uses React hooks for state management with the main state in `App.tsx`:

```typescript
// Authentication
const [user, setUser] = useState<User | null>(null);

// Analysis State
const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
const [visuals, setVisuals] = useState<VisualizationBundle | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);

// UI State
const [route, setRoute] = useState<Route>("upload");
const [language, setLanguage] = useState<"en" | "hi">("en");
const [simplificationLevel, setSimplificationLevel] = useState("simple");

// History
const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>();

// Document State
const [submittedContent, setSubmittedContent] = useState<string>("");
const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

// Modal States
const [showLanguageModal, setShowLanguageModal] = useState(false);
const [showVideoModal, setShowVideoModal] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);
```

### Local Storage
- **language**: User's preferred language (en/hi)
- **theme**: Dark/light mode preference
- **videoShowcaseSeen**: Whether user has seen the video
- **localAnalyses**: Local analysis history (fallback)
- **unsavedAnalysis**: Current unsaved analysis
- **previousRoute**: Previous route before modal

### Firebase Firestore
- **users/{userId}**: User profiles and preferences
- **analyses/{analysisId}**: Saved analysis documents

### Session State
- Firebase Authentication state (onAuthStateChanged)
- Real-time user profile subscriptions

---

## Routing System

The application uses a custom client-side routing system based on React state rather than React Router.

### Route Type
```typescript
export type Route =
  | "login"
  | "signup"
  | "upload"
  | "results"
  | "visuals"
  | "profile"
  | "more"
  | "lawyer"
  | "roadmap"
  | "video"
  | "settings"
  | "terms"
  | "privacy";
```

### Route Management
- Routes are managed via `route` state in `App.tsx`
- Navigation is handled through `onNavigate` callback prop
- Modal routes (login/signup/terms/privacy) overlay current page
- Protected routes check authentication state

### Navigation Flow
1. User clicks navigation item
2. `AppShell` calls `onNavigate` callback
3. `App.tsx` updates `route` state
4. Conditional rendering shows appropriate page
5. Previous route saved for modal flows

---

## Data Flow

### Document Analysis Flow

```
User Input (Text/PDF)
    ↓
DocumentInput Component
    ↓
handleDocumentSubmit in App.tsx
    ↓
analyzeDocumentWithGemini (service)
    ↓
┌─────────────────────────────┐
│  Chunking Strategy          │
│  1. Split into chunks       │
│  2. Analyze each chunk      │
│  3. Merge and deduplicate   │
└─────────────────────────────┘
    ↓
DocumentAnalysis Object
    ↓
setAnalysis (state update)
    ↓
AnalysisResults Component
    ↓
Display to User
    ↓
Save to Firebase (optional)
```

### Visualization Generation Flow

```
Document Content
    ↓
generateVisualizationsWithGemini
    ↓
VisualizationBundle Object
    ↓
setVisuals (state update)
    ↓
Visualizations Component
    ↓
Mermaid Diagrams + Tables
```

### Authentication Flow

```
User Login/Signup
    ↓
Firebase Auth
    ↓
onAuthStateChanged
    ↓
setUser (state update)
    ↓
getUserProfile (Firestore)
    ↓
subscribeToUserProfile
    ↓
Real-time updates
```

---

## Module Dependencies

### Core Dependencies
```
App.tsx
├── Components
│   ├── AppShell
│   ├── DocumentInput
│   ├── AnalysisResults
│   └── Visualizations
├── Services
│   ├── gemini (AI analysis)
│   ├── firebase (auth & database)
│   ├── analysis (history management)
│   └── userService (profile management)
└── Types
    ├── legal (analysis types)
    ├── history (history types)
    └── user (user types)
```

### Service Layer Dependencies
```
gemini.ts
├── @google/generative-ai
├── jsonrepair (JSON fixing)
└── types/legal.ts

firebase.ts
├── firebase/app
├── firebase/auth
└── firebase/firestore

pdfService.ts
├── pdfjs-dist
└── tesseract.js

analysis.ts
├── firebase.ts
└── types/legal.ts
```

---

## Design Principles

### 1. Component Reusability
- Components are designed to be reusable and composable
- Props-based configuration for flexibility
- Generic components (FullscreenModal, Toast) used across features

### 2. Type Safety
- Strict TypeScript configuration
- All data structures explicitly typed
- Minimal use of `any` type

### 3. Performance Optimization
- **Lazy Loading**: Dynamic imports for large dependencies
- **Memoization**: React useMemo/useCallback where appropriate
- **Chunked Processing**: Large documents split into chunks
- **Optimistic Updates**: UI updates before server confirmation

### 4. Error Handling
- Try-catch blocks in all async operations
- User-friendly error messages
- Fallback UI for error states
- Retry logic for API calls

### 5. Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Screen reader compatible

### 6. Responsive Design
- Mobile-first approach
- Tailwind responsive classes
- Adaptive layouts for different screen sizes
- Touch-friendly interface on mobile

### 7. Offline-First Capabilities
- Local storage for unsaved analyses
- Fallback to local data when offline
- Progressive enhancement

### 8. Security
- API keys in environment variables
- Firebase security rules
- No sensitive data in localStorage
- HTTPS-only in production

---

## Build & Deployment Architecture

### Development
```
npm run dev
    ↓
Vite Dev Server
    ↓
Hot Module Replacement
    ↓
http://localhost:5173
```

### Production Build
```
npm run build
    ↓
TypeScript Compilation
    ↓
Vite Build (Rollup)
    ↓
Asset Optimization
    ↓
dist/ folder
    ↓
Firebase Hosting
```

### Environment Configuration
- `.env` file for local development
- Firebase hosting configuration
- Vite environment variable handling (`VITE_` prefix)

---

_This architecture documentation serves as a high-level guide to the LegalEase AI system design. For specific implementation details, refer to individual component and service documentation._
