# LegalEase AI - Workflow Documentation

## Table of Contents

1. [Project Workflow Overview](#project-workflow-overview)
2. [User Journey Workflows](#user-journey-workflows)
3. [Technical Workflows](#technical-workflows)
4. [Security Workflows](#security-workflows)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Component Interaction Workflows](#component-interaction-workflows)
7. [Error Handling Workflows](#error-handling-workflows)
8. [Development Workflows](#development-workflows)

## Project Workflow Overview

LegalEase AI follows a structured workflow from document input to comprehensive legal analysis with visualizations and interactive chat capabilities.

### High-Level Process Flow

```
Document Input → Analysis → Results Display → Visualizations → Chat (Optional)
```

## User Journey Workflows

### 1. Document Analysis Workflow

#### 1.1 Document Input Phase

```
User Action → Input Method Selection → Content Processing → Validation
```

**Steps:**

1. **Landing Page**: User sees `DocumentInput` component with three options:

   - Paste text directly into a textarea.
   - Upload a file (PDF, DOC, TXT) via drag-and-drop or a file browser.
   - Select a sample contract from a dropdown menu (available in English and Hindi).

2. **Input Method Selection**:

   - **Text Paste**: The user's pasted text is directly used for analysis.
   - **File Upload**: The uploaded file is processed to extract its text content.
   - **Sample Selection**: A pre-loaded legal document is used for the analysis.

3. **Content Processing**:

   - **Text**: The text is used as-is.
   - **PDF**: The text is extracted using `pdf.js`. If this fails, Tesseract OCR is used as a fallback.
   - **Sample**: The pre-loaded contract text is used directly.

4. **Settings Configuration**:

   - The user can select the language (English/Hindi) and the desired level of simplification (professional, simple, or ELI5).

5. **Validation & Submission**:
   - The system checks that the document content is not empty.
   - The user clicks the "Submit" button to begin the analysis.

#### 1.2 Analysis Phase

```
Content Submission → API Call → Response Processing → State Updates
```

**Steps:**

1. **API Call**: The `analyzeDocumentWithGemini()` function is called, sending the document content, language, and simplification level to the Gemini API.

2. **Response Processing**:

   - The JSON response from the API is parsed and validated.
   - The data is mapped to the `DocumentAnalysis` type.
   - Any errors in the response are handled gracefully.

3. **State Updates**:

   - The analysis results are stored in the application's state.
   - Any previous chat messages are cleared.
   - If a PDF was uploaded, the preview URL is updated.

#### 1.3 Results Display Phase

```
Analysis Complete → UI Transition → Tabbed Results → Role-Specific Views
```

**Steps:**

1. **UI Transition**: The application transitions from a loading screen to the results layout.
2. **Results Display**: The `AnalysisResults` component displays the analysis in a series of tabs:

   - Plain Summary
   - Clause Lens (with role-specific perspectives)
   - Risk Radar
   - Action Points
   - Legal Citations

3. **Role-Specific Views**: Each clause includes detailed interpretations, obligations, and risks for each role.

### 2. Visualization Generation Workflow

#### 2.1 Background Processing

```
Analysis Complete → Visualization API Call → Diagram Generation → UI Update
```

**Steps:**

1. **Trigger**: This workflow is triggered after the main document analysis is complete.
2. **API Call**: The `generateVisualizationsWithGemini()` function is called, sending the document content, language, and party labels to the Gemini API.

3. **Response Processing**:

   - The API response is processed to extract data for timelines, flow diagrams, and responsibility matrices.

4. **UI Update**: The `Visualizations` component renders the generated diagrams and tables.

#### 2.2 Diagram Rendering Workflow

```
Visualization Data → Mermaid Processing → SVG Generation → Container Display
```

**Steps:**

1. **Data Processing**: The data from the API response is converted into Mermaid.js syntax.
2. **Mermaid Rendering**: The Mermaid.js library is dynamically imported and used to render the diagrams.
3. **SVG Injection**: The generated SVG is injected into the DOM and styled to be responsive.
4. **Container Management**: The diagrams are displayed in scrollable containers with options for fullscreen viewing.

### 3. Chat Interaction Workflow

#### 3.1 Chat Initialization

```
Document Analysis → Chat Panel Available → User Question → Response Generation
```

**Steps:**

1. **Availability**: The chat panel becomes available after the document analysis is complete.
2. **Context Setup**: The document content is used as context for the chat.
3. **User Input**: The user enters a question in the chat interface.
4. **API Call**: The `chatWithGemini()` function is called, sending the question and document context to the Gemini API.
5. **Response Display**: The API's response is displayed in the chat panel.

#### 3.2 Floating Chat Workflow

```
Chat Toggle → Modal Display → Question Input → Response → Close
```

This provides a more focused chat experience in a modal window.

## Technical Workflows

### 1. API Integration Workflow

#### 1.1 Gemini API Communication

```
Request Preparation → API Call → Response Handling → Error Management
```

**Request Flow:**

1. **Prompt Building**: Structured prompts are created for analysis, chat, and visualization tasks.
2. **Configuration**: The API request is configured with parameters like temperature, max tokens, and response format.
3. **API Call**: An HTTP request is sent to the Gemini API.
4. **Response Processing**: The JSON response is parsed and validated against the expected types.
5. **Error Handling**: The system includes logic for retrying failed requests and handling various error responses.

#### 1.2 Response Mapping Workflow

```
Raw Response → JSON Parsing → Type Validation → State Update
```

**Steps:**

1. **JSON Extraction**: The response text is parsed as JSON.
2. **Type Validation**: The system verifies that all required fields are present in the response.
3. **Default Handling**: Any missing fields are filled with default values.
4. **State Update**: The application's state is updated with the validated data.

### 2. File Processing Workflow

#### 2.1 PDF Processing Pipeline

```
File Upload → PDF.js Extraction → Text Validation → OCR Fallback (if needed)
```

**Steps:**

1. **File Validation**: The uploaded file is checked for correct type and size.
2. **PDF.js Processing**: The text is extracted from the PDF using `pdf.js`.
3. **Text Validation**: The system checks if a sufficient amount of text was extracted.
4. **OCR Fallback**: If `pdf.js` fails, Tesseract OCR is used as a fallback.
5. **Progress Tracking**: The user is shown the progress of the upload and processing.

#### 2.2 OCR Processing Workflow

```
PDF → Canvas Rendering → Tesseract Processing → Text Extraction
```

**Steps:**

1. **Page Rendering**: The PDF pages are rendered to a canvas element.
2. **Language Detection**: The UI language is mapped to the corresponding Tesseract language.
3. **OCR Processing**: Tesseract.js is used to recognize the text on the canvas.
4. **Text Assembly**: The recognized text from all pages is combined.

## Security Workflows

### 1. API Key Management

- The Gemini API key is stored in a `.env` file and is not exposed on the client-side. All API calls are proxied through a backend service to protect the key.

### 2. Input Sanitization

- All user inputs are sanitized to prevent cross-site scripting (XSS) and other injection attacks.

### 3. Data Privacy

- No user data is stored on the server. All analysis is done in-memory and is not persisted.

## Data Flow Diagrams

### 1. Main Analysis Data Flow

```
User Input → DocumentInput → App State → Gemini API → AnalysisResults
     ↓              ↓           ↓           ↓            ↓
File/Text → Processing → onSubmit → API Call → UI Rendering
```

### 2. Visualization Data Flow

```
Analysis Complete → Background API Call → VisualizationBundle → Mermaid Rendering
     ↓                    ↓                      ↓                ↓
State Update → generateVisualizations → Data Processing → SVG Display
```

### 3. Chat Data Flow

```
User Question → Chat Component → API Call → Response → UI Update
     ↓              ↓              ↓          ↓          ↓
Text Input → chatWithGemini → Streaming → Display → History Update
```

## Component Interaction Workflows

### 1. DocumentInput Component Workflow

```
Props: onSubmit, isAnalyzing, language
State: documentText, dragActive, uploadProgress, etc.
Actions: handleFileUpload, handleSubmit, loadSample
```

**Interaction Flow:**

1. **File Upload**: Drag/drop or click → `handleFileUpload`
2. **Text Input**: Textarea change → `setDocumentText`
3. **Sample Selection**: Dropdown change → `setSelectedSampleId`
4. **Submit**: Button click → `handleSubmit` → `onSubmit` prop

### 2. AnalysisResults Component Workflow

```
Props: analysis, language, simplificationLevel, onNewAnalysis
State: activeTab, expandedClauses
Actions: Tab switching, clause expansion
```

**Interaction Flow:**

1. **Tab Navigation**: Click tab → `setActiveTab`
2. **Clause Expansion**: Click clause → toggle expansion
3. **Role View**: Display role-specific perspectives
4. **New Analysis**: Button click → `onNewAnalysis` prop

### 3. Visualizations Component Workflow

```
Props: visuals, isLoading
State: isFlowFullscreen, isTimelineFullscreen, flowIndex
Actions: Fullscreen toggle, flow selection
```

**Interaction Flow:**

1. **Flow Selection**: Dropdown change → `setFlowIndex`
2. **Fullscreen Toggle**: Button click → modal display
3. **Diagram Rendering**: Mermaid processing → SVG display

## Error Handling Workflows

### 1. API Error Handling

```
API Call → Error Response → Error Classification → User Notification
```

**Error Types:**

1. **Network Errors**: Retry with exponential backoff
2. **Authentication Errors**: Clear API key, show setup message
3. **Rate Limiting**: Show rate limit message, suggest retry
4. **Parsing Errors**: Show generic error, suggest different input

### 2. File Processing Error Handling

```
File Upload → Processing Error → Error Classification → User Feedback
```

**Error Types:**

1. **File Type Errors**: Show supported formats
2. **Size Errors**: Show size limits
3. **Extraction Errors**: Show fallback options
4. **OCR Errors**: Show text input alternative

### 3. UI Error Handling

```
User Action → Component Error → Error Boundary → Fallback UI
```

**Error Types:**

1. **Component Crashes**: Error boundary catches, shows fallback
2. **State Errors**: Reset to safe state
3. **Rendering Errors**: Show error message, allow retry

## Development Workflows

### 1. Feature Development Workflow

```
Feature Request → Planning → Implementation → Testing → Deployment
```

**Steps:**

1. **Planning**: Define requirements, create tasks
2. **Implementation**: Code development, type safety
3. **Testing**: Manual testing, error scenarios
4. **Documentation**: Update docs, add examples
5. **Deployment**: Build, preview, deploy

### 2. Bug Fix Workflow

```
Bug Report → Reproduction → Root Cause → Fix → Testing → Deployment
```

**Steps:**

1. **Reproduction**: Reproduce bug consistently
2. **Root Cause**: Identify source of issue
3. **Fix**: Implement solution
4. **Testing**: Verify fix, test edge cases
5. **Documentation**: Update troubleshooting guide

### 3. Code Review Workflow

```
Code Commit → Review Request → Code Review → Feedback → Merge
```

**Review Criteria:**

1. **Type Safety**: Proper TypeScript usage
2. **Error Handling**: Comprehensive error management
3. **Performance**: Efficient rendering, API calls
4. **Accessibility**: Proper ARIA labels, keyboard navigation
5. **Documentation**: Clear comments, updated docs

## Workflow Optimization

### 1. Performance Optimizations

- **Lazy Loading**: Dynamic imports for heavy components
- **Memoization**: React.memo for expensive renders
- **Debouncing**: Input validation and API calls
- **Caching**: API response caching where appropriate

### 2. User Experience Optimizations

- **Loading States**: Clear progress indicators
- **Error Recovery**: Graceful error handling with retry options
- **Responsive Design**: Mobile-friendly layouts
- **Accessibility**: Screen reader support, keyboard navigation

### 3. Development Optimizations

- **Type Safety**: Comprehensive TypeScript coverage
- **Code Splitting**: Separate bundles for different features
- **Hot Reloading**: Fast development iteration
- **Error Boundaries**: Isolated error handling

## Monitoring and Analytics

### 1. Performance Monitoring

- **API Response Times**: Track Gemini API performance
- **File Processing Times**: Monitor PDF/OCR processing
- **UI Render Times**: Track component performance
- **Error Rates**: Monitor and alert on errors

### 2. User Analytics

- **Feature Usage**: Track which features are used most
- **Error Patterns**: Identify common user issues
- **Performance Metrics**: User experience metrics
- **Feedback Collection**: User satisfaction tracking

This workflow documentation provides a comprehensive guide to understanding how LegalEase AI processes documents, handles user interactions, and manages the complete analysis pipeline from input to visualization.
