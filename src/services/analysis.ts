import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, type FieldValue } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { AnalysisHistoryItem } from '../types/history.ts';

// Type used for creating a new analysis history item with server-assigned timestamp
type AnalysisHistoryCreate = Omit<AnalysisHistoryItem, 'id' | 'timestamp'> & {
  userId?: string;
  timestamp: FieldValue;
};

export const saveAnalysisToHistory = async (analysisItem: Omit<AnalysisHistoryItem, 'id'>): Promise<string> => {
  try {
    console.log('🔄 Attempting to save analysis to Firestore...');

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated. Cannot save analysis to history.');
    }

    console.log('✅ User authenticated:', user.uid);

    // First, let's try a very simple test write without serverTimestamp
    console.log('🧪 Testing simple write to Firestore...');
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Hello Firestore!',
      userId: user.uid,
      createdAt: new Date().toISOString()
    });
    console.log('✅ Test write successful! ID:', testDoc.id);

    const analysisToSave: AnalysisHistoryCreate = {
      ...analysisItem,
      userId: user.uid,
      // Use server-assigned timestamp to avoid client clock drift
      timestamp: serverTimestamp(),
    };

    console.log('📝 Saving to collection "analysisHistory":', {
      title: analysisToSave.title,
      userId: analysisToSave.userId,
      hasAnalysis: !!analysisToSave.analysis,
      hasVisuals: !!analysisToSave.visuals
    });

    const docRef = await addDoc(collection(db, 'analysisHistory'), analysisToSave);
    console.log('✅ Successfully saved to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Error saving analysis to history:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });

    // Check if it's a permission error
    if (error?.code === 'permission-denied') {
      console.error('🚫 Permission denied - check your Firestore rules');
    } else if (error?.code === 'unauthenticated') {
      console.error('🔐 User not authenticated');
    } else if (error?.code === 'invalid-argument') {
      console.error('📝 Invalid data format');
    }

    // For now, return a local ID if Firestore fails
    console.warn('Firestore save failed, using local ID');
    return `local-${Date.now()}`;
  }
};

export const getAnalysisHistoryForUser = async (): Promise<AnalysisHistoryItem[]> => {
  try {
    console.log('🔄 Attempting to fetch analysis history from Firestore...');

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ No user authenticated');
      return [];
    }

    console.log('✅ User authenticated for fetch:', user.uid);

    // Temporarily remove orderBy to avoid index requirement
    const q = query(
      collection(db, 'analysisHistory'),
      where('userId', '==', user.uid)
    );

    console.log('📖 Executing query...');
    const querySnapshot = await getDocs(q);
    console.log('✅ Query successful, found', querySnapshot.size, 'documents');

    const history: AnalysisHistoryItem[] = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() } as AnalysisHistoryItem);
    });

    console.log('📋 Returning history with', history.length, 'items');
    return history;
  } catch (error: any) {
    console.error('❌ Error fetching analysis history:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    // Return empty array instead of throwing to prevent app crashes
    console.warn('Firestore fetch failed, returning empty array');
    return [];
  }
};

export const deleteAnalysisFromHistory = async (id: string): Promise<void> => {
  try {
    console.log('🗑️ Attempting to delete analysis:', id);

    const auth = getAuth();
    const user = auth.currentUser;

    // If it's a local ID (starts with "local-"), we don't need to delete from Firestore
    if (id.startsWith('local-')) {
      console.log('✅ Local analysis deletion handled by client state');
      return;
    }

    if (!user) {
      throw new Error('User not authenticated. Cannot delete from history.');
    }

    const { deleteDoc, doc } = await import('firebase/firestore');
    const docRef = doc(db, 'analysisHistory', id);

    await deleteDoc(docRef);
    console.log('✅ Successfully deleted analysis from Firestore:', id);
  } catch (error: any) {
    console.error('❌ Error deleting analysis:', error);
    throw error;
  }
};
