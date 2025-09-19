# LegalEase AI - Workflow Documentation

## Table of Contents

1. [Project Workflow Overview](#project-workflow-overview)
2. [User Journey Workflows](#user-journey-workflows)
3. [Technical Workflows](#technical-workflows)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Component Interaction Workflows](#component-interaction-workflows)
6. [Error Handling Workflows](#error-handling-workflows)
7. [Development Workflows](#development-workflows)

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

   - Paste text directly
   - Upload PDF/DOC/TXT file
   - Select from sample contracts

2. **Input Method Selection**:

   - **Text Paste**: Direct textarea input
   - **File Upload**: Drag-and-drop or click to browse
   - **Sample Selection**: Dropdown with 3 contract types (EN/HI)

3. **Content Processing**:

   - **Text**: Direct use
   - **PDF**: pdf.js extraction → OCR fallback if needed
   - **Sample**: Pre-loaded contract text

4. **Settings Configuration**:

   - Language selection (English/Hindi)
   - Simplification level (professional/simple/eli5)

5. **Validation & Submission**:
   - Content validation (non-empty)
   - Submit button triggers analysis

#### 1.2 Analysis Phase

```
Content Submission → API Call → Response Processing → State Updates
```

**Steps:**

1. **API Call**: `analyzeDocumentWithGemini()` with:

   - Document content
   - Language preference
   - Simplification level

2. **Response Processing**:

   - JSON parsing and validation
   - Type mapping to `DocumentAnalysis`
   - Error handling for malformed responses

3. **State Updates**:
   - Set analysis results
   - Clear previous chat messages
   - Set PDF preview URL (if applicable)

#### 1.3 Results Display Phase

```
Analysis Complete → UI Transition → Tabbed Results → Role-Specific Views
```

**Steps:**

1. **UI Transition**: Loading screen → Results layout
2. **Results Display**: `AnalysisResults` component with tabs:

   - Plain Summary
   - Clause Lens (with role perspectives)
   - Risk Radar
   - Action Points
   - Legal Citations

3. **Role-Specific Views**: Each clause shows:
   - Interpretation
   - Obligations
   - Risks

### 2. Visualization Generation Workflow

#### 2.1 Background Processing

```
Analysis Complete → Visualization API Call → Diagram Generation → UI Update
```

**Steps:**

1. **Trigger**: After main analysis completes
2. **API Call**: `generateVisualizationsWithGemini()` with:

   - Document content
   - Language
   - Party labels

3. **Response Processing**:

   - Timeline data extraction
   - Flow diagram generation
   - Responsibilities matrix creation

4. **UI Update**: `Visualizations` component renders:
   - Mermaid flowcharts
   - Timeline diagrams
   - Responsibilities table

#### 2.2 Diagram Rendering Workflow

```
Visualization Data → Mermaid Processing → SVG Generation → Container Display
```

**Steps:**

1. **Data Processing**: Convert API response to Mermaid syntax
2. **Mermaid Rendering**: Dynamic import and render
3. **SVG Injection**: Responsive SVG with proper scaling
4. **Container Management**: Scrollable containers, fullscreen modals

### 3. Chat Interaction Workflow

#### 3.1 Chat Initialization

```
Document Analysis → Chat Panel Available → User Question → Response Generation
```

**Steps:**

1. **Availability**: Chat becomes available after analysis
2. **Context Setup**: Document content as context
3. **User Input**: Question in chat interface
4. **API Call**: `chatWithGemini()` with document context
5. **Response Display**: Streaming or complete response

#### 3.2 Floating Chat Workflow

```
Chat Toggle → Modal Display → Question Input → Response → Close
```

## Technical Workflows

### 1. API Integration Workflow

#### 1.1 Gemini API Communication

```
Request Preparation → API Call → Response Handling → Error Management
```

**Request Flow:**

1. **Prompt Building**: Structured prompts for analysis/chat/visualization
2. **Configuration**: Temperature, max tokens, response format
3. **API Call**: HTTP request to Gemini API
4. **Response Processing**: JSON parsing, type validation
5. **Error Handling**: Retry logic, fallback responses

#### 1.2 Response Mapping Workflow

```
Raw Response → JSON Parsing → Type Validation → State Update
```

**Steps:**

1. **JSON Extraction**: Parse response text
2. **Type Validation**: Ensure required fields exist
3. **Default Handling**: Fill missing fields with defaults
4. **State Update**: Update React state with validated data

### 2. File Processing Workflow

#### 2.1 PDF Processing Pipeline

```
File Upload → PDF.js Extraction → Text Validation → OCR Fallback (if needed)
```

**Steps:**

1. **File Validation**: Check file type and size
2. **PDF.js Processing**: Extract text from PDF pages
3. **Text Validation**: Check if sufficient text extracted
4. **OCR Fallback**: Use Tesseract if text extraction fails
5. **Progress Tracking**: Show upload progress to user

#### 2.2 OCR Processing Workflow

```
PDF → Canvas Rendering → Tesseract Processing → Text Extraction
```

**Steps:**

1. **Page Rendering**: Convert PDF pages to canvas
2. **Language Detection**: Map UI language to Tesseract language
3. **OCR Processing**: Text recognition with progress tracking
4. **Text Assembly**: Combine recognized text from all pages

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
