import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from 'fs';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf-8');
const firebaseConfig = JSON.parse(configStr);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const qSnap = await getDocs(collection(db, "questions"));
  let count = 0;
  for (const docSnap of qSnap.docs) {
    console.log("Stem:", docSnap.data().stem);
    if (docSnap.data().stem && docSnap.data().stem.includes("[SEEDED]")) {
      await deleteDoc(doc(db, "questions", docSnap.id));
      count++;
    }
  }
  console.log("Deleted", count);
  process.exit(0);
}
run();
