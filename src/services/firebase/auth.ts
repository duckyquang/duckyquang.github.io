import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  updateProfile
} from "firebase/auth";
import { auth } from "./config";

export const registerWithEmailAndPassword = async (
  email: string, 
  password: string, 
  displayName: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update the user profile with the displayName
  if (userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  
  return userCredential;
};

export const loginWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = async (): Promise<UserCredential> => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};
