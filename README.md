# 🩺 Shoulder Care Agent

A mobile-first conversational AI interface for shoulder physical therapy guidance, recovery exercise routines, and symptom tracking.

Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## ✨ Features

- **Mobile-First Responsive Layout**: Optimized for phones with safe-area spacing and auto-scrolling chat history.
- **Header with Status**: Includes active status badge, medical disclaimer badge, and emergency contact quick dial.
- **Interactive Message List**: Supports conversational exchanges with suggested action chips for quick follow-ups.
- **Smart Input Bar**: Fixed bottom bar featuring quick prompt chips, keyboard submission, and state-aware responsiveness.
- **Physical Therapy Guidance**: Pre-loaded with rotator cuff, mobility, posture, and pain-tracking recommendations.

## 📁 Project Structure

```
shoulder-care-agent/
├── src/
│   ├── components/       # UI components (Header, MessageList, InputBar)
│   ├── lib/              # Types, utilities, and helper functions
│   ├── data/             # Mock conversation data & quick prompts
│   ├── App.tsx           # Main chat layout container
│   ├── main.tsx          # Application entry point
│   └── index.css         # Tailwind CSS styling
├── public/               # Static assets
├── vite.config.ts        # Vite configuration with Tailwind CSS plugin
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- npm or yarn

### Installation

```bash
cd shoulder-care-agent
npm install
```

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

