# LegalEase AI - Components Documentation

## Table of Contents

1. [Core Components](#core-components)
2. [Analysis Components](#analysis-components)
3. [Chat Components](#chat-components)
4. [Map/Lawyer Locator Components](#maplayyer-locator-components)
5. [PDF Components](#pdf-components)
6. [Page Components](#page-components)
7. [UI Utility Components](#ui-utility-components)
8. [Header/Footer Components](#headerfooter-components)

---

## Core Components

### AppShell

**Location**: `src/components/AppShell.tsx`

Main application layout component that provides the shell structure with sidebar navigation and top bar.

**Props**:
```typescript
interface AppShellProps {
  current: Route;
  onNavigate: (route: Route) => void;
  analysisHistory: AnalysisHistoryItem[];
  selectedAnalysisId?: string;
  onSelectAnalysis: (item: AnalysisHistoryItem) => void;
  onFetchHistory: () => void;
  onDeleteAnalysis: (id: string) => void;
  onSave: () => void;
  onDownload: () => void;
  isSaved: boolean;
  isGeneratingPdf: boolean;
  user: User | null;
  onLogout: () => void;
  onLogin: () => void;
  onSignup: () => void;
  language: "en" | "hi";
  onLanguageChange: (lang: "en" | "hi") => void;
  children: React.ReactNode;
}
```

**Features**:
- Responsive sidebar (desktop) and bottom navigation (mobile)
- History sidebar integration
- Theme toggle (light/dark mode)
- User authentication display
- Language selector
- Save and download buttons

**Usage**:
```tsx
<AppShell
  current={route}
  onNavigate={setRoute}
  analysisHistory={history}
  onSelectAnalysis={handleSelect}
  user={user}
  language={language}
>
  {children}
</AppShell>
```

---

### DocumentInput

**Location**: `src/components/DocumentInput.tsx`

Document upload and text input component with sample contract selector.

**Props**:
```typescript
interface DocumentInputProps {
  onSubmit: (content: string, fileMeta?: { pdfUrl?: string; mime?: string }) => void;
  isAnalyzing: boolean;
  language: "en" | "hi";
}
```

**Features**:
- Text paste input
- PDF file upload with drag-and-drop
- Sample contract selector (English/Hindi)
- Language and simplification level selection
- PDF text extraction with OCR fallback
- Loading states during analysis

**Usage**:
```tsx
<DocumentInput
  onSubmit={handleDocumentSubmit}
  isAnalyzing={isAnalyzing}
  language={language}
/>
```

---

### FullscreenModal

**Location**: `src/components/FullscreenModal.tsx`

Reusable fullscreen modal wrapper for displaying content in fullscreen overlay.

**Props**:
```typescript
interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

**Features**:
- Backdrop overlay
- Close button
- Keyboard escape support
- Smooth animations
- Scroll lock when open

**Usage**:
```tsx
<FullscreenModal
  isOpen={isFullscreenOpen}
  onClose={() => setIsFullscreenOpen(false)}
  title="Analysis Results"
>
  <AnalysisResults analysis={analysis} />
</FullscreenModal>
```

---

### LoadingScreen

**Location**: `src/components/LoadingScreen.tsx`

Full-screen loading animation display.

**Props**: None

**Features**:
- Animated loading spinner
- Backdrop overlay
- Centered layout
- Smooth fade animations

**Usage**:
```tsx
{isAnalyzing && <LoadingScreen />}
```

---

### MermaidDiagram

**Location**: `src/components/MermaidDiagram.tsx`

Mermaid diagram renderer component for flowcharts and visualizations.

**Props**:
```typescript
interface MermaidDiagramProps {
  chart: string;
  height?: string;
}
```

**Features**:
- Dynamic Mermaid.js loading
- Responsive SVG rendering
- Scrollable container
- Error handling
- Theme-aware styling

**Usage**:
```tsx
<MermaidDiagram
  chart={`flowchart TD\nA[Start] --> B[End]`}
  height="400px"
/>
```

---

### OriginalContent

**Location**: `src/components/OriginalContent.tsx`

Wrapper component for displaying original document content (text or PDF).

**Props**:
```typescript
interface OriginalContentProps {
  content: string;
  pdfUrl?: string;
  height?: string;
}
```

**Features**:
- Conditional rendering (text vs PDF)
- Scrollable text display
- PDF viewer integration
- Responsive height

**Usage**:
```tsx
<OriginalContent
  content={documentText}
  pdfUrl={pdfUrl}
  height="calc(100vh - 96px)"
/>
```

---

### PdfViewer

**Location**: `src/components/PdfViewer.tsx`

PDF document viewer using PDF.js.

**Props**:
```typescript
interface PdfViewerProps {
  url: string;
  height?: string;
}
```

**Features**:
- Canvas-based PDF rendering
- Page navigation (prev/next)
- Zoom controls
- Responsive canvas sizing
- Error handling

**Usage**:
```tsx
<PdfViewer
  url={pdfDataUrl}
  height="600px"
/>
```

---

### Visualizations

**Location**: `src/components/Visualizations.tsx`

Container component for all document visualizations (flowcharts, timelines, responsibilities).

**Props**:
```typescript
interface VisualizationsProps {
  visuals: VisualizationBundle | null;
  isLoading: boolean;
}
```

**Features**:
- Process flow diagrams (Mermaid)
- POV-based timelines (react-chrono)
- Responsibility matrix table
- Loading states
- Fullscreen support
- Tab navigation between visualization types

**Usage**:
```tsx
<Visualizations
  visuals={visualizationBundle}
  isLoading={isVisualsLoading}
/>
```

---

### LegalNoticeTimelinePOV

**Location**: `src/components/LegalNoticeTimelinePOV.tsx`

POV-based timeline visualization using react-chrono.

**Props**:
```typescript
interface LegalNoticeTimelinePOVProps {
  data: POVTimelineData;
}
```

**Features**:
- Court perspective timeline
- Receiver perspective timeline
- Overall timeline view
- Tab-based navigation
- Color-coded events
- Icons for different event types

---

### Toast & ToastContainer

**Location**: `src/components/Toast.tsx`, `src/components/ToastContainer.tsx`

Toast notification system for user feedback.

**Toast Props**:
```typescript
interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  onClose: (id: string) => void;
}
```

**Features**:
- Multiple toast types (success, error, warning, info)
- Auto-dismiss with timer
- Manual close button
- Slide-in animations
- Stacked display
- Color-coded borders

**Usage**:
```tsx
// ToastContainer placed at app root
<ToastContainer />

// Show toast via context or state
showToast({
  type: "success",
  title: "Analysis Saved",
  message: "Your analysis has been saved successfully."
});
```

---

### VideoShowcaseModal

**Location**: `src/components/VideoShowcaseModal.tsx`

Onboarding video showcase modal for new users.

**Props**:
```typescript
interface VideoShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Features**:
- Fullscreen video player
- Skip/close options
- First-time user detection
- LocalStorage persistence

---

## Analysis Components

### AnalysisResults

**Location**: `src/analysis/AnalysisResults.tsx`

Main component for displaying document analysis results with multiple tabs.

**Props**:
```typescript
interface AnalysisResultsProps {
  analysis: DocumentAnalysis;
  language: "en" | "hi";
  simplificationLevel: SimplificationLevel;
  onNewAnalysis: () => void;
  onSave: () => void;
  isSaved: boolean;
}
```

**Features**:
- **Tabs**:
  - Plain Summary
  - Clause Lens (with role perspectives)
  - Risk Radar
  - Action Points
  - Legal Citations
  - Authenticity Check
- Expandable clause accordions
- Risk severity indicators
- Role-specific views per clause
- Copy to clipboard functionality
- New analysis and save buttons

**Usage**:
```tsx
<AnalysisResults
  analysis={analysisData}
  language="en"
  simplificationLevel="simple"
  onNewAnalysis={handleNewAnalysis}
  onSave={handleSave}
  isSaved={false}
/>
```

---

### AnalysisHistorySidebar

**Location**: `src/analysis/AnalysisHistorySidebar.tsx`

Sidebar component showing saved analysis history.

**Props**:
```typescript
interface AnalysisHistorySidebarProps {
  history: AnalysisHistoryItem[];
  selectedId?: string;
  onSelect: (item: AnalysisHistoryItem) => void;
  onDelete: (id: string) => void;
  onFetch: () => void;
  language: "en" | "hi";
}
```

**Features**:
- List of saved analyses
- Delete functionality
- Selection highlighting
- Refresh button
- Empty state display
- Timestamp display

---

## Chat Components

### ChatPanel

**Location**: `src/chatbot/ChatPanel.tsx`

Full chat panel interface for document Q&A.

**Props**:
```typescript
interface ChatPanelProps {
  documentContext: string;
  language: "en" | "hi";
}
```

**Features**:
- Message history display
- User input field
- AI response streaming
- Quick question suggestions
- Typing indicator
- Markdown message rendering
- Context-aware responses
- Scrollable message list

**Usage**:
```tsx
<ChatPanel
  documentContext={submittedContent}
  language={language}
/>
```

---

### ChatFloating

**Location**: `src/chatbot/ChatFloating.tsx`

Floating chat button and minimizable chat interface.

**Props**:
```typescript
interface ChatFloatingProps {
  documentContext: string;
  language: "en" | "hi";
  isOpen: boolean;
  onToggle: () => void;
}
```

**Features**:
- Floating action button
- Expandable chat window
- Minimizable state
- Badge indicator (new messages)
- Smooth animations
- Backdrop overlay

---

## Map/Lawyer Locator Components

### LawyerCard

**Location**: `src/mapsComponents/LawyerCard.tsx`

Card component displaying lawyer information.

**Props**:
```typescript
interface LawyerCardProps {
  lawyer: LawyerData;
  onClick: () => void;
}
```

**Features**:
- Lawyer name and photo
- Specialization badges
- Rating display
- Contact information
- Click to open details
- Hover effects

---

### LawyerDetailModal

**Location**: `src/mapsComponents/LawyerDetailModal.tsx`

Modal showing detailed lawyer information.

**Props**:
```typescript
interface LawyerDetailModalProps {
  lawyer: LawyerData;
  isOpen: boolean;
  onClose: () => void;
}
```

**Features**:
- Full lawyer profile
- Contact details
- Specializations
- Reviews and ratings
- Map location
- Contact buttons (call, email, directions)

---

### LawyerList

**Location**: `src/mapsComponents/LawyerList.tsx`

List view of lawyers with loading states.

**Props**:
```typescript
interface LawyerListProps {
  lawyers: LawyerData[];
  isLoading: boolean;
  onSelectLawyer: (lawyer: LawyerData) => void;
}
```

**Features**:
- Scrollable list
- Loading skeletons
- Empty state
- Click handlers
- Responsive grid

---

### LawyerSearch

**Location**: `src/mapsComponents/LawyerSearch.tsx`

Search and filter interface for finding lawyers.

**Props**:
```typescript
interface LawyerSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
}
```

**Features**:
- Location search input
- Specialization filters
- Rating filters
- Distance filter
- Search button

---

### LegalAnalyzer

**Location**: `src/mapsComponents/LegalAnalyzer.tsx`

Integration component for legal analysis in map context.

**Props**:
```typescript
interface LegalAnalyzerProps {
  documentText: string;
  language: "en" | "hi";
}
```

**Features**:
- Quick analysis trigger
- Results display
- Integration with main analysis flow

---

### LawyerCardSkeleton

**Location**: `src/mapsComponents/LawyerCardSkeleton.tsx`

Loading skeleton for lawyer cards.

**Props**: None

**Features**:
- Animated loading state
- Mimics lawyer card structure
- Pulse animation

---

### Spinner

**Location**: `src/mapsComponents/Spinner.tsx`

General loading spinner component.

**Props**:
```typescript
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}
```

---

## PDF Components

### generatePdfFromAnalysis

**Location**: `src/pdfDownlode/generatePdfFromAnalysis.ts`

Service function to generate PDF from analysis results.

**Function**:
```typescript
export async function generatePdfHtmlFromAnalysis(
  analysis: DocumentAnalysis
): Promise<void>
```

**Features**:
- HTML to PDF conversion
- Multi-page layout
- Styled output
- Includes all analysis sections
- Download trigger

---

### PdfPreview

**Location**: `src/pdfDownlode/PdfPreview.tsx`

Preview component for generated PDFs.

**Props**:
```typescript
interface PdfPreviewProps {
  pdfBlob: Blob;
}
```

---

### Loader

**Location**: `src/pdfDownlode/Loader.tsx`

PDF generation loading indicator.

**Props**: None

---

## Page Components

### LoginPage

**Location**: `src/pages/LoginPage.tsx`

User login page with Firebase authentication.

**Props**:
```typescript
interface LoginPageProps {
  onNavigate: (route: "signup" | "terms" | "privacy") => void;
}
```

**Features**:
- Email/password login
- Google OAuth login
- Form validation
- Error handling
- Link to signup
- Remember me option

---

### SignupPage

**Location**: `src/pages/SignupPage.tsx`

User registration page.

**Props**:
```typescript
interface SignupPageProps {
  onNavigate: (route: "login" | "terms" | "privacy") => void;
}
```

**Features**:
- Email/password signup
- Google OAuth signup
- Form validation
- Password strength indicator
- Terms agreement checkbox

---

### ProfilePage

**Location**: `src/pages/ProfilePage.tsx`

User profile management page.

**Props**: None

**Features**:
- Display user information
- Edit profile details
- Upload profile photo
- View analysis history
- Account settings

---

### SettingsPage

**Location**: `src/pages/SettingsPage.tsx`

Application settings and preferences.

**Props**: None

**Features**:
- API key configuration
- Language preference
- Theme selection
- Simplification level default
- Account management
- Clear cache option

---

### LawyerLocatorPage

**Location**: `src/pages/LawyerLocatorPage.tsx`

Main lawyer locator feature page.

**Props**: None

**Features**:
- Map integration
- Lawyer search
- Filter controls
- List/map view toggle
- Lawyer detail modal

---

### RoadmapPage

**Location**: `src/pages/RoadmapPage.tsx`

Product roadmap and feature timeline.

**Props**: None

**Features**:
- Feature timeline
- Completed features
- In-progress features
- Planned features
- Version history

---

### VideoShowcasePage

**Location**: `src/pages/VideoShowcasePage.tsx`

Video tutorials and showcases.

**Props**: None

**Features**:
- Video gallery
- Tutorial videos
- Feature demonstrations
- Play/pause controls

---

### MorePage

**Location**: `src/pages/MorePage.tsx`

Additional options and information.

**Props**: None

**Features**:
- About section
- Help & FAQ
- Contact information
- Social links
- Version info

---

### TermsAndConditionsPage

**Location**: `src/pages/TermsAndConditionsPage.tsx`

Terms of service page.

**Props**:
```typescript
interface TermsAndConditionsPageProps {
  onNavigate: (route: Route) => void;
  language: "en" | "hi";
}
```

**Features**:
- Bilingual terms
- Scrollable content
- Back navigation
- Last updated date

---

### PrivacyPolicyPage

**Location**: `src/pages/PrivacyPolicyPage.tsx`

Privacy policy page.

**Props**:
```typescript
interface PrivacyPolicyPageProps {
  onNavigate: (route: Route) => void;
  language: "en" | "hi";
}
```

**Features**:
- Bilingual privacy policy
- Data collection details
- User rights
- Contact information

---

## UI Utility Components

### Header & Footer Components

**Location**: `src/headerFooter/`

- `Header.tsx`: Main header component (mobile)
- Additional header/footer utilities

---

## Component Styling Patterns

### Theme Integration
All components use semantic CSS variables for theming:
```css
background-color: hsl(var(--background));
color: hsl(var(--foreground));
border-color: hsl(var(--border));
```

### Responsive Classes
Components use Tailwind responsive prefixes:
```tsx
className="flex flex-col md:flex-row lg:grid lg:grid-cols-2"
```

### Dark Mode
Dark mode styles applied through `.dark` class:
```tsx
className="bg-card dark:bg-card text-card-foreground"
```

### Animations
Framer Motion used for page transitions and animations:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>
  {content}
</motion.div>
```

---

_For service layer documentation, see [API_SERVICES_DOCUMENTATION.md](./API_SERVICES_DOCUMENTATION.md). For feature-specific workflows, see [FEATURES.md](./FEATURES.md)._
