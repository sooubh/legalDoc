import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import type { AnalysisHistoryItem } from '../types/history';

// We are defining a new type that omits the 'id' but includes an optional 'userId'
// This will be used when creating a new analysis history item.
type AnalysisHistoryCreate = Omit<AnalysisHistoryItem, 'id'> & { userId?: string };

export const saveAnalysisToHistory = async (analysisItem: Omit<AnalysisHistoryItem, 'id'>): Promise<string> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const analysisToSave: AnalysisHistoryCreate = {
    ...analysisItem,
    userId: user.uid,
    timestamp: Timestamp.now().toMillis(), // Use Firestore Timestamp for consistency
  };

  const docRef = await addDoc(collection(db, 'analysisHistory'), analysisToSave);
  return docRef.id;
};

export const getAnalysisHistoryForUser = async (): Promise<AnalysisHistoryItem[]> => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
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
};
