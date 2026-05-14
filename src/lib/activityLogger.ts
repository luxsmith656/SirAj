import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function logActivity(userId: string, userEmail: string, action: string, description: string) {
  try {
    await addDoc(collection(db, 'activityLogs'), {
      userId,
      userEmail,
      action,
      description,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging activity: ', error);
  }
}
