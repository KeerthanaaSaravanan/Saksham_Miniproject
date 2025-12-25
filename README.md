### SAKSHAM – Accessible AI-Assisted Examination Platform
Empowering independent digital examinations for learners with Visual Impairment and Specific Learning Disabilities

SAKSHAM is a Next.js and TypeScript-based accessible online examination platform designed to enable independent, secure, and dignity-first exams for:

Blind users

Low-vision users

Students with Dyslexia

Students with Dysgraphia

The platform removes dependency on scribes or helpers by integrating:

AI Voice Navigation Assistant

Screen-reader friendly UI

Customizable Accessibility Settings

Error-free exam interaction flows

Secure Firebase-backed exam storage and submissions

SAKSHAM focuses only on examinations (learning modules intentionally excluded).

### 🌟 Key Features
Accessibility-First Design

Large scalable typography

Dyslexia-friendly fonts

High-contrast themes

Keyboard-only navigation

Focus rings and skip navigation

Fully screen-reader compatible UI

AI Assistant for Blind Users

Voice-guided navigation

Speech-to-Text for answering

Text-to-Speech reading of:

questions

options

timers

warnings

Voice commands for:

Start exam

Next/Previous question

Mark for review

Submit exam

User Roles

Admin

create/manage exams

schedule exams

manage question banks

assign papers to learners

monitor submissions

Learner

login with email/password

attempt assigned exams

use accessibility controls

submit securely

### 🔐 Authentication & Security

Built using Firebase Authentication:

Email + Password login

Auto-login persistence

Role-based Firestore rules

Session-based exam access control

Prevention of multi-device simultaneous submissions

### 🛠️ Tech Stack
Frontend

Next.js (App Router)

TypeScript

React Accessibility Hooks

Tailwind CSS

Headless UI

Radix Primitives

Backend

Firebase Authentication

Firestore Database

Firebase Storage

Firestore Security Rules

Cloud Functions (optional future)

AI Components

Speech-to-Text

Text-to-Speech

Voice command intent detection

Real-time voice feedback

### 🧩 Supported Disabilities
Visual Impairment

complete voice navigation

blind-friendly exam mode

minimal visual clutter

no drag–drop questions

no color-based questions

Low Vision

zoom scaling up to 400%

contrast & color inversion

adjustable UI density

enlarge radio buttons & checkboxes

Dyslexia

OpenDyslexic font option

increased word spacing

syllable-assisted text spacing

text-to-speech questions

distraction-reduced UI

Dysgraphia

speech-to-text answers

option-based questions preferred

large answer text boxes

auto-saved typed answers

### 🧭 System Workflow (High Level)

User opens app

Logs in through Firebase Authentication

Learner role auto-detected

Accessibility preferences requested/set

For blind users → AI assistant activated from launch

Learner sees assigned exams

Exam integrity checks performed

Exam started

Answers saved in real-time to Firestore

Submission validated & locked

Admin views evaluation dashboard

### 🗂️ Project Folder Structure
Frontend – Next.js + TypeScript
saksham-frontend/
 ├─ app/
 │   ├─ layout.tsx
 │   ├─ page.tsx
 │   ├─ exams/
 │   ├─ auth/
 │   ├─ accessibility/
 │   ├─ settings/
 │   └─ results/
 ├─ components/
 │   ├─ navbar/
 │   ├─ buttons/
 │   ├─ forms/
 │   ├─ accessibility/
 │   └─ voice-assistant/
 ├─ context/
 ├─ hooks/
 ├─ lib/
 ├─ types/
 ├─ styles/
 ├─ public/
 └─ utils/

Backend – Firebase
saksham-backend/
 ├─ firestore.rules
 ├─ storage.rules
 ├─ firestore.indexes.json
 ├─ cloud-functions/
 └─ scripts/

### 🗃️ Firestore Schema Overview
Collections
users/
exams/
questions/
submissions/
accessibilityPreferences/
examAssignments/

Example Exam Schema
examId
title
duration
allowedRoles
questionOrder
schedule

### 🧑‍🦯 Accessibility Settings (Persisted per user)

font size

font family (dyslexia mode)

color scheme

speech rate

speech pitch

keyboard mode vs mouse mode

blind-mode (voice only)

text spacing

focus highlight thickness

read-question-aloud toggle

All stored in:

accessibilityPreferences/{userId}

### 🧪 Testing Strategy

keyboard navigation testing

NVDA/JAWS screen reader testing

WCAG 2.2 AA compliance checks

exam timer edge case validation

network disconnect recovery

answer autosave testing

multi-tab restriction tests

visually hidden text support

### 📊 Results & Impact

enables independent exam attempt

removes need for scribes

reduces exam anxiety

supports fair evaluation

improves accessibility compliance

scalable for universities & boards

### 🚀 Future Enhancements

Offline exam writing mode

AI proctoring for exam fairness

Multilingual TTS/STT

Braille display integration

Advanced analytics dashboard

Question difficulty adaptive engine

Automated evaluation for long answers

### 📄 License

This project is designed for educational and social impact.
License selection may be:

MIT

Apache 2.0

Custom Non-Commercial License

### 🤝 Contribution Guidelines

Contributions welcome for:

accessibility improvements

performance optimization

additional disability modules

Submit:

feature proposals

accessibility audits

pull requests
