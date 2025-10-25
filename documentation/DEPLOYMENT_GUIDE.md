# Deployment & Environment Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Firebase Setup](#firebase-setup)
5. [Google Gemini API Setup](#google-gemini-api-setup)
6. [Production Deployment](#production-deployment)
7. [Docker Deployment](#docker-deployment)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Monitoring & Logging](#monitoring--logging)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Required Accounts & Services

- **Google Cloud Platform**: For Gemini API access
- **Firebase Account**: For authentication and database
- **GitHub Account**: For code repository (optional)

### Development Tools (Recommended)

- **VS Code**: With TypeScript and React extensions
- **Firebase CLI**: For Firebase deployment
- **Docker**: For containerized deployment (optional)

---

## Local Development Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd legalDoc

# Verify you're in the correct directory
ls -la
# Should show: package.json, src/, public/, etc.
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
# Create .env file
touch .env

# Add environment variables (see Environment Configuration section)
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173 (or next available port)
```

### 5. Verify Setup

- Open browser to `http://localhost:5173`
- Check browser console for any errors
- Verify all environment variables are loaded
- Test basic functionality (upload, analysis)

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Google Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Development-specific settings
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
```

### Environment Variable Validation

The application includes built-in validation for environment variables:

```typescript
// Check if required variables are set
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is required");
}

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.error("VITE_FIREBASE_API_KEY is required");
}
```

### Environment-Specific Configurations

#### Development Environment

```bash
# .env.development
VITE_APP_ENV=development
VITE_DEBUG_MODE=true
VITE_API_BASE_URL=http://localhost:3000
VITE_LOG_LEVEL=debug
```

#### Production Environment

```bash
# .env.production
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_API_BASE_URL=https://api.legalease.com
VITE_LOG_LEVEL=error
```

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `legal-ease-ai`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Configure OAuth consent screen
6. Add authorized domains

### 3. Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select location (closest to your users)
5. Create database

### 4. Configure Security Rules

Update Firestore rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own analyses
    match /analyses/{document} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }

    // Allow users to read/write their own chat history
    match /chatHistory/{document} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 5. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" → Web app
4. Register app with nickname
5. Copy configuration object
6. Add to `.env` file

### 6. Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select features:
# - Firestore: Configure security rules and indexes
# - Hosting: Configure files for Firebase Hosting
```

---

## Google Gemini API Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable billing (required for API access)

### 2. Enable Gemini API

1. Go to "APIs & Services" → "Library"
2. Search for "Generative Language API"
3. Click "Enable"
4. Wait for activation

### 3. Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. Add to `.env` file as `VITE_GEMINI_API_KEY`

### 4. Configure API Restrictions (Recommended)

1. Click on the created API key
2. Under "API restrictions", select "Restrict key"
3. Select "Generative Language API"
4. Save changes

### 5. Set Usage Quotas (Optional)

1. Go to "APIs & Services" → "Quotas"
2. Find "Generative Language API"
3. Set daily quotas as needed
4. Monitor usage in "APIs & Services" → "Dashboard"

---

## Production Deployment

### 1. Build for Production

```bash
# Create production build
npm run build

# Verify build output
ls -la dist/
# Should contain: index.html, assets/, etc.
```

### 2. Firebase Hosting Deployment

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Verify deployment
firebase hosting:channel:list
```

### 3. Environment Variables for Production

Update Firebase Hosting environment variables:

```bash
# Set environment variables in Firebase
firebase functions:config:set app.gemini_api_key="your_production_key"
firebase functions:config:set app.firebase_config="your_config"
```

### 4. Custom Domain Setup (Optional)

1. In Firebase Console, go to "Hosting"
2. Click "Add custom domain"
3. Follow domain verification steps
4. Update DNS records as instructed
5. Wait for SSL certificate provisioning

---

## Docker Deployment

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Create nginx.conf

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

### 3. Create docker-compose.yml

```yaml
# docker-compose.yml
version: "3.8"

services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_GEMINI_API_KEY=${GEMINI_API_KEY}
      - VITE_FIREBASE_API_KEY=${FIREBASE_API_KEY}
    depends_on:
      - backend

  backend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./backend:/app
    command: npm start
    ports:
      - "3000:3000"
```

### 4. Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# Verify deployment
docker-compose ps
docker-compose logs frontend
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - run: npm ci
      - run: npm run lint
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - run: npm ci
      - run: npm run build

      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}"
          channelId: live
          projectId: your-firebase-project-id
```

### Environment Secrets

Add secrets to GitHub repository:

- `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON
- `GEMINI_API_KEY`: Production Gemini API key
- `FIREBASE_API_KEY`: Production Firebase API key

---

## Monitoring & Logging

### Application Monitoring

```typescript
// Add to main.tsx
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const analytics = getAnalytics(app);

// Track page views
analytics.logEvent("page_view", {
  page_title: document.title,
  page_location: window.location.href,
});
```

### Error Tracking

```typescript
// Error boundary component
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error("Error caught by boundary:", error, errorInfo);

    // Send to error tracking service
    if (typeof window !== "undefined") {
      // Send to your error tracking service
    }
  }
}
```

### Performance Monitoring

```typescript
// Performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === "navigation") {
      console.log("Page load time:", entry.loadEventEnd - entry.loadEventStart);
    }
  }
});

observer.observe({ entryTypes: ["navigation"] });
```

---

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

**Problem**: Environment variables not accessible in application
**Solutions**:

- Ensure `.env` file is in project root
- Restart development server after adding variables
- Check variable names start with `VITE_`
- Verify no spaces around `=` in `.env` file

#### 2. Firebase Connection Issues

**Problem**: Firebase initialization fails
**Solutions**:

- Verify all Firebase environment variables
- Check Firebase project is active
- Ensure Firebase services are enabled
- Verify network connectivity

#### 3. Gemini API Errors

**Problem**: API calls to Gemini fail
**Solutions**:

- Verify API key is correct and active
- Check API quotas and limits
- Ensure billing is enabled on Google Cloud
- Verify API is enabled in Google Cloud Console

#### 4. Build Failures

**Problem**: Production build fails
**Solutions**:

- Check TypeScript errors: `npm run lint`
- Verify all imports are correct
- Check for missing dependencies
- Clear node_modules and reinstall

#### 5. Deployment Issues

**Problem**: Firebase deployment fails
**Solutions**:

- Verify Firebase CLI is installed and logged in
- Check Firebase project configuration
- Ensure build output exists
- Verify Firebase hosting is enabled

### Debug Commands

```bash
# Check environment variables
npm run dev -- --debug

# Verify Firebase configuration
firebase projects:list

# Test API connectivity
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
     https://generativelanguage.googleapis.com/v1beta/models

# Check build output
npm run build && ls -la dist/
```

### Log Analysis

```bash
# View Firebase logs
firebase functions:log

# View deployment logs
firebase hosting:channel:list

# Check application logs
docker-compose logs frontend
```

---

## Security Considerations

### Production Security Checklist

- [ ] API keys stored securely (not in code)
- [ ] Firebase security rules configured
- [ ] HTTPS enabled for all endpoints
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] Error messages don't expose sensitive data
- [ ] Regular security updates applied

### Environment Security

```bash
# Never commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use environment-specific files
cp .env.example .env
# Edit .env with your actual values
```

---

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/

# Optimize images
npm install -g imagemin-cli
imagemin src/assets/* --out-dir=dist/assets
```

### Runtime Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement service worker for caching
- Optimize API calls and reduce requests

---

_This deployment guide provides comprehensive instructions for setting up and deploying the LegalEase AI application. Follow the steps in order and refer to troubleshooting section if issues arise._
