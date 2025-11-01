import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  type FieldValue 
} from 'firebase/firestore';
import { getAuth, User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  lastLoginAt?: Timestamp | FieldValue;
  emailVerified: boolean;
  provider: string; // 'email', 'google', 'github'
  preferences?: {
    language: 'en' | 'hi';
    theme: 'light' | 'dark';
  };
  metadata?: {
    signupMethod: string;
    mfaEnabled: boolean;
  };
}

// Helper to convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return null;
};

// Create or update user profile in Firestore
export const createUserProfile = async (user: User, provider: string = 'email'): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const userProfile: Partial<UserProfile> = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      provider: provider,
      updatedAt: serverTimestamp(),
      preferences: {
        language: 'en',
        theme: 'light',
      },
      metadata: {
        signupMethod: provider,
        mfaEnabled: false,
      },
    };

    if (!userSnap.exists()) {
      // New user - create profile
      await setDoc(userRef, {
        ...userProfile,
        createdAt: serverTimestamp(),
      });
      console.log('✅ User profile created in Firestore:', user.uid);
    } else {
      // Existing user - update profile
      await updateDoc(userRef, {
        ...userProfile,
        lastLoginAt: serverTimestamp(),
      });
      console.log('✅ User profile updated in Firestore:', user.uid);
    }
  } catch (error: any) {
    console.error('❌ Error creating/updating user profile:', error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error: any) {
    console.error('❌ Error getting user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log('✅ User profile updated:', uid);
  } catch (error: any) {
    console.error('❌ Error updating user profile:', error);
    throw error;
  }
};

// Subscribe to realtime user profile updates
export const subscribeToUserProfile = (
  uid: string,
  callback: (profile: UserProfile | null) => void
): (() => void) => {
  const userRef = doc(db, 'users', uid);
  
  const unsubscribe = onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('❌ Error in user profile subscription:', error);
      callback(null);
    }
  );

  return unsubscribe;
};

// Update user preferences
export const updateUserPreferences = async (
  uid: string, 
  preferences: { language?: 'en' | 'hi'; theme?: 'light' | 'dark' }
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const currentData = userSnap.data() as UserProfile;
      await updateDoc(userRef, {
        preferences: {
          ...currentData.preferences,
          ...preferences,
        },
        updatedAt: serverTimestamp(),
      });
      console.log('✅ User preferences updated:', uid);
    }
  } catch (error: any) {
    console.error('❌ Error updating user preferences:', error);
    throw error;
  }
};

// Update last login timestamp
export const updateLastLogin = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('❌ Error updating last login:', error);
    // Don't throw - this is not critical
  }
};


