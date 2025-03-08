import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { analytics, auth, googleProvider } from '../lib/firebase';
import { useNavigate } from 'react-router';
import { logEvent } from 'firebase/analytics';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, path?: string) => Promise<void>;
  signUp: (email: string, password: string, path?: string) => Promise<void>;
  signInWithGoogle: (path?: string) => Promise<void>;
  signOut: (path?: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: boolean;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  reauthenticate: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export class EmailNotVerifiedError extends Error {
  constructor() {
    super('Email not verified. Please verify your email before logging in.');
    this.name = 'EmailNotVerifiedError';
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setIsEmailVerified(user?.emailVerified ?? false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string, path: string = '/') => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      throw new EmailNotVerifiedError();
    }
    analytics.then(analyticsInstance => {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'sign_in', {
          method: 'email',
        });
      }
    });
    navigate(path);
  };

  const signUp = async (email: string, password: string, path: string = '/') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user);
    }
    analytics.then(analyticsInstance => {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'sign_up', {
          method: 'email',
        });
      }
    });
    navigate(path);
  };

  const signInWithGoogle = async (path: string = '/') => {
    await signInWithPopup(auth, googleProvider);
    analytics.then(analyticsInstance => {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'sign_in', {
          method: 'google',
        });
      }
    });
    navigate(path);
  };

  const localSignOut = async (path: string = '/') => {
    await signOut(auth);
    analytics.then(analyticsInstance => {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'sign_out');
      }
    });
    navigate(path);
  };

  const sendVerificationEmail = async () => {
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
    }
  };

  const reauthenticate = async (password: string) => {
    if (!user || !user.email) {
      throw new Error('User not logged in');
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('User not logged in');
    }

    // Reauthenticate user first
    await reauthenticate(currentPassword);

    // Then update password
    await updatePassword(user, newPassword);

    analytics.then(analyticsInstance => {
      if (analyticsInstance) {
        logEvent(analyticsInstance, 'password_update');
      }
    });
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      analytics.then(analyticsInstance => {
        if (analyticsInstance) {
          logEvent(analyticsInstance, 'password_reset_email_sent');
        }
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut: localSignOut,
    sendVerificationEmail,
    isEmailVerified,
    updatePassword: updateUserPassword,
    reauthenticate,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
