# Google AI Tools Questions

## Where do you use Google's AI tools in the product?

**1. Document Analysis (Primary Function)**
- **Location**: `src/services/gemini.ts` → `analyzeDocumentWithGemini()`
- **Model Used**: Gemini 2.0 Flash
- **Purpose**: Analyzes legal documents clause-by-clause
- **Process**: 
  - Splits documents into 4000-character chunks with 400-character overlaps
  - Sends each chunk to Gemini API with structured JSON prompts
  - Merges and de-duplicates results across chunks
- **Output**: DocumentAnalysis object with clauses, risks, action points, citations, role perspectives

**2. Visualization Generation**
- **Location**: `src/services/gemini.ts` → `generateVisualizationsWithGemini()`
- **Model Used**: Gemini 2.0 Flash
- **Purpose**: Creates flowchart, timeline, and responsibility matrix data
- **Output**: VisualizationBundle with process flows, timelines, and responsibility matrices

**3. Interactive Chat**
- **Location**: `src/services/gemini.ts` → `chatWithGemini()`
- **Model Used**: Gemini 2.0 Flash
- **Purpose**: Answers user questions about the analyzed document
- **Features**: 
  - Maintains conversation history
  - Handles hypothetical scenarios with structured analysis
  - Provides document-grounded responses only

**4. Clause Enforceability Analysis**
- **Location**: `src/services/gemini.ts` → `analyzeClauseEnforceabilityWithGemini()`
- **Model Used**: Gemini 2.0 Flash
- **Purpose**: Assesses legal enforceability of specific clauses by jurisdiction
- **Output**: Enforceability status with jurisdiction-specific notes and references

**5. Configuration Details**
- **API Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **API Key**: Retrieved from environment variable `VITE_GEMINI_API_KEY`
- **Temperature Settings**: 0.2-0.3 for consistent, structured outputs
- **Response Format**: Enforced JSON responses via `responseMimeType: 'application/json'`
- **Token Limits**: 2048-4096 tokens depending on use case

## How do these tools add clear value to the user?

**Document Analysis Value:**
- **Eliminates Manual Reading**: Users don't need to read through dense legal jargon themselves
- **Granular Understanding**: Breaks down complex documents into digestible clauses with explanations
- **Multi-Perspective Insight**: Shows how the same clause affects different parties (Tenant/Landlord, Employee/Employer, etc.)
- **Risk Identification**: Automatically identifies and categorizes risks by severity (low/medium/high) with recommendations
- **Actionable Intelligence**: Provides concrete action points telling users exactly what to do next
- **Time Savings**: Processes entire documents in seconds vs. hours of manual review
- **Accuracy**: Structured prompts ensure consistent, reliable analysis across all documents

**Visualization Generation Value:**
- **Visual Comprehension**: Transforms abstract legal concepts into easy-to-understand flowcharts and timelines
- **Process Clarity**: Shows step-by-step processes for termination, renewal, disputes, and other workflows
- **Relationship Mapping**: Responsibility matrices clearly show who does what in side-by-side comparisons
- **Better Memory**: Visual representations are easier to remember than dense text
- **Quick Reference**: Users can quickly glance at diagrams to understand complex relationships

**Interactive Chat Value:**
- **On-Demand Clarification**: Users can ask specific questions without re-reading entire documents
- **Scenario Analysis**: Handles "what-if" questions with structured scenario breakdowns
- **Contextual Responses**: Maintains conversation context for follow-up questions
- **Document-Grounded**: Only provides answers based on the actual document, preventing hallucination
- **24/7 Availability**: Instant responses without waiting for human legal consultation

**Clause Enforceability Analysis Value:**
- **Jurisdiction Awareness**: Tells users if clauses are enforceable in their specific legal jurisdiction
- **Risk Assessment**: Identifies potentially unenforceable clauses that users should question
- **Legal Confidence**: Helps users understand which parts of contracts are legally binding
- **Negotiation Guidance**: Suggests alternatives for problematic clauses

**Overall Value Proposition:**
- **Cost Reduction**: Eliminates need for expensive legal consultations for initial document reviews
- **Accessibility**: Makes legal understanding available to non-legal professionals
- **Confidence**: Users feel empowered to make informed decisions
- **Comprehensiveness**: Nothing gets missed due to systematic clause-by-clause analysis
- **Speed**: Analysis completes in seconds rather than days
- **Reliability**: Consistent structured outputs ensure predictable, trustworthy results

