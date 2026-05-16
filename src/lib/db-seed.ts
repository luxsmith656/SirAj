import { collection, addDoc, getDocs, query, where, doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { CATEGORIES as SEED_CATEGORIES, TOPICS as SEED_TOPICS, SKILLS as SEED_SKILLS, INITIAL_QUESTIONS as SEED_QUESTIONS } from './seedData';
import { handleFirestoreError, OperationType } from './firestoreUtils';

export async function seedDatabase() {
  console.log('Starting structured database seed...');
  
  try {
    // 1. Seed Categories
    for (const cat of SEED_CATEGORIES) {
      try {
        await setDoc(doc(db, 'categories', cat.id), { ...cat, questionCount: 0 }, { merge: true });
        console.log(`Seeded category: ${cat.name}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `categories/${cat.id}`);
      }
    }

    // 2. Seed Topics
    for (const topic of SEED_TOPICS) {
       try {
         await setDoc(doc(db, 'topics', topic.id), { ...topic }, { merge: true });
         console.log(`Seeded topic: ${topic.name}`);
       } catch (err) {
         handleFirestoreError(err, OperationType.WRITE, `topics/${topic.id}`);
       }
    }

    // 3. Seed Skills
    for (const skill of SEED_SKILLS) {
       try {
         await setDoc(doc(db, 'skills', skill.id), { ...skill }, { merge: true });
         console.log(`Seeded skill: ${skill.name}`);
       } catch (err) {
         handleFirestoreError(err, OperationType.WRITE, `skills/${skill.id}`);
       }
    }

    // 4. Seed Questions
    for (const quest of SEED_QUESTIONS) {
        try {
          const q = query(collection(db, 'questions'), where('stem', '==', quest.stem));
          const snap = await getDocs(q);
          if (snap.empty) {
              await addDoc(collection(db, 'questions'), {
                  ...quest,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  createdBy: 'system-seed'
              });
              console.log(`Seeded question: ${quest.stem.substring(0, 30)}...`);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'questions');
        }
    }

    console.log('Seeding completed');
    return true;
  } catch (error) {
    console.error('Seeding process failed:', error);
    throw error;
  }
}
