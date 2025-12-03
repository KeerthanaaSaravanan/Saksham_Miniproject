#  SAKSHAM – Autonomous Accessible Learning & Examination System

## Description
SAKSHAM is an AI-powered inclusive learning and examination platform designed specifically for students with disabilities. It integrates Speech-to-Text (STT), Text-to-Speech (TTS), simplified content modes, and real-time Firebase backend connectivity to ensure barrier-free education and dignified assessments for all learners.

---

## About
**SAKSHAM – Inclusive Learning & Assessment Platform** addresses the accessibility gaps in traditional online learning and examination systems. Students with visual impairments or Specific Learning Disabilities (SLD) often struggle with complex interfaces, text-heavy content, or inability to type answers.

This platform provides an accessibility-first experience through voice command navigation, simplified content delivery, dyslexia-friendly UI, and adaptive examination flows. With the integration of Google Cloud STT/TTS and Firebase backend, the system ensures seamless, real-time, personalized support.

---

## Features

### ♿ 1. Visual Disability (Blind / Low Vision)
- 🔊 **Text-to-Speech (TTS)** reads all questions, options, and instructions.
- 🎤 **Speech-to-Text (STT)** allows answering via voice.
- 🗣️ **Voice Command Navigation** (“Next”, “Repeat”, “Submit”).
- ⌨️ **Keyboard-only navigation** using Tab & Enter.
- 🔆 **High-contrast mode & large text mode** for low-vision users.

### 🧩 2. Specific Learning Disability (SLD – Dyslexia, Dysgraphia, Dyscalculia)
- 📘 **Simplified Question Mode** for easier readability.
- 🔊 **TTS assistance** for comprehension.
- ✍️ **Handwriting Pad Input** for stylus-based answers.
- 🅰️ **Dyslexia-friendly fonts & color themes**.
- 📖 **Step-by-step question display** to avoid cognitive overload.

### 3. AI-Enabled Exam Engine
- 📡 Real-time question delivery from Firestore.
- 💾 Auto-save answers (local + cloud sync).
- 🧭 Voice-driven navigation.
- 📊 Automatic scoring via Cloud Functions.
- 🔒 Secure, adaptive, and distraction-free exam mode.

### 4. Secure Authentication & Backend
- Firebase Authentication (Email/Phone/OAuth)
- Real-time Firestore database
- Firebase Storage (handwriting inputs, logs)
- Offline sync support
- Cloud Functions for scoring, analytics, and cleanup

### 5. Teacher/Admin Dashboard
- Track student attempts
- Accessibility usage analytics
- Exam creation & scheduling
- Real-time performance updates

---

## 🛠️ Requirements

### ⚙ Operating System
- Windows 10/11 (64-bit), macOS, or Ubuntu

### 💻 Development Environment
- Node.js 18+
- Firebase CLI
- Flutter / React / Next.js (frontend)
- Python 3.9+ (optional AI modules)

### 🧠 Cloud & AI Services
- Google Cloud Speech-to-Text API  
- Google Cloud Text-to-Speech API  
- Firebase Authentication  
- Firestore Database  
- Firebase Storage  
- Cloud Functions (Node.js)

### 📦 Additional Dependencies
- TailwindCSS / Material UI for accessible UI  
- Web Speech API  
- OpenCV + MediaPipe (optional future upgrades)  
- Git/GitHub for version control  
- VS Code as IDE  

---

## 🧩 System Architecture

```

User
│
├── Firebase Authentication
│
├── Accessibility Engine
│     ├── Visual Disability Module (TTS, STT, Voice Nav)
│     └── SLD Module (Simplified Text, TTS, Handwriting Pad)
│
├── Learning Module
│     ├── Content Reader
│     ├── Simplified Question Fetcher
│     └── Handwriting Input System
│
├── Exam Engine
│     ├── Real-Time Question Fetching
│     ├── Auto-Save Answers
│     ├── Voice Navigation
│     └── Submission & Scoring
│
├── Firebase Firestore (Realtime)
│     ├── users/
│     ├── exams/
│     ├── attempts/
│     └── accessibility/
│
└── Cloud Functions
├── Evaluation & Scoring
├── Analytics Logs
└── Data Cleanup Pipelines

```

*(Insert Architecture Diagram Screenshot Here)*  
`Screenshot-Architecture.png`

---

## 🖼️ Output

### **Output 1 – Accessibility Dashboard**


### **Output 2 – STT + TTS Enabled Exam Interface**


### **Output 3 – Simplified Question Mode (SLD)**


---

## 📈 Accuracy / Performance Metrics (Optional)
- 🎤 Voice Command Accuracy: **98.3%**  
- 🗣️ STT Interpretation Accuracy: **95.4%**  
- 🔊 TTS Output Latency: **<150ms**  

*(Adjust based on your actual evaluation)*

---

## 🎯 Results and Impact
SAKSHAM significantly improves inclusivity by enabling blind and SLD students to learn and take exams independently.  
The platform:

- Reduces dependency on human scribes  
- Simplifies cognitive load for SLD learners  
- Provides real-time voice-driven control  
- Improves exam accuracy through AI-guided workflow  
- Increases accessibility in digital education  

This project demonstrates how voice AI, adaptive UI, and real-time cloud infrastructure can create a more equitable and empowering educational experience.

---

## 📚 Articles Published / References

1. N. S. Gupta et al.,  
   *“Enhancing Heart Disease Prediction Accuracy Through Hybrid ML Methods,”*  
   EAI Endorsed Transactions on IoT, 2024.

2. A. A. Bin Zainuddin,  
   *“Enhancing IoT Security via ML, AI & Blockchain,”*  
   Data Science Insights, 2024.

3. Google Cloud AI – Speech-to-Text Documentation  
4. Firebase Documentation – Firestore, Auth, Functions  
5. W3C Web Accessibility Initiative (WAI) Guidelines  

---

## 📦 License
This project is licensed for academic and research purposes.  
Contact the author for commercial usage permissions.

---

## 👩‍💻 Author
**Keerthana Saravanan**  


Just tell me!
