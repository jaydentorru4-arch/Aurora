export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: number;
}

export interface UserAccount extends UserProfile {
  passwordHash?: string;
}

export const ADMIN_EMAIL = 'jaydentorru4@gmail.com';

export const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'usr_admin_jayden',
  email: ADMIN_EMAIL,
  name: 'Jayden',
  role: 'admin',
  createdAt: 1714000000000,
};

const ACCOUNTS_STORAGE_KEY = 'aurora_registered_accounts_db';

export function getRegisteredAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // Seed default admin and demo user
  const initial: UserAccount[] = [
    {
      ...DEFAULT_ADMIN_USER,
      passwordHash: 'admin123',
    },
    {
      id: 'usr_demo',
      email: 'demo@aurora.ai',
      name: 'Kouhai Demo',
      role: 'user',
      createdAt: 1714000000000,
      passwordHash: 'aurora123',
    },
  ];

  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(initial));
  } catch {}

  return initial;
}

export function saveRegisteredAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {}
}
