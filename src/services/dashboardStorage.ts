import { Conversation, PersonalitySettings, DEFAULT_SETTINGS } from '../types/dashboard';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, limit } from 'firebase/firestore';

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

  // Also sync to Firestore if authenticated with Google
  const currentUser = auth.currentUser;
  if (currentUser) {
    syncConversationsToFirestore(currentUser.uid, conversations).catch((err) => {
      console.warn('Background sync to Firestore failed:', err);
    });
  }
}

export async function syncConversationsToFirestore(userId: string, conversations: Conversation[]): Promise<void> {
  const path = `users/${userId}/conversations`;
  try {
    for (const conv of conversations.slice(0, 20)) {
      const convRef = doc(db, 'users', userId, 'conversations', conv.id);
      await setDoc(
        convRef,
        {
          id: conv.id,
          userId,
          title: conv.title,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteConversationFromFirestore(userId: string, conversationId: string): Promise<void> {
  const path = `users/${userId}/conversations/${conversationId}`;
  try {
    const convRef = doc(db, 'users', userId, 'conversations', conversationId);
    await deleteDoc(convRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
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
