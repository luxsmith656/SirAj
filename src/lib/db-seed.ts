import { collection, doc, setDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { CATEGORIES as SEED_CATEGORIES, TOPICS as SEED_TOPICS, SKILLS as SEED_SKILLS, INITIAL_QUESTIONS as SEED_QUESTIONS } from './seedData';
import { handleFirestoreError, OperationType } from './firestoreUtils';

// Simple hash function for stable IDs
function generateStableId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'q_' + Math.abs(hash).toString(36);
}

export async function seedDatabase() {
  console.log('Starting standardized database seed...');
  
  try {
    // 1. Seed Categories
    for (const cat of SEED_CATEGORIES) {
      try {
        await setDoc(doc(db, 'categories', cat.id), { 
          ...cat, 
          questionCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log(`Seeded category: ${cat.name}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `categories/${cat.id}`);
      }
    }

    // 2. Seed Topics
    for (const topic of SEED_TOPICS) {
       try {
         await setDoc(doc(db, 'topics', topic.id), { 
           ...topic,
           createdAt: serverTimestamp(),
           updatedAt: serverTimestamp()
         }, { merge: true });
         console.log(`Seeded topic: ${topic.name}`);
       } catch (err) {
         handleFirestoreError(err, OperationType.WRITE, `topics/${topic.id}`);
       }
    }

    // 3. Seed Skills
    for (const skill of SEED_SKILLS) {
       try {
         await setDoc(doc(db, 'skills', skill.id), { 
           ...skill,
           createdAt: serverTimestamp(),
           updatedAt: serverTimestamp()
         }, { merge: true });
         console.log(`Seeded skill: ${skill.name}`);
       } catch (err) {
         handleFirestoreError(err, OperationType.WRITE, `skills/${skill.id}`);
       }
    }

    // 4. Seed Questions with Stable IDs
    for (const quest of SEED_QUESTIONS) {
        try {
          const stableId = generateStableId(quest.stem);
          await setDoc(doc(db, 'questions', stableId), {
            ...quest,
            id: stableId,
            version: 1,
            aiGenerated: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: 'system-seed'
          }, { merge: true });
          console.log(`Seeded question (${stableId}): ${quest.stem.substring(0, 30)}...`);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'questions');
        }
    }

    // 5. Seed Starter Modules
    const starterModules = [
      {
        id: 'mod_intro_profed',
        title: 'Introduction to Professional Education',
        description: 'Foundation of the teaching profession and legal bases.',
        categoryId: 'profed',
        topicId: 'profed_principles',
        skillIds: [],
        level: 1,
        lessonBlocks: [
          { type: 'text', content: 'The teaching profession is grounded in ethical principles and legal frameworks. In the Philippines, the Code of Ethics for Professional Teachers serves as the primary guide.' },
          { type: 'callout', content: 'Key Concept: Teaching is both a mission and a profession.' }
        ],
        checkQuestionIds: [], // To be linked to seeded questions
        challengeQuestionIds: [],
        prerequisiteModuleIds: [],
        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    for (const mod of starterModules) {
      try {
        await setDoc(doc(db, 'modules', mod.id), mod, { merge: true });
        console.log(`Seeded module: ${mod.title}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `modules/${mod.id}`);
      }
    }

    console.log('Standardized seeding completed');

    // 6. Seed Demo Accounts
    const demoAccounts = [
      {
        uid: 'demo-student',
        email: 'student@letmastery.com',
        role: 'student',
        fullName: 'Demo Student',
        onboarded: true,
        diagnosticCompleted: true,
        streak: 5,
        xp: 1250,
        level: 2,
        earnedBadges: ['badge_pioneer']
      },
      {
        uid: 'demo-instructor',
        email: 'instructor@letmastery.com',
        role: 'instructor',
        fullName: 'Dr. Jane Teacher',
        onboarded: true,
        diagnosticCompleted: false
      },
      {
        uid: 'demo-admin',
        email: 'admin@letmastery.com',
        role: 'admin',
        fullName: 'System Administrator',
        onboarded: true,
        diagnosticCompleted: false
      }
    ];

    for (const acct of demoAccounts) {
      try {
        await setDoc(doc(db, 'users', acct.uid), {
          ...acct,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log(`Seeded demo account: ${acct.email}`);
      } catch (err) {
         console.error(`Failed to seed demo account ${acct.email}`, err);
      }
    }

    return true;
  } catch (error) {
    console.error('Seeding process failed:', error);
    throw error;
  }
}
