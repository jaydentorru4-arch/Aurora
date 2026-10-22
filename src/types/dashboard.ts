export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  error?: boolean;
  sources?: { title: string; uri: string }[];
  image?: {
    url: string;
    prompt: string;
    aspectRatio?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type ResponseStyle = 'balanced' | 'concise' | 'detailed' | 'creative';
export type PersonalityIntensity = 'calm' | 'playful' | 'expressive';

export interface PersonalitySettings {
  responseStyle: ResponseStyle;
  intensity: PersonalityIntensity;
  userName: string;
  reducedMotion: boolean;
  compactSpacing: boolean;
}

export const DEFAULT_SETTINGS: PersonalitySettings = {
  responseStyle: 'balanced',
  intensity: 'playful',
  userName: 'Kouhai',
  reducedMotion: false,
  compactSpacing: false,
};
