# LegalEase AI - Features Documentation

## Table of Contents

1. [Document Analysis](#document-analysis)
2. [Visualizations](#visualizations)
3. [Chat System](#chat-system)
4. [Lawyer Locator](#lawyer-locator)
5. [PDF Operations](#pdf-operations)
6. [Authentication & User Management](#authentication--user-management)
7. [Analysis History](#analysis-history)
8. [Theme System](#theme-system)
9. [Language Support](#language-support)
10. [Authenticity Check](#authenticity-check)
11. [Settings & Preferences](#settings--preferences)

---

## Document Analysis

### Overview
The core feature that analyzes legal documents clause-by-clause, providing simplified explanations, risk assessments, and role-specific perspectives.

### Key Capabilities

#### Chunked Processing
- **Problem**: Large documents exceed AI model token limits
- **Solution**: Documents split into ~4000-character chunks with 400-character overlap
- **Benefit**: Reliable analysis of documents of any length
- **Process**:
  1. Split document at paragraph boundaries
  2. Analyze each chunk independently
  3. Merge and deduplicate results
  4. Synthesize final summary

#### Clause-by-Clause Breakdown
Each clause includes:
- **Title**: Descriptive clause heading
- **Original Text**: Verbatim clause content
- **Simplified Text**: Plain language version
- **Risk Level**: Low/Medium/High indicator
- **Explanation**: Detailed clause analysis

#### Role-Specific Perspectives
For applicable documents, provides tailored analysis for each party:
- **Tenancy Agreements**: Tenant vs Landlord
- **Employment Contracts**: Employee vs Employer
- **Consumer Agreements**: Consumer vs Business

Each perspective includes:
- Interpretation from that role's viewpoint
- Specific obligations for that role
- Risks and concerns for that role

#### Risk Radar
Consolidated risk analysis:
- Identifies all potential risks
- Severity ratings (low/medium/high)
- Specific recommendations
- Related clause references

#### Action Points
Concrete next steps derived from analysis:
- Follow-up tasks
- Items requiring clarification
- Documentation needs
- Negotiation points

#### Legal Citations
When confidently inferable:
- Relevant statutes
- Case law references
- Legal principles
- URLs to authoritative sources

### Simplification Levels
- **Professional**: Legal terminology preserved with explanations
- **Simple**: Plain language for general audience
- **ELI5**: Explain Like I'm 5 - extremely simplified

### Language Support
- **English**: Full analysis in English
- **Hindi**: Complete analysis in Hindi (हिंदी)

### Input Methods
1. **Text Paste**: Direct text input
2. **PDF Upload**: Drag-and-drop or click to upload
3. **Sample Contracts**: Pre-loaded examples in both languages

### Sample Contracts
Built-in samples for testing:
- Service Agreement (EN/HI)
- Mutual NDA (EN/HI)
- Residential Lease (EN/HI)

---

## Visualizations

### Overview
Auto-generated visual representations of document structure, processes, and timelines.

### Visualization Types

#### 1. Process Flow Diagrams
**Technology**: Mermaid.js flowcharts

**Generated For**:
- Termination processes
- Renewal procedures
- Dispute resolution flows
- Payment processes

**Features**:
- Node types: Start, Process, Decision, End
- Conditional paths (Yes/No branches)
- Related clause annotations
- Fullscreen viewing
- Responsive SVG rendering

**Example Output**:
```
flowchart TD
    A[Contract Renewal Notice] --> B{60 Days Before Expiry?}
    B -->|Yes| C[Submit Written Notice]
    B -->|No| D[Automatic Renewal]
    C --> E[Landlord Reviews]
    E --> F{Approved?}
    F -->|Yes| G[New Terms Negotiated]
    F -->|No| H[Tenant Must Vacate]
```

#### 2. POV-Based Timelines
**Technology**: react-chrono

**Perspectives**:
- **Court Perspective**: Legal process timeline
- **Receiver Perspective**: Party receiving notice timeline
- **Overall Timeline**: Combined view

**Timeline Elements**:
- Event title and subtitle
- Date (absolute or relative)
- Description
- Color coding by event type
- Icons (file, clock, warning, check)

**Features**:
- Tab-based view switching
- Vertical timeline layout
- Responsive on mobile
- Color-coded by importance

#### 3. Responsibility Matrix
**Format**: Comparative table

**Content**:
- Topic/obligation areas
- Party A responsibilities
- Party B responsibilities
- Related clause references

**Example**:
| Topic | Tenant | Landlord |
|-------|--------|----------|
| Rent Payment | Pay monthly rent by 1st | Accept payment, provide receipt |
| Repairs | Minor repairs < $100 | Major repairs and maintenance |
| Security Deposit | Pay on signing | Return within 30 days after move-out |

### Visualization Features
- **Fullscreen Mode**: Expand any visualization
- **Scrollable Containers**: Prevent layout overflow
- **Theme-Aware**: Adapts to light/dark mode
- **Loading States**: Skeleton screens during generation
- **Error Handling**: Graceful fallbacks

---

## Chat System

### Overview
Context-aware AI chatbot for answering questions about the analyzed document.

### Chat Modes

#### 1. Floating Chat
- Accessible from any page
- Floating action button
- Minimal overlay
- Badge for new messages
- Smooth expand/collapse

#### 2. Chat Panel (Desktop)
- Full sidebar panel
- Dedicated chat page
- Message history
- Larger conversation area

### Features

#### Context Awareness
- All responses based on uploaded document
- References specific clauses
- Maintains conversation context
- Understands follow-up questions

#### Quick Questions
Pre-populated common questions:
- "What are the key obligations?"
- "What are the main risks?"
- "What are the termination conditions?"
- "What is the notice period?"

#### Message Types
- **User Messages**: Right-aligned, blue bubble
- **AI Responses**: Left-aligned, gray bubble
- **System Messages**: Centered, minimal styling

#### Markdown Support
AI responses support:
- **Bold** and *italic* text
- Bullet points and numbered lists
- Code blocks
- Links

#### Real-time Features
- Typing indicator when AI is responding
- Message timestamps
- Auto-scroll to latest message
- Message history persistence

#### Bilingual Chat
- Responds in English or Hindi based on setting
- Maintains language consistency
- Handles code-switching

---

## Lawyer Locator

### Overview
Find lawyers near your location with filtering and detailed profiles.

### Core Features

#### Location Search
- Address input
- Geolocation detection
- City/region search
- Radius filter

#### Lawyer Filtering
- **Specialization**: Filter by practice area
  - Contract Law
  - Property Law
  - Employment Law
  - Family Law
  - Criminal Law
  - etc.
- **Rating**: Minimum star rating
- **Distance**: Maximum distance from location
- **Availability**: Online consultation available

#### Lawyer Profiles
Each profile includes:
- Name and photo
- Bar registration number
- Years of experience
- Specializations (multiple)
- Average rating (1-5 stars)
- Number of reviews
- Contact information (phone, email)
- Office address
- Consultation fees
- Languages spoken

#### Display Modes
1. **List View**: Scrollable list of lawyer cards
2. **Map View**: Interactive map with pins
3. **Combined View**: List + map side-by-side

#### Lawyer Detail Modal
Click any lawyer for detailed view:
- Full profile information
- Client reviews and ratings
- Map with office location
- Quick action buttons:
  - Call
  - Email
  - Get Directions
  - Schedule Consultation

#### Progressive Loading
- Skeleton loading states
- Lazy loading for performance
- Animated card entrance
- Infinite scroll support

---

## PDF Operations

### PDF Upload & Extraction

#### Text Extraction
**Primary Method**: PDF.js
- Parses PDF structure
- Extracts embedded text
- Preserves formatting where possible
- Fast and accurate for digital PDFs

**Fallback Method**: Tesseract.js OCR
- Activates when PDF.js finds no text
- Scans PDF pages as images
- Optical character recognition
- Slower but handles scanned documents

#### PDF Viewer
- Canvas-based rendering
- Page navigation controls
- Zoom in/out functionality
- Responsive sizing
- Error handling for corrupt PDFs

#### Supported Formats
- PDF 1.0 - 2.0
- Both searchable and scanned PDFs
- Multi-page documents
- Protected PDFs (if not encrypted)

### PDF Generation

#### Analysis to PDF Export
Convert analysis results to downloadable PDF:

**Includes**:
- Document type and summary
- All clauses with explanations
- Risk analysis
- Action points
- Legal citations
- Visualizations (as images)

**Features**:
- Multi-page layout
- Professional styling
- Table of contents
- Page numbers
- Metadata (title, author, date)

**Technology Stack**:
- jsPDF for PDF creation
- html2canvas for visualization capture
- Custom styling and layout

#### Download Options
- Save to device
- Print directly
- Share via email/cloud

---

## Authentication & User Management

### Authentication Methods

#### Email/Password
- Standard signup and login
- Password strength validation
- Password reset via email
- Email verification

#### Google OAuth
**One-click authentication**:
- Sign in with Google
- Sign up with Google
- Automatic profile creation
- Photo import from Google account

### User Profiles

#### Profile Information
- Display name
- Email address
- Profile photo
- Account creation date
- Preferences (language, theme, etc.)

#### Profile Management
- Edit profile details
- Upload custom photo
- Change email
- Change password
- Delete account

### User Preferences

Synchronized across devices via Firestore:
- **Language**: English or Hindi
- **Theme**: Light or Dark mode
- **Default Simplification Level**: Professional/Simple/ELI5
- **Auto-save Analyses**: Enable/disable

#### Real-time Sync
- Changes sync across all devices
- Firestore real-time listeners
- Instant updates without refresh
- Offline-first with sync on reconnect

---

## Analysis History

### Overview
Save, manage, and revisit previous document analyses.

### Storage Layers

#### 1. Local Storage (Fallback)
- Stores last 100 analyses locally
- Persists across sessions
- Works offline
- No authentication required

#### 2. Firestore (Cloud Storage)
- Unlimited storage for authenticated users
- Syncs across devices
- Persistent and secure
- Shareable (future feature)

### History Features

#### Save Analysis
- Manual save button
- Automatic save on analysis completion (if enabled)
- Includes:
  - Original document text
  - Complete analysis results
  - Visualizations
  - Metadata (language, simplification level)
  - Timestamp

#### View History
- Sidebar list of saved analyses
- Sorted by most recent
- Thumbnail/preview
- Click to load

#### Delete Analysis
- Delete from history
- Confirmation dialog
- Removes from both local and cloud storage
- Optimistic UI update

#### Analysis Metadata
Each saved analysis stores:
```typescript
{
  id: string;
  title: string; // First 100 chars of document type
  analysis: DocumentAnalysis;
  originalContent: string;
  visuals: VisualizationBundle;
  metadata: {
    language: "en" | "hi";
    simplificationLevel: SimplificationLevel;
  };
  timestamp: Date;
  pdfData?: string; // Base64 if uploaded as PDF
  pdfFileName?: string;
}
```

#### History UI
- Compact list view in sidebar
- Title and date display
- Selected item highlighting
- Delete icon on hover
- Empty state for new users

---

## Theme System

### Light and Dark Modes

#### Theme Toggle
- Switch button in sidebar
- Persists to localStorage
- Instant switching (no flicker)
- Smooth transitions

#### Color System
**Semantic Color Tokens**:
Based on HSL color space for consistent theming:

**Light Mode**:
- Background: Pure white
- Foreground: Dark blue-gray
- Primary: Vibrant blue
- Card: White with subtle shadow

**Dark Mode**:
- Background: Deep blue-black
- Foreground: Off-white
- Primary: Lighter blue
- Card: Dark blue-gray

#### CSS Custom Properties
```css
--background
--foreground
--card / --card-foreground
--primary / --primary-foreground
--secondary / --secondary-foreground
--muted / --muted-foreground
--accent / --accent-foreground
--destructive / --destructive-foreground
--border
--input
--ring
```

#### Theme Application
- Applied via `dark` class on `<html>`
- Tailwind dark mode: `class` strategy
- All components use semantic tokens
- No hardcoded colors

---

## Language Support

### Supported Languages
1. **English** (Default)
2. **हिंदी** (Hindi)

### Language Selection

#### First-Time Setup
- Modal on first visit
- Choice between English and Hindi
- Flag icons for visual recognition
- Can be changed later

#### Language Switching
- Header dropdown menu
- Instant switch without reload
- Persists to:
  - localStorage
  - User preferences (if logged in)
  - Syncs across devices

### Bilingual Content

#### UI Translation
Common labels translated:
- Navigation items
- Button text
- Form labels
- Error messages
- Toast notifications

#### AI Responses
All AI-generated content in selected language:
- Plain summary
- Clause explanations
- Risk descriptions
- Action points
- Chat responses

#### Sample Contracts
Pre-loaded samples in both languages:
- English samples
- Hindi translations (not literal, contextually adapted)

---

## Authenticity Check

### Overview
Analyzes document authenticity and compliance with legal standards.

### Analysis Components

#### Authenticity Score
- **Range**: 0-100
- **Calculation**: Based on multiple factors
- **Display**: Progress bar with color coding

#### Compliance Check
- **Status**: Compliant or Non-compliant
- **Standard**: Referenced law (e.g., "Indian Contract Act, 1872")
- **Details**: Specific compliance points

#### Red Flags
List of concerning elements:
- Missing mandatory clauses
- Unusual terms
- Potential legal issues
- Drafting errors

#### Safety Score
- **Range**: 0-100
- **Assessment**: Overall safety for signing
- **Analysis**: Detailed safety analysis text

#### Fake Indication
- **Levels**: Low, Medium, High
- **Purpose**: Warns about potentially fabricated documents

#### Recommendations
- Suggested actions before signing
- Items to negotiate
- Points to clarify
- Whether to seek legal counsel

### Display
- Dedicated tab in AnalysisResults
- Visual indicators (color-coded)
- Expandable details
- Print-friendly format

---

## Settings & Preferences

### API Configuration

#### Gemini API Key
- Input field for API key
- Validation on submit
- Secure storage (environment variable preferred)
- Fallback to user-provided key
- Testing connection button

### User Preferences

#### Default Language
- Set preferred language
- Syncs to Firestore
- Applies to all analyses

#### Default Simplification Level
- Choose default: Professional/Simple/ELI5
- Can be overridden per analysis

#### Theme Preference
- Light or Dark mode
- System preference detection option

### Data Management

#### Clear Cache
- Clear local analysis history
- Clear browser cache
- Reset preferences to defaults

#### Export Data
- Download all saved analyses
- JSON format
- Includes metadata

#### Delete Account
- Permanent account deletion
- Remove all user data
- Confirmation required

### About Section
- Application version
- Credits and attribution
- Contact information
- Links to documentation

---

## Feature Integration

### Cross-Feature Workflows

#### Analyze → Save → Chat
1. Upload document
2. View analysis
3. Save to history
4. Ask questions via chat
5. Download PDF report

#### Analyze → Find Lawyer
1. Identify complex terms or risks
2. Navigate to Lawyer Locator
3. Find specialist in relevant field
4. Contact for consultation

#### History → Re-analyze
1. Load previous analysis
2. View original document
3. Re-run with different settings
4. Compare results

### Feature Accessibility

**All features accessible from**:
- Sidebar navigation (desktop)
- Bottom navigation (mobile)
- Floating action buttons
- Contextual menu items

---

_For detailed API documentation, see [API_SERVICES_DOCUMENTATION.md](./API_SERVICES_DOCUMENTATION.md). For component implementation, see [COMPONENTS.md](./COMPONENTS.md)._
