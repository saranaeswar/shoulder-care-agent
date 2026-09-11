import type { Message } from '../lib/types';

export const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm your Shoulder Care Assistant 👋. I'm here to help guide you through recovery exercises, track pain symptoms, and provide physical therapy tips for your shoulders. How is your shoulder feeling today?",
    timestamp: '10:00 AM',
    suggestedActions: [
      'Rotator cuff soreness',
      'Gentle mobility stretches',
      'Post-workout stiffness',
      'Track pain level (1-10)'
    ]
  },
  {
    id: '2',
    role: 'user',
    content: 'My right shoulder feels stiff when reaching overhead.',
    timestamp: '10:02 AM'
  },
  {
    id: '3',
    role: 'assistant',
    content: "Thank you for sharing. Stiffness during overhead reach can often be related to subacromial impingement or tightness in the rotator cuff and thoracic spine. \n\n⚠️ Disclaimer: I provide educational wellness guidance, not medical diagnosis. If you experience sharp pain or numbness, please consult a healthcare professional.\n\nWould you like to try 3 gentle mobility movements to test your range of motion?",
    timestamp: '10:03 AM',
    suggestedActions: [
      'Show 3 gentle movements',
      'Log pain details',
      'When to see a doctor'
    ]
  }
];

export const QUICK_SUGGESTIONS: string[] = [
  '💪 Rotator Cuff Exercises',
  '🧊 Ice vs Heat Guide',
  '🧘 Posture Reset Routine',
  '📊 Log Daily Symptoms'
];
