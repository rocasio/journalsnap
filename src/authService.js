// src/authService.js
import { auth, googleProvider, appleProvider } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signInWithApple = async () => {
  const result = await signInWithPopup(auth, appleProvider);
  return result.user;
};

export const logout = () => signOut(auth);