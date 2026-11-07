import {
  clearSession,
  getSessionOwner,
  registerOwner,
  saveSession,
  verifyOwner,
  type Owner,
} from '@/database/database';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  /** The signed-in owner, or null when nobody is signed in. */
  owner: Owner | null;
  /** True while the saved session is being read at startup. */
  isLoading: boolean;
  /** Resolves to false when the email or password is wrong. */
  signIn: (email: string, password: string) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getSessionOwner(db)
      .then((savedOwner) => {
        if (!cancelled) {
          setOwner(savedOwner);
        }
      })
      .catch(() => {
        // An unreadable session just means the owner has to sign in again.
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [db]);

  const signIn = async (email: string, password: string) => {
    const matchedOwner = await verifyOwner(db, email, password);
    if (!matchedOwner) {
      return false;
    }
    await saveSession(db, matchedOwner.id);
    setOwner(matchedOwner);
    return true;
  };

  const register = async (input: RegisterInput) => {
    const newOwner = await registerOwner(db, input);
    await saveSession(db, newOwner.id);
    setOwner(newOwner);
  };

  const signOut = async () => {
    await clearSession(db);
    setOwner(null);
  };

  return (
    <AuthContext.Provider value={{ owner, isLoading, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }
  return context;
}
