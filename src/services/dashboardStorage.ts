import { Conversation, PersonalitySettings, DEFAULT_SETTINGS } from '../types/dashboard';

const STORAGE_KEYS = {
  CONVERSATIONS: 'aurora_ai_conversations_v1',
  ACTIVE_ID: 'aurora_ai_active_conv_id_v1',
  SETTINGS: 'aurora_ai_settings_v1',
};

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((c) => c && typeof c.id === 'string' && Array.isArray(c.messages));
    }
  } catch (e) {
    console.warn('Failed to load conversations from localStorage:', e);
  }
  return [];
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (e) {
    console.warn('Failed to save conversations to localStorage:', e);
  }
}

export function loadActiveConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
  } catch {
    return null;
  }
}

export function saveActiveConversationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    }
  } catch (e) {
    console.warn('Failed to save active conversation id:', e);
  }
}

export function loadSettings(): PersonalitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: PersonalitySettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}
