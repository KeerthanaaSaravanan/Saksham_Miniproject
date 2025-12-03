
# Saksham: AI-Powered Accessible Learning Platform

Welcome to the Saksham development team! This document provides everything you need to get your local environment set up, understand the project architecture, and contribute effectively.

## 1. Project Overview

Saksham is a Next.js web application designed to provide an inclusive, accessible, and autonomous examination experience for students with diverse abilities. It leverages AI through Google's Gemini models (via Genkit) for features like practice exam generation, voice command navigation, and automated grading assistance. The backend is powered by Firebase, utilizing Authentication, Firestore, Cloud Functions, and Cloud Storage.

**Core Technologies:**
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Cloud Functions), Node.js
- **AI/ML:** Genkit, Google Gemini Models
- **Desktop App:** Electron

---

## 2. Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [Firebase CLI](https://firebase.google.com/docs/cli#install-cli-mac-linux): `npm install -g firebase-tools`

### Step 1: Install Dependencies
Clone the repository and install the necessary npm packages.
```bash
npm install
```

### Step 2: Set Up Environment Variables
The application uses Genkit to interact with Google's AI models, which requires an API key.

1.  Create a new file named `.env` in the root of the project.
2.  Add the following line to the `.env` file:
    ```
    GENAI_API_KEY=your_google_ai_studio_api_key
    ```
3.  **To get your API key:**
    - Visit [Google AI Studio](https://aistudio.google.com/).
    - Click `Get API key` and create a new API key in a new or existing Google Cloud project.
    - Copy the generated key and paste it as the value for `GENAI_API_KEY`.

### Step 3: Run the Development Environment
Running the full application locally requires two separate terminal sessions.

**Terminal 1: Start the Firebase Emulator**
This single command starts the local emulators for Authentication, Firestore, and Cloud Functions, allowing you to develop and test a complete backend flow without affecting production data.

```bash
firebase emulators:start --import=./firebase-seed --export-on-exit
```

**Terminal 2: Start the Next.js Frontend**
This command starts the Next.js development server.

```bash
npm run dev
```

Your application will now be running at `http://localhost:3000`. The Firebase Emulator UI will be available at `http://localhost:4000`.

---

## 3. Testing & Quality Assurance

### Running Unit & Integration Tests
The project uses Jest for testing the backend Cloud Functions.

```bash
npm test -- "functions/test/index.spec.ts"
```

### Running End-to-End (E2E) Tests
E2E tests use Playwright to simulate real user scenarios in a browser. *(Setup for Playwright is assumed for this guide).*

```bash
npx playwright test
```

### Running Accessibility Checks
We use `axe-core` integrated into our E2E tests to audit accessibility. To run a full accessibility scan:

```bash
npm run test:e2e:accessibility
```
*Note: This is a conceptual command. Actual implementation would involve tagging Playwright tests for accessibility.*

---

## 4. Deployment & Monitoring

### Production Deployment
The application is deployed to Firebase.

1.  **Deploy Web App:**
    ```bash
    firebase deploy --only hosting
    ```
2.  **Deploy Backend Functions & Rules:**
    ```bash
    firebase deploy --only functions,firestore
    ```

### Monitoring
- **Logs:** All structured application and function logs are forwarded to **Google Cloud Logging**.
- **Performance:** Key metrics like API latency and error rates can be monitored via the **Google Cloud Monitoring** dashboard.
- **Alerting:** Set up alerting rules in Google Cloud Monitoring for critical events, such as a spike in function errors (>5% in 1h) or high AI-flow processing latency.
