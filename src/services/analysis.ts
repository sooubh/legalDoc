import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { AnalysisHistoryItem } from '../types/history';

// We are defining a new type that omits the 'id' but includes an optional 'userId'
// This will be used when creating a new analysis history item.
type AnalysisHistoryCreate = Omit<AnalysisHistoryItem, 'id'> & { userId?: string };

export const saveAnalysisToHistory = async (analysisItem: Omit<AnalysisHistoryItem, 'id'>): Promise<string> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated. Cannot save analysis to history.');
    }

    const analysisToSave: AnalysisHistoryCreate = {
      ...analysisItem,
      userId: user.uid,
      timestamp: Timestamp.now(), // Use Firestore Timestamp for consistency
    };

    const docRef = await addDoc(collection(db, 'analysisHistory'), analysisToSave);
    return docRef.id;
  } catch (error) {
    console.error('Error saving analysis to history:', error);
    throw new Error('Failed to save analysis history.');
  }
};

export const getAnalysisHistoryForUser = async (): Promise<AnalysisHistoryItem[]> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      // If no user is authenticated, return an empty array.
      // This is not an error, but a valid state.
      return [];
    }

    const q = query(
      collection(db, 'analysisHistory'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const history: AnalysisHistoryItem[] = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() } as AnalysisHistoryItem);
    });

    return history;
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    throw new Error('Failed to fetch analysis history.');
  }
};
