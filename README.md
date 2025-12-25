
# SAKSHAM 
> **"Accessible AI-Assisted Examination Platform"**
---
### 🔗 Website: [Saksham](https://studio--securexchange-b63do.us-central1.hosted.app)<br/>
### 🎥 Demo Video: [Watch on YouTube](https://youtu.be/nhXzRiLlDXI)
---
## 
---
Saksham is an **accessibility-first online examination platform** built for  **differently-abled learners** — specifically:

-  Students with **Specific Learning Disabilities (Dyslexia & Dysgraphia)**
-  Students with **Visual Impairment (Low-Vision & Blind)**

The platform ensures **independent, dignified, and barrier-free exam participation** through:

-  Role-based access for **Admin & Learner**
-  AI Voice Assistant for **Blind user navigation**
-  Text-to-Speech & Speech-to-Text support
-  Accessible UI with scalable fonts, contrast modes & keyboard navigation
-  Secure exam flow with persistence, proctor-safe interactions & audit trails
-  Built using **Next.js, TypeScript, Firebase Auth, Firestore & Storage**

---

##  **Project Objective**

Saksham enables learners with disabilities to:

- Take exams **independently without assistance**
- Access navigation and exam interaction through **voice commands**
- Use **personalized accessibility preferences**
- Maintain **security, fairness, and exam integrity**

The platform is focused **only on examination workflows** (no learning modules).

---

##  **User Roles**

### 🧑‍🎓 Learner
Supports two accessibility categories:

- **SLD (Dyslexia / Dysgraphia)**
  - Dyslexia-friendly fonts
  - Adjustable line spacing
  - Reduced cognitive load UI

- **Visual Impairment (Low-Vision / Blind)**
  - High-contrast mode
  - Screen reader compatible
  - AI Voice Assistant navigation
  - Speech-based interaction

### 🧑‍💼 Admin
- Create & manage exams
- Assign exams to learners
- View submissions & reports

---

##  **Core Features**

- 🔐 **Firebase Authentication (Email + Password)**
- 🌩️ **Firestore-based Exam Schema & Access Control**
- 🗂️ **Firebase Storage for Question Assets**
- 🗣️ **AI Voice Assistant for Blind Users**
- ♿ **Accessibility Settings Persistence**
- 🧭 **Guided Exam Navigation**
- 📝 **Timed & Structured Exam Interface**
- 📤 **Secure Answer Submission**
- 🧾 **Submission Lock & Integrity Rules**

---

##  **Tech Stack**

**Frontend**
- Next.js (App Router) + TypeScript  
- Tailwind CSS  
- Accessibility & ARIA Standards  

**Backend / Cloud**
- Firebase Authentication  
- Firestore Database  
- Firebase Storage  

**Accessibility & Assistive Design**
- ARIA Roles  
- WCAG-compliant UI  
- TTS / STT voice interaction support

---

## 📂 **Project Structure**

```bash
saksham/
│
├── src/
│   ├── app/                     # Next.js App Router Pages
│   │   ├── (admin)/             # Admin dashboard and admin-only pages
│   │   │   ├── analytics/
│   │   │   ├── dashboard/
│   │   │   ├── examinations/
│   │   │   ├── grading/
│   │   │   └── settings/
│   │   │
│   │   ├── (learner)/           # Learner dashboard and exam pages
│   │   │   ├── assessment/
│   │   │   ├── dashboard/
│   │   │   ├── flow/
│   │   │   ├── help/
│   │   │   ├── practice/
│   │   │   ├── profiling/
│   │   │   └── results/
│   │   │
│   │   ├── layout.tsx            # Global layout for all pages
│   │   └── page.tsx              # Landing / Home page
│   │
│   ├── components/               # Reusable UI components
│   │   ├── accessibility/
│   │   ├── buttons/
│   │   ├── cards/
│   │   └── forms/
│   │
│   ├── hooks/                    # Custom React hooks (accessibility, exams, auth)
│   ├── firebase/                 # Firebase config, auth, Firestore, storage
│   ├── lib/                      # Utility functions & API calls
│   ├── types/                    # TypeScript interfaces/types
│   └── styles/                   # Tailwind config overrides / global styles
│
├── .env                          # Environment variables
├── .env.local
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── package.json
├── tailwind.config.ts
├── postcss.config.mjs
├── firestore.rules                # Firestore security rules
├── README.md                      # Project documentation
└── apphosting.yaml                # Deployment config (Vercel / Firebase Hosting)

```

## Architecture Diagram:
<img width="2816" height="1536" alt="ARCI" src="https://github.com/user-attachments/assets/a2c57de3-9d6b-4711-ba43-b5c920a4984e" />


## Flow Diagram:
<img width="2816" height="1536" alt="Gemini_Generated_Image_ws4amrws4amrws4a" src="https://github.com/user-attachments/assets/0e345ec0-db28-49ee-a2ca-c476b39557fa" />


##  **Security & Integrity Rules**
- Only assigned learners can access an exam 
- Submissions are locked after completion 
- Role-based read/write access
- Accessibility preferences persist per session
  

##  **Testing & Validation**
- Keyboard-only navigation testing
- Screen reader compatibility checks
- Color contrast & legibility testing
- Exam integrity & submission validation


##  **Future Enhancements**
- Real-time AI exam proctoring indicators
- Offline exam-attempt capability
- Support for additional disabilities
- Multilingual accessibility voice interface

## License

This project follows a dignity-first accessibility mission philosophy.
Use ethically and responsibly in inclusive education environments.

##  Acknowledgements

Saksham is inspired by global accessibility standards and inclusive technology initiatives:
- WCAG 2.2 Guidelines
- Microsoft Inclusive Design Toolkit
- UNESCO Inclusive Education Frameworks

## References
-World Wide Web Consortium (W3C) — Web Content Accessibility Guidelines (WCAG 2.2)
https://www.w3.org/TR/WCAG22/
-W3C — ARIA Authoring Practices Guide (Accessible Rich Internet Applications)
https://www.w3.org/TR/wai-aria-practices/
-United Nations — Convention on the Rights of Persons with Disabilities (CRPD)
https://www.un.org/development/desa/disabilities/convention-on-the-rights-of-persons-with-disabilities.html
-Government of India — Guidelines for Indian Government Websites (GIGW) Accessibility Standards
https://guidelines.india.gov.in/
-World Health Organization — World Report on Disability
https://www.who.int/publications/i/item/9789241564182
-Microsoft Inclusive Design Toolkit
https://inclusive.microsoft.design/


