# LegalEase AI – Document Analyzer

<div align="center">

**A powerful AI-powered legal document analyzer that simplifies complex legal language**

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange.svg)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-green.svg)](https://ai.google.dev/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📖 Overview

LegalEase AI is a modern web application that transforms complex legal documents into clear, understandable insights. Using Google's Gemini AI, it analyzes legal contracts clause-by-clause, providing plain-language explanations, risk assessments, role-specific perspectives, and actionable recommendations.

### Why LegalEase AI?

- 📄 **Understand Any Legal Document** - Upload PDFs or paste text to get instant analysis
- 🌍 **Bilingual Support** - Full analysis in English or Hindi (हिंदी)
- 🎯 **Role-Based Insights** - See contracts from different perspectives (Tenant/Landlord, Employee/Employer, etc.)
- 🔍 **Risk Detection** - Identify potential risks with severity ratings and recommendations
- 💬 **AI Chat Assistant** - Ask questions about your document in real-time
- ⚖️ **Find Legal Help** - Integrated lawyer locator with map and filtering
- 📊 **Visual Insights** - Auto-generated flowcharts, timelines, and responsibility matrices

---

## ✨ Features

### 🔍 Document Analysis

#### Intelligent Chunking & Processing
- Splits large documents into manageable chunks (4000 characters with 400-character overlap)
- Analyzes each chunk independently and merges results with de-duplication
- Handles documents of any length reliably

#### Clause-by-Clause Breakdown
Each clause includes:
- **Title & Original Text**: Verbatim clause content
- **Simplified Explanation**: Plain language translation
- **Risk Level**: Visual indicators (🟢 Low, 🟡 Medium, 🔴 High)
- **Detailed Analysis**: Context and implications

#### Role-Specific Perspectives
For applicable contracts, see tailored analysis for each party:
- **Tenancy Agreements**: Tenant vs Landlord views
- **Employment Contracts**: Employee vs Employer views
- **Consumer Agreements**: Consumer vs Business views

Each perspective shows:
- Interpretation from that role's viewpoint
- Specific obligations
- Potential risks and concerns

#### Risk Radar
- Consolidated list of all identified risks
- Severity ratings and impact assessment
- Specific recommendations for mitigation
- Related clause references

#### Action Points
Concrete next steps:
- Items requiring clarification
- Documents to prepare
- Follow-up tasks
- Negotiation points

#### Legal Citations
When confidently inferable:
- Relevant statutes and laws
- Case law references
- Legal principles
- Links to authoritative sources

#### Authenticity Check
Document verification analysis:
- **Authenticity Score**: 0-100 rating
- **Compliance Status**: Legal standard conformance
- **Red Flags**: Concerning elements
- **Safety Assessment**: Overall safety score
- **Fake Indication**: Warning level (Low/Medium/High)
- **Recommendations**: Actions before signing

### 📊 Visualizations

#### Process Flow Diagrams
- Mermaid-based flowcharts showing processes
- Termination, renewal, and dispute resolution flows
- Decision points and conditional paths
- Related clause annotations

#### POV-Based Timelines
Three perspectives:
- **Court Perspective**: Legal process timeline
- **Receiver Perspective**: Party receiving notice timeline
- **Overall Timeline**: Combined chronological view

#### Responsibility Matrix
Side-by-side comparison table:
- Topic/obligation areas
- Party A responsibilities
- Party B responsibilities
- Related clause references

### 💬 AI Chat System

#### Two Chat Modes
1. **Floating Chat**: Accessible from any page, minimizable overlay
2. **Chat Panel**: Full dedicated chat page with larger interface

#### Smart Features
- **Context-Aware**: All responses based on your uploaded document
- **Quick Questions**: Pre-populated common queries
- **Markdown Support**: Formatted responses with bold, lists, code blocks
- **Bilingual**: Responds in English or Hindi based on your setting
- **Conversation History**: Maintains context across messages

### ⚖️ Lawyer Locator

Find legal professionals near you:

#### Search & Filter
- **Location Search**: Address or geolocation
- **Distance Radius**: 5km to 50km range
- **Specialization Filters**: Contract, Property, Employment, Family Law, etc.
- **Rating Filter**: Minimum star rating
- **Availability**: Online consultation option

#### Lawyer Profiles
- Name, photo, and bar registration
- Years of experience
- Specializations
- Average rating and reviews
- Contact information
- Office address and map
- Consultation fees
- Languages spoken

#### Display Options
- **List View**: Scrollable lawyer cards
- **Map View**: Interactive map with pins
- **Detail Modal**: Full profile with reviews and actions

### 📄 PDF Operations

#### Upload & Extraction
- **Drag & Drop**: Easy PDF upload
- **Text Extraction**: PDF.js for digital PDFs
- **OCR Fallback**: Tesseract.js for scanned documents
- **Multi-Page Support**: Handles documents of any length

#### PDF Generation
Export analysis results:
- Professional multi-page PDF layout
- All analysis sections included
- Visualizations embedded
- Metadata and timestamps

### 👤 User Management

#### Authentication
- **Email/Password**: Standard signup and login
- **Google OAuth**: One-click authentication
- **Profile Management**: Edit name, photo, preferences
- **Password Reset**: Email-based recovery

#### User Profiles
- Display name and photo
- Email and account creation date
- Preferences (language, theme)
- Analysis history

#### Real-Time Sync
- Preferences sync across devices
- Firestore real-time listeners
- Automatic updates without refresh

### 📚 Analysis History

#### Storage System
- **Local Storage**: Last 100 analyses (offline-capable)
- **Cloud Storage**: Unlimited for authenticated users (Firebase)
- **Cross-Device Sync**: Access from anywhere

#### History Features
- Save analyses manually or automatically
- View previous analyses with one click
- Delete analyses with confirmation
- Optimistic UI updates

### 🎨 Theme System

#### Light & Dark Modes
- **Light Theme**: Clean, professional appearance
- **Dark Theme**: Easy on eyes, battery-saving
- **Semantic Colors**: CSS custom properties (HSL)
- **Smooth Transitions**: Instant theme switching

#### Design System
- Tailwind CSS with custom configuration
- Responsive breakpoints (mobile-first)
- Consistent spacing and typography
- Accessible color contrasts (WCAG AA)

### 🌐 Language Support

#### Bilingual Interface
- **English**: Full interface and analysis
- **हिंदी (Hindi)**: Complete Hindi support

#### Features
- Language selection on first visit
- Switch languages anytime from header
- All AI responses in selected language
- Preference syncs across devices

### ⚙️ Settings & Customization

- **API Key Configuration**: For advanced users
- **Default Language**: Set preferred language
- **Default Simplification Level**: Choose Professional/Simple/ELI5
- **Theme Preference**: Light/Dark/System
- **Clear Cache**: Remove local data
- **Account Management**: Profile, password, delete account

### 🎯 Additional Features

- **Sample Contracts**: Try built-in examples (EN/HI)
  - Service Agreement
  - Mutual NDA
  - Residential Lease
- **Simplification Levels**:
  - **Professional**: Legal terminology preserved
  - **Simple**: Plain language
  - **ELI5**: Extremely simplified
- **Video Showcase**: Onboarding tutorials
- **Fullscreen Mode**: Expand any section
- **Responsive Design**: Works on desktop, tablet, mobile
- **Toast Notifications**: User-friendly feedback
- **Loading States**: Smooth loading animations

---

## 🛠 Tech Stack

### Frontend
- **React 19.0.0** - Modern UI library
- **TypeScript 5.5.3** - Type-safe development
- **Vite 6.4.0** - Fast build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 11.3.8** - Smooth animations

### AI & APIs
- **Google Gemini AI (2.5 Flash)** - Document analysis
- **@google/generative-ai 0.24.1** - Gemini API client
- **Firebase 12.4.0** - Authentication & Firestore database

### Document Processing
- **pdfjs-dist 5.4.149** - PDF rendering and text extraction
- **Tesseract.js 6.0.1** - OCR for scanned PDFs
- **jsPDF 3.0.3** - PDF generation
- **html2canvas 1.4.1** - HTML to canvas conversion

### Visualization & UI
- **Mermaid 11.11.0** - Diagram rendering (flowcharts, timelines)
- **react-chrono 2.4.2** - Timeline visualization
- **react-markdown 9.0.3** - Markdown rendering
- **Lucide React 0.400.0** - Icon library

### Development Tools
- **ESLint** - Code linting
- **PostCSS & Autoprefixer** - CSS processing
- **TypeScript ESLint** - TypeScript linting

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- Google Gemini API key ([Get one here](https://ai.google.dev/))
- Firebase project (optional, for authentication and history)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd legalDoc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:
   ```bash
   # Required - Gemini API Key
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Optional - Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

### Firebase Setup (Optional)

For authentication and cloud storage features:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google providers)
3. Enable Firestore Database
4. Add Firebase configuration to `.env` file
5. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 📚 Documentation

Comprehensive documentation is available in the `/documentation` folder:

- **[README.md](./documentation/README.md)** - Documentation index and navigation
- **[USER_GUIDE.md](./documentation/USER_GUIDE.md)** - Complete user manual
- **[ARCHITECTURE.md](./documentation/ARCHITECTURE.md)** - System architecture
- **[COMPONENTS.md](./documentation/COMPONENTS.md)** - Component reference (40+ components)
- **[FEATURES.md](./documentation/FEATURES.md)** - Feature documentation
- **[THEME_AND_STYLING.md](./documentation/THEME_AND_STYLING.md)** - Design system
- **[API_SERVICES_DOCUMENTATION.md](./documentation/API_SERVICES_DOCUMENTATION.md)** - API integration
- **[WORKFLOW_DOCUMENTATION.md](./documentation/WORKFLOW_DOCUMENTATION.md)** - User workflows
- **[DEPLOYMENT_GUIDE.md](./documentation/DEPLOYMENT_GUIDE.md)** - Deployment instructions

---

## 📸 Screenshots

### Document Upload
![Document Input](./documentation/screenshots/upload.png)

### Analysis Results
![Analysis Results](./documentation/screenshots/analysis.png)

### Visualizations
![Visualizations](./documentation/screenshots/visualizations.png)

### Chat Interface
![Chat Interface](./documentation/screenshots/chat.png)

### Lawyer Locator
![Lawyer Locator](./documentation/screenshots/lawyer-locator.png)

---

## 🏗 Project Structure

```
legalDoc/
├── src/
│   ├── components/          # UI components
│   │   ├── AppShell.tsx
│   │   ├── DocumentInput.tsx
│   │   ├── FullscreenModal.tsx
│   │   ├── MermaidDiagram.tsx
│   │   ├── PdfViewer.tsx
│   │   ├── Visualizations.tsx
│   │   └── ...
│   ├── analysis/            # Analysis components
│   │   ├── AnalysisResults.tsx
│   │   └── AnalysisHistorySidebar.tsx
│   ├── chatbot/            # Chat components
│   │   ├── ChatPanel.tsx
│   │   └── ChatFloating.tsx
│   ├── mapsComponents/     # Lawyer locator components
│   │   ├── LawyerCard.tsx
│   │   ├── LawyerList.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── ...
│   ├── services/           # Business logic
│   │   ├── gemini.ts       # AI analysis
│   │   ├── firebase.ts     # Authentication & database
│   │   ├── pdfService.ts   # PDF processing
│   │   ├── analysis.ts     # History management
│   │   └── userService.ts  # User profiles
│   ├── types/              # TypeScript types
│   │   ├── legal.ts
│   │   ├── history.ts
│   │   └── user.ts
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── documentation/          # Comprehensive docs
├── public/                # Static assets
├── firebase.json          # Firebase configuration
├── tailwind.config.js     # Tailwind customization
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies
```

---

## 🎯 Usage

### 1. Analyze a Document

1. Navigate to **Upload** page
2. Choose input method:
   - Paste text directly
   - Upload PDF (drag & drop or click)
   - Try a sample contract
3. Select language (English/Hindi)
4. Choose simplification level
5. Click **Analyze Document**

### 2. View Results

Navigate through tabs:
- **Plain Summary**: Document overview
- **Clause Lens**: Detailed clause-by-clause analysis
- **Risk Radar**: Identified risks and recommendations
- **Action Points**: Next steps
- **Legal Citations**: Relevant legal references
- **Authenticity**: Document verification

### 3. Use Visualizations

- View auto-generated flowcharts
- Explore POV-based timelines
- Review responsibility matrices
- Use fullscreen mode for detailed view

### 4. Chat with AI

- Click floating chat button or Chat page
- Ask questions about your document
- Get context-aware responses
- View conversation history

### 5. Find a Lawyer

- Go to Lawyer Locator page
- Enter location or use geolocation
- Filter by specialization and rating
- View profiles and contact lawyers

---

## 🔒 Security & Privacy

- **API Keys**: Stored in environment variables, never committed
- **Firebase Security Rules**: User data protected with authentication
- **No Data Collection**: Documents analyzed are not stored on servers
- **Local First**: Analyses saved locally by default
- **HTTPS Only**: Secure communication in production

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the existing code style and architecture
4. Update documentation for any new features
5. Test your changes thoroughly
6. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
7. Push to the branch (`git push origin feature/AmazingFeature`)
8. Open a Pull Request

See [ARCHITECTURE.md](./documentation/ARCHITECTURE.md) for design principles and [COMPONENTS.md](./documentation/COMPONENTS.md) for component patterns.

---

## 📝 License

This project is provided as-is for demonstration and educational purposes. Review and adapt before using in production.

**⚠️ Important Disclaimer**: AI-generated content is not legal advice. Always consult a qualified lawyer for legal decisions.

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI analysis
- **Firebase** for authentication and database
- **Tailwind CSS** for the design system
- **Mermaid** for diagram rendering
- **PDF.js** for PDF processing
- **Tesseract.js** for OCR capabilities

---

## 📧 Contact & Support

- **Documentation**: See [/documentation](./documentation) folder
- **Issues**: Report bugs via GitHub Issues
- **Questions**: Check [USER_GUIDE.md](./documentation/USER_GUIDE.md) troubleshooting section

---

<div align="center">

**Made with ❤️ by Sourabh Singh**

[⬆ Back to Top](#legalease-ai--document-analyzer)

</div>