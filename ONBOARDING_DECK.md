
# Saksham Platform: Architecture & Team Onboarding

---

## Slide 1: Welcome to Saksham

**Title: Empowering Every Student**

- **Mission:** To provide a dignified, autonomous, and accessible examination experience for all students, regardless of ability.
- **Vision:** To leverage AI to create a truly personalized and inclusive educational landscape.
- **Core Principle:** Dignity through autonomy.

---

## Slide 2: High-Level Architecture

**Title: A Modern, Scalable Stack**

- **Client (Browser/Desktop):** Next.js & React Frontend
- **AI Orchestration:** Genkit (TypeScript)
- **AI Models:** Google Gemini Family
- **Backend Services:** Firebase (Authentication, Firestore, Cloud Functions, Storage)
- **Deployment:** Firebase Hosting & App Hosting

A diagram showing a user interacting with the Next.js app, which communicates with Firebase Functions. The Functions then use Genkit to talk to Google AI models and interact with Firestore/Storage.

---

## Slide 3: The Frontend (Student & Faculty Portals)

**Title: The User Experience Layer**

- **Framework:** Next.js with App Router & Server Components.
- **UI:** Built with shadcn/ui, Tailwind CSS, and custom React components.
- **State Management:** React Context and `zustand` for focused state needs.
- **Accessibility:** ARIA standards, keyboard navigation, and dynamic modules are first-class citizens.
- **Team Responsibility (Frontend):** Owning the user journey, component library, accessibility compliance, and client-side performance.

---

## Slide 4: The AI Core (Genkit Flows)

**Title: The Brains of the Operation**

- **What is a Flow?** A server-side TypeScript function that orchestrates one or more AI model calls.
- **Location:** All flows are located in `src/ai/flows/`.
- **Examples:**
  - `generatePracticeExam`: Creates custom tests.
  - `parseVoiceCommand`: Interprets user speech.
  - `autoGradeAnswer`: Provides grading assistance.
- **Team Responsibility (AI/ML):** Prompt engineering, defining input/output schemas (Zod), and optimizing flows for accuracy and latency.

---

## Slide 5: The Backend (Firebase Cloud Functions)

**Title: Secure & Scalable Serverless Logic**

- **Purpose:** To act as a secure bridge between the client and the AI flows.
- **Location:** All function definitions are in `functions/src/index.ts`.
- **Key Responsibilities:**
  - **Authentication:** Verifying user identity.
  - **Input Validation:** Using Zod schemas to ensure data integrity.
  - **Rate Limiting:** Preventing abuse.
  - **Auditing:** Logging all critical events to Firestore.
- **Team Responsibility (Backend):** Security, scalability, function performance, and database rule enforcement.

---

## Slide 6: Data & Storage Strategy

**Title: Where Everything Lives**

- **Firestore (`firestore.rules`):** Our primary database for structured data like user profiles, exam metadata, and submissions. Security is enforced via rules that you MUST understand.
- **Cloud Storage:** Used for storing larger files, such as uploaded exam documents (DOCX, PDF) and cached TTS audio files (MP3).
- **`backend.json`:** A critical blueprint file. It defines the *intended* data structures but does **not** enforce them. It's used to generate consistent code.
- **Team Responsibility (Backend):** Database schema design, security rules implementation, and data lifecycle management.

---

## Slide 7: The End-to-End Flow (Example: Practice Exam)

**Title: Putting It All Together**

1.  **Student (Client):** Fills out the "Create Practice Exam" form and clicks "Generate".
2.  **Next.js (Client):** Calls the `createPracticeExam` server action.
3.  **Server Action:** Invokes the `generatePracticeExamFunc` Cloud Function, passing the user's criteria.
4.  **Cloud Function (Backend):** Authenticates the user, validates the input, and calls the `generatePracticeExam` Genkit flow.
5.  **Genkit Flow (AI):** Executes a prompt against the Gemini model.
6.  **Gemini:** Generates a JSON object containing the questions and returns it.
7.  **Response Flow:** The response travels back through the Cloud Function and Server Action to the client.
8.  **Student (Client):** The UI updates, and the student begins their practice exam.

---

## Slide 8: Testing Philosophy

**Title: Confidence in Every Commit**

- **Unit Tests (Jest):** Focused on individual Cloud Functions and utility logic. Mocks are used for AI flows and external services. Run with `npm test`.
- **End-to-End Tests (Playwright):** Simulates full user journeys (e.g., a voice-only exam flow). Essential for catching regressions. Run with `npx playwright test`.
- **Accessibility Audits (Axe):** Integrated into our E2E tests to automatically catch critical accessibility violations. Builds will fail if a11y score drops.

---

## Slide 9: The Desktop Experience (Electron)

**Title: Beyond the Browser**

- **Purpose:** Provides a focused, native-feeling application wrapper and enables a global hotkey for quick access.
- **How it Works:** Electron simply loads the deployed web application URL (`sakshamapp-71eec.web.app`). It is **not** a separate codebase.
- **Main Process (`src/main.ts`):** Handles window creation and the global shortcut (`CommandOrControl+Shift+X`).
- **Packaging:** `npm run electron:make` builds installers for Windows, macOS, and Linux.

---

## Slide 10: Your First Steps

**Title: Let's Get Building!**

1.  **Setup:** Follow the `README.md` to get your local environment running.
2.  **Explore:**
    - Log in as both a student and a faculty member.
    - Navigate to the "Application Flow" page (`/flow`) in the app for a user-centric overview.
    - Review the files mentioned in this deck, especially `src/ai/flows/`, `functions/src/index.ts`, and `firestore.rules`.
3.  **Contribute:** Grab a task from the board, create a new branch, and start coding!

**Welcome aboard!**
