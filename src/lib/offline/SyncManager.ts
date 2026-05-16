import { initDB } from './db';
import { collection, getDocs, setDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db as firestore } from '../firebase';

export class SyncManager {
  static async pullCategories() {
    const db = await initDB();
    // Only published categories
    const q = query(collection(firestore, 'categories'), where('isPublished', '==', true));
    const snap = await getDocs(q);
    const tx = db.transaction('localCategories', 'readwrite');
    snap.forEach(doc => {
      tx.store.put({ id: doc.id, ...doc.data() });
    });
    await tx.done;
  }

  static async pullTopics() {
    const db = await initDB();
    const q = query(collection(firestore, 'topics'), where('isPublished', '==', true));
    const snap = await getDocs(q);
    const tx = db.transaction('localTopics', 'readwrite');
    snap.forEach(doc => {
      tx.store.put({ id: doc.id, ...doc.data() });
    });
    await tx.done;
  }

  static async pullSkills() {
    const db = await initDB();
    const snap = await getDocs(collection(firestore, 'skills'));
    const tx = db.transaction('localSkills', 'readwrite');
    snap.forEach(doc => {
      tx.store.put({ id: doc.id, ...doc.data() });
    });
    await tx.done;
  }

  static async pullQuestions(selectedFocus?: string) {
    const db = await initDB();
    let q = query(
      collection(firestore, 'questions'), 
      where('isPublished', '==', true),
      where('approved', '==', true)
    );
    
    if (selectedFocus && selectedFocus !== 'all') {
      q = query(q, where('categoryId', '==', selectedFocus));
    }
    
    const snap = await getDocs(q);
    const tx = db.transaction('localQuestions', 'readwrite');
    snap.forEach(doc => {
      tx.store.put({ id: doc.id, ...doc.data() });
    });
    await tx.done;
  }

  static async pullModules(selectedFocus?: string) {
    const db = await initDB();
    let q = query(collection(firestore, 'modules'), where('isPublished', '==', true));
    
    if (selectedFocus && selectedFocus !== 'all') {
      q = query(q, where('categoryId', '==', selectedFocus));
    }

    const snap = await getDocs(q);
    const tx = db.transaction('localModules', 'readwrite');
    snap.forEach(doc => {
      tx.store.put({ id: doc.id, ...doc.data() });
    });
    await tx.done;
  }

  static async pullAllContent(selectedFocus?: string) {
    await Promise.all([
      this.pullCategories(),
      this.pullTopics(),
      this.pullSkills(),
      this.pullQuestions(selectedFocus),
      this.pullModules(selectedFocus)
    ]);
    
    // Also push unsynced attempts
    await this.pushAttempts();

    const db = await initDB();
    await db.put('contentVersion', { id: 'lastSync', timestamp: Date.now(), focus: selectedFocus || 'all' });
  }

  static async pushAttempts() {
    try {
      const db = await initDB();
      const tx = db.transaction('localQuizAttempts', 'readonly');
      const index = tx.store.index('by-synced');
      const unsynced = await index.getAll(0);
      
      const firestore = (await import('../firebase')).db;
      const { collection, setDoc, doc } = await import('firebase/firestore');

      for (const attempt of unsynced) {
        const docRef = doc(collection(firestore, 'quizAttempts'), attempt.localAttemptId);
        await setDoc(docRef, {
           ...attempt,
           synced: 1, // Store as synced in cloud? Or we don't need synced flag anymore on cloud
           syncedAt: Date.now()
        });
        
        // Mark as synced locally
        const writeTx = db.transaction('localQuizAttempts', 'readwrite');
        const toUpdate = await writeTx.store.get(attempt.localAttemptId);
        if (toUpdate) {
           toUpdate.synced = 1;
           await writeTx.store.put(toUpdate);
        }
        await writeTx.done;
      }
    } catch (e) {
      console.warn('Push sync failed', e);
    }
  }

  static async getLastSyncTime(): Promise<number | null> {
    const db = await initDB();
    const data = await db.get('contentVersion', 'lastSync');
    return data ? data.timestamp : null;
  }
}
