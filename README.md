# 🩺 Shoulder Care Agent

An elderly-friendly, mobile-first conversational AI interface for shoulder physical therapy guidance, recovery exercise routines, and symptom Q&A.

Built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, **Groq AI (Llama 3.3 70B)**, and the **Web Speech API**.

---

## 🌐 Live Deployment

- **Production URL**: [https://shoulder-care-agent.vercel.app](https://shoulder-care-agent.vercel.app)
- **GitHub Repository**: [https://github.com/saranaeswar/shoulder-care-agent](https://github.com/saranaeswar/shoulder-care-agent)

---

## ⚠️ Medical Disclaimer

> **IMPORTANT**: This application provides general wellness information and physical therapy guidance for **educational and self-care purposes only**. It is **not intended to provide medical diagnosis, clinical prognosis, or substitute for professional medical advice, examination, or treatment**. 
> 
> Always seek the advice of a physician, physical therapist, or qualified orthopedic specialist with any questions you may have regarding a medical condition. If you experience severe trauma, numbness down the arm, sudden chest pain radiating to the shoulder, or inability to move your arm, contact emergency services (**108 / 911**) immediately.

---

## ✨ Key Features

- **Elderly-Friendly UI**: High-contrast colors, minimum 18px body typography, large 56px touch targets, and a 1-click text size toggle (`Bigger A+`).
- **Voice Input (Web Speech API)**: Microphone button next to the input supporting language toggle between **Indian English (`en-IN`)** and **Tamil (`ta-IN`)**. Transcribed text populates the input field for user review before sending.
- **🔊 Text-to-Speech (Listen)**: Built-in speech synthesis allowing elderly users to listen to advice read aloud.
- **Tappable Quick Questions**: Common questions in conversational Tanglish & English (e.g., *"Enna exercise pannalam?"*, *"Doctor kitta poganuma?"*).
- **Groq Cloud LLM Integration**: Powered by the `llama-3.3-70b-versatile` model with graceful fallbacks.
- **Single-Session Anonymous Use**: No login, sign-up, or tracking required.

---

## 📁 Project Structure

```
shoulder-care-agent/
├── src/
│   ├── components/
│   │   ├── ChatWindow.tsx    # Main elderly-friendly chat UI with voice input
│   │   ├── Header.tsx        # Top status header
│   │   ├── MessageList.tsx   # Chat bubble message list
│   │   └── InputBar.tsx      # Bottom chat input bar
│   ├── lib/
│   │   ├── groqClient.ts     # Groq API completions client (Llama 3.3 70B)
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── utils.ts          # Utility functions
│   ├── data/
│   │   ├── systemPrompt.ts   # Multilingual clinical PT system prompt
│   │   └── mockChat.ts       # Initial starter messages and quick prompts
│   ├── App.tsx               # Root application view
│   ├── main.tsx              # Application entry point
│   └── index.css             # Tailwind CSS styling
├── public/                   # Static assets & icons
├── vercel.json               # SPA routing configuration for Vercel
├── .env.example              # Environment variable template
├── vite.config.ts            # Vite & Tailwind configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- npm or yarn
- A free Groq API key from [console.groq.com](https://console.groq.com/keys)

### 1. Installation

```bash
git clone https://github.com/saranaeswar/shoulder-care-agent.git
cd shoulder-care-agent
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and add your Groq API key:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

### 3. Start Development Server

```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## ☁️ Deploying to Vercel

### Step 1: Push Code to GitHub

Ensure your repository is up to date:

```bash
git add .
git commit -m "feat: ready for vercel deployment"
git push origin main
```

### Step 2: Import Project in Vercel Dashboard

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** > **"Project"**.
3. Under **Import Git Repository**, select `saranaeswar/shoulder-care-agent`.
4. Vercel automatically detects the Vite framework settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add `VITE_GROQ_API_KEY` Environment Variable

Before clicking Deploy:

1. In the **Environment Variables** accordion section of the configuration screen:
   - **Key**: `VITE_GROQ_API_KEY`
   - **Value**: `gsk_...` (paste your Groq API key)
2. Ensure the environments **Production**, **Preview**, and **Development** are checked.
3. Click **"Add"**.

*(If already deployed, navigate to **Project Settings** > **Environment Variables** in Vercel, add `VITE_GROQ_API_KEY`, and trigger a **Redeploy**).*

### Step 4: Click Deploy

Click **"Deploy"**. Vercel will build the application and provide your live URL:

👉 **[https://shoulder-care-agent.vercel.app](https://shoulder-care-agent.vercel.app)**


