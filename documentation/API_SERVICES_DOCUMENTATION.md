# API Services & Integration Documentation

## Table of Contents

1. [Google Gemini API Integration](#google-gemini-api-integration)
2. [Firebase Services](#firebase-services)
3. [PDF Processing Services](#pdf-processing-services)
4. [Chat System Integration](#chat-system-integration)
5. [Error Handling & Retry Logic](#error-handling--retry-logic)
6. [API Rate Limiting](#api-rate-limiting)
7. [Service Configuration](#service-configuration)

---

## Google Gemini API Integration

### Overview

The application uses Google's Gemini API for document analysis, visualization generation, and chat functionality. The integration is handled through `src/services/gemini.ts`.

### Core Service Functions

#### Document Analysis

```typescript
export interface AnalyzeParams {
  content: string;
  language: "en" | "hi";
  simplificationLevel: SimplificationLevel;
}

async function analyzeDocumentWithGemini(
  params: AnalyzeParams
): Promise<DocumentAnalysis>;
```

**Features:**

- Chunked processing for large documents
- JSON-only response parsing
- Error handling with retry logic
- Language-specific analysis
- Simplification level support

#### Visualization Generation

```typescript
export interface VisualizationParams {
  document: string;
  language: "en" | "hi";
  partyALabel: string;
  partyBLabel: string;
}

async function generateVisualizationsWithGemini(
  params: VisualizationParams
): Promise<VisualizationBundle>;
```

**Output Types:**

- Process flows (Mermaid diagrams)
- Responsibility matrices
- POV-based timelines
- Text summaries

#### Chat System

```typescript
export interface ChatRequest {
  message: string;
  documentContext: string;
  language: "en" | "hi";
}

async function sendChatMessage(request: ChatRequest): Promise<ChatMessage>;
```

### Chunking Strategy

#### Implementation Details

```typescript
function chunkText(text: string, chunkSize = 4000, overlap = 400): string[] {
  // Splits text into overlapping chunks
  // Attempts to end at paragraph boundaries
  // Returns array of text chunks
}
```

#### Chunk Processing Flow

1. **Text Splitting**: Document split into ~4k character chunks
2. **Overlap Handling**: 400-character overlap between chunks
3. **Boundary Detection**: Attempts to end at paragraph boundaries
4. **Individual Analysis**: Each chunk analyzed separately
5. **Result Merging**: Intelligent merging and deduplication
6. **Final Synthesis**: Combined results into coherent analysis

### Response Processing

#### JSON Extraction

````typescript
function extractJsonFromText(raw: string): string | null {
  // Prefers fenced ```json blocks
  // Falls back to brace matching
  // Uses jsonrepair for malformed JSON
}
````

#### Error Handling

- **Parsing Errors**: Automatic JSON repair attempts
- **API Errors**: Retry logic with exponential backoff
- **Rate Limiting**: Built-in rate limit handling
- **Timeout Handling**: Request timeout management

---

## Firebase Services

### Authentication Service (`src/services/firebase.ts`)

#### Configuration

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

#### Authentication Methods

- **Google OAuth**: Primary authentication method
- **Session Persistence**: Automatic session management
- **User State**: Global user state tracking
- **Protected Routes**: Route-based access control

### Firestore Integration

#### Data Models

```typescript
export interface AnalysisHistoryItem {
  id: string;
  title: string;
  analysis: DocumentAnalysis;
  originalContent: string;
  analysisResults: string;
  visuals: VisualizationBundle;
  metadata: {
    language: "en" | "hi";
    simplificationLevel: SimplificationLevel;
  };
  timestamp: any;
  pdfData?: string;
  pdfFileName?: string;
}
```

#### Database Operations

- **Save Analysis**: Store analysis results in Firestore
- **Retrieve History**: Fetch user's analysis history
- **Update Analysis**: Modify existing analysis data
- **Delete Analysis**: Remove analysis from history

#### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /analyses/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## PDF Processing Services

### PDF Text Extraction (`src/services/pdfService.ts`)

#### Primary Extraction Method

```typescript
async function extractTextFromPdf(file: File): Promise<string> {
  // Uses PDF.js for text extraction
  // Handles various PDF formats
  // Returns extracted text string
}
```

#### OCR Fallback

```typescript
async function extractTextWithOCR(file: File): Promise<string> {
  // Uses Tesseract.js for scanned PDFs
  // Fallback when PDF.js fails
  // Supports multiple languages
}
```

#### PDF Viewer Integration (`src/components/PdfViewer.tsx`)

- **Canvas Rendering**: PDF.js canvas-based rendering
- **Navigation Controls**: Page navigation and zoom
- **Responsive Design**: Height-aware rendering
- **Error Handling**: Graceful fallback for unsupported PDFs

### PDF Generation (`src/pdfDownlode/generatePdfFromAnalysis.ts`)

#### Analysis to PDF Conversion

```typescript
export async function generatePdfFromAnalysis(
  analysis: DocumentAnalysis,
  visuals: VisualizationBundle,
  options: PdfGenerationOptions
): Promise<Blob>;
```

#### Features

- **Multi-page Layout**: Structured PDF layout
- **Chart Integration**: Embedded visualizations
- **Styling**: Professional PDF styling
- **Metadata**: Document metadata inclusion

---

## Chat System Integration

### Chat Architecture

#### Components

- **ChatFloating**: Floating chat button and interface
- **ChatPanel**: Full chat panel implementation
- **Chat History**: Persistent chat history
- **Context Integration**: Document-aware responses

#### Message Flow

1. **User Input**: Message sent to chat system
2. **Context Preparation**: Document context included
3. **API Call**: Message sent to Gemini API
4. **Response Processing**: AI response formatted
5. **UI Update**: Chat interface updated
6. **History Storage**: Message stored in history

### Chat Features

- **Context Awareness**: Responses based on analyzed document
- **Language Support**: English and Hindi chat support
- **Real-time Updates**: Streaming response support
- **Error Handling**: Graceful error management

---

## Error Handling & Retry Logic

### API Error Handling

#### Retry Strategy

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  // Exponential backoff retry logic
  // Handles rate limiting and temporary failures
  // Returns result or throws final error
}
```

#### Error Types

- **Network Errors**: Connection timeouts and failures
- **API Errors**: Rate limiting and quota exceeded
- **Parsing Errors**: JSON parsing failures
- **Validation Errors**: Input validation failures

### User-Facing Error Handling

- **Toast Notifications**: User-friendly error messages
- **Fallback UI**: Graceful degradation
- **Error Boundaries**: React error boundaries
- **Logging**: Comprehensive error logging

---

## API Rate Limiting

### Rate Limit Management

- **Request Queuing**: Queue requests to respect limits
- **Exponential Backoff**: Automatic retry with increasing delays
- **User Feedback**: Rate limit status in UI
- **Graceful Degradation**: Fallback when limits exceeded

### Implementation

```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Queue management
    // Rate limit enforcement
    // Request execution
  }
}
```

---

## Service Configuration

### Environment Variables

```bash
# Required API Keys
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Service Initialization

```typescript
// Gemini API initialization
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const MODEL_NAME = "gemini-2.0-flash";

// Firebase initialization
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

### Configuration Validation

- **Startup Checks**: Validate all required environment variables
- **Runtime Validation**: Check API key validity
- **Error Reporting**: Clear error messages for missing configuration
- **Fallback Behavior**: Graceful handling of missing services

---

## Performance Optimization

### API Performance

- **Request Batching**: Batch multiple requests when possible
- **Response Caching**: Cache frequently accessed data
- **Connection Pooling**: Reuse HTTP connections
- **Compression**: Gzip compression for API responses

### Client-Side Optimization

- **Lazy Loading**: Load services on demand
- **Memoization**: Cache expensive computations
- **Debouncing**: Debounce user input
- **Virtual Scrolling**: Handle large datasets efficiently

---

## Monitoring & Analytics

### API Monitoring

- **Response Times**: Track API response times
- **Error Rates**: Monitor error rates and types
- **Usage Metrics**: Track API usage patterns
- **Performance Metrics**: Monitor performance indicators

### User Analytics

- **Feature Usage**: Track feature usage patterns
- **Error Tracking**: Monitor user-facing errors
- **Performance Metrics**: Track user experience metrics
- **Conversion Tracking**: Monitor user engagement

---

## Security Considerations

### API Security

- **Key Management**: Secure API key storage
- **Request Validation**: Validate all API requests
- **Rate Limiting**: Prevent abuse and overuse
- **Error Sanitization**: Sanitize error messages

### Data Security

- **Encryption**: Encrypt sensitive data in transit
- **Access Control**: Implement proper access controls
- **Audit Logging**: Log all data access
- **Compliance**: Ensure regulatory compliance

---

_This documentation covers the API services and integration patterns used in the LegalEase AI application. For implementation details, refer to the source code in the `src/services/` directory._
