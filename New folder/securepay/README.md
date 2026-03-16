# SecurePay

SecurePay is a production-ready, mobile-first web payment application focused on security and fraud prevention. Built with React 19, Vite, Tailwind CSS v4, and Zustand.

## Features Implemented
- **PIN Logic**: 6-digit biometric mockup with 5-min temporary lockout on 3 wrong attempts.
- **Dynamic Trust Score**: Real-time evaluation of user trust percentage decreasing with fraud flags.
- **Payment Methods**: QR Code scanner (`html5-qrcode`), Contact transfer, Mobile number, and Bank Transfer interfaces.
- **Fraud Engine**: Halts transactions > ₹10,000 for 8 seconds, checks frequency, amount spikes, and unusual timings (2-5 AM).
- **History & Analytics**: Uses Recharts to display transaction trends.
- **Emergency Protocols**: Direct dial links to cyber-crime units (1930) and protocol steps.
- **AI Financial Advisor**: Connects to Google's Gemini API for strict financial advisory chat.
- **PWA Ready**: Vite PWA plugin configured for installable web app experience.

## Getting Started

1. **Install Dependencies**
   If you haven't already:
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser. (Switch your browser's dev tools to Mobile View for the best experience).

---

## SDK & Configuration Guide

### 1. Firebase (Free Tier)
We have prepared a stub at `src/config/firebase.ts`. To fully enable multi-user persistence:
1. Go to Firebase Console and create a free project.
2. Register a web app and paste your `firebaseConfig` keys into `src/config/firebase.ts`.
3. Enable **Firestore Database** and **Authentication** (Email/Password).
4. *Firestore Rules Setup*:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /transactions/{tx} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### 2. Google Gemini API (Free)
The AI Advisor needs a Gemini API key.
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and generate a new free key.
2. Open the "AI Advisor" tab inside the SecurePay app.
3. The UI will prompt you to input the key. It securely saves it to `localStorage` and never sends it to our servers.

### 3. Razorpay (Simulation)
If you wish to convert the dummy transactions into real Sandbox payments:
1. Sign up on [Razorpay](https://razorpay.com/) and switch to "Test Mode".
2. Go to Settings -> API Keys -> Create Key.
3. Install the SDK: `npm install react-razorpay`.
4. Replace the success routing in `TransactionProcess.tsx` to mount the Razorpay checkout modal using your `key_id`.

## Tech Stack
- Vite + React + TypeScript
- Tailwind CSS
- Zustand
- React Hook Form + Zod
- Recharts
- html5-qrcode
- Google Generative AI
