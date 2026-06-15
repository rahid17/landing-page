import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}
