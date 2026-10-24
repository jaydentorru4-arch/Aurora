import { UserProfile } from '../types/auth';
import {
  auth,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOutGoogle,
  onAuthStateChanged,
  User,
} from '../firebase';

const CACHED_USER_KEY = 'aurora_current_user';

export function mapFirebaseUserToProfile(user: User): UserProfile {
  return {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'Aurora Explorer',
    role: 'user',
    avatar: user.photoURL || undefined,
    createdAt: user.metadata.creationTime
      ? new Date(user.metadata.creationTime).getTime()
      : Date.now(),
  };
}

export function getCachedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function setCachedUser(user: UserProfile | null): void {
  try {
    if (user) {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CACHED_USER_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Initiates the Google Sign-In popup flow via Firebase Auth.
 * Automatically provisions or updates user doc in Firestore.
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const firebaseUser = await firebaseSignInWithGoogle();
  const profile = mapFirebaseUserToProfile(firebaseUser);
  setCachedUser(profile);
  return profile;
}

/**
 * Signs out the current Firebase user.
 */
export async function logoutUser(): Promise<void> {
  setCachedUser(null);
  await signOutGoogle();
}

/**
 * Listen to Firebase Auth state changes.
 */
export function onAuthProfileChanged(
  callback: (profile: UserProfile | null) => void
): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      const profile = mapFirebaseUserToProfile(user);
      setCachedUser(profile);
      callback(profile);
    } else {
      setCachedUser(null);
      callback(null);
    }
  });
}

// Backward compatibility helper
export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const profile = mapFirebaseUserToProfile(currentUser);
    setCachedUser(profile);
    return profile;
  }
  return getCachedUser();
}
