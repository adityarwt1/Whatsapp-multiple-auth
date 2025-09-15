import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Save user data to Firestore
  const saveUserToFirestore = async (user) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: new Date(),
          lastSeen: new Date(),
          isOnline: true,
        });
      } else {
        // Update last seen and online status
        await setDoc(
          userRef,
          {
            lastSeen: new Date(),
            isOnline: true,
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
    }
  };

  // Sign in with Google (Popup)
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google (Redirect - better for mobile)
  const signInWithGoogleRedirect = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Error with Google redirect:", error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      if (user) {
        // Update online status before signing out
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            isOnline: false,
            lastSeen: new Date(),
          },
          { merge: true }
        );
      }
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await saveUserToFirestore(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Handle redirect result
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await saveUserToFirestore(result.user);
        }
      })
      .catch((error) => {
        console.error("Error with redirect result:", error);
      });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithGoogleRedirect,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
