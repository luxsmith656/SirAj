import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const CATEGORIES = [
  { name: 'General Education', description: 'Core subjects including English, Math, Science, and Social Sciences.', questionCount: 0 },
  { name: 'Professional Education', description: 'Teaching profession, child development, and pedagogy.', questionCount: 0 },
  { name: 'Major: English', description: 'Specialized content for English majors.', questionCount: 0 },
  { name: 'Major: Mathematics', description: 'Specialized content for Math majors.', questionCount: 0 },
  { name: 'Major: Science', description: 'Biology, Chemistry, Physics, and Earth Science.', questionCount: 0 },
  { name: 'Major: Social Science', description: 'History, Economics, Sociology, and Geography.', questionCount: 0 }
];

const QUESTIONS = [
  // General Education
  {
    categoryName: 'General Education',
    stem: "What is the figure of speech used in the sentence: 'The world is a stage'?",
    options: [{ id: 'A', text: 'Simile' }, { id: 'B', text: 'Metaphor' }, { id: 'C', text: 'Personification' }, { id: 'D', text: 'Hyperbole' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "If a rectangle has a length of 12 cm and a width of 5 cm, what is its perimeter?",
    options: [{ id: 'A', text: '17 cm' }, { id: 'B', text: '34 cm' }, { id: 'C', text: '60 cm' }, { id: 'D', text: '24 cm' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which vitamin is primarily obtained from sunlight?",
    options: [{ id: 'A', text: 'Vitamin A' }, { id: 'B', text: 'Vitamin C' }, { id: 'C', text: 'Vitamin D' }, { id: 'D', text: 'Vitamin K' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which of the following is the smallest prime number?",
    options: [{ id: 'A', text: '0' }, { id: 'B', text: '1' }, { id: 'C', text: '2' }, { id: 'D', text: '3' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Who was the Filipino hero known as the 'Sublime Paralytic'?",
    options: [{ id: 'A', text: 'Jose Rizal' }, { id: 'B', text: 'Andres Bonifacio' }, { id: 'C', text: 'Apolinario Mabini' }, { id: 'D', text: 'Emilio Aguinaldo' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "What is the square root of 144?",
    options: [{ id: 'A', text: '10' }, { id: 'B', text: '11' }, { id: 'C', text: '12' }, { id: 'D', text: '14' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "A word that has the same or nearly the same meaning as another word is called a ________.",
    options: [{ id: 'A', text: 'Antonym' }, { id: 'B', text: 'Synonym' }, { id: 'C', text: 'Homonym' }, { id: 'D', text: 'Acronym' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },

  // Professional Education
  {
    categoryName: 'Professional Education',
    stem: "Which theory of development emphasizes the 'Zone of Proximal Development' (ZPD)?",
    options: [{ id: 'A', text: 'Piaget’s Cognitive Development Theory' }, { id: 'B', text: 'Vygotsky’s Socio-Cultural Theory' }, { id: 'C', text: 'Erikson’s Psychosocial Theory' }, { id: 'D', text: 'Freud’s Psychoanalytic Theory' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "In Bloom's Taxonomy, which level involves the ability to break down information into its component parts?",
    options: [{ id: 'A', text: 'Knowledge' }, { id: 'B', text: 'Application' }, { id: 'C', text: 'Analysis' }, { id: 'D', text: 'Synthesis' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which level of cognitive domain in Bloom's Taxonomy involves making judgments about the value of ideas or materials?",
    options: [{ id: 'A', text: 'Application' }, { id: 'B', text: 'Analysis' }, { id: 'C', text: 'Evaluation' }, { id: 'D', text: 'Synthesis' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "It is the stage of Jean Piaget's cognitive development where a child begins to think logically about concrete events.",
    options: [{ id: 'A', text: 'Sensorimotor' }, { id: 'B', text: 'Pre-operational' }, { id: 'C', text: 'Concrete Operational' }, { id: 'D', text: 'Formal Operational' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "According to Erikson's Psychosocial Theory, what is the primary conflict during adolescence?",
    options: [{ id: 'A', text: 'Trust vs. Mistrust' }, { id: 'B', text: 'Autonomy vs. Shame and Doubt' }, { id: 'C', text: 'Identity vs. Role Confusion' }, { id: 'D', text: 'Initiative vs. Guilt' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the ultimate goal of the K-12 Curriculum in the Philippines?",
    options: [{ id: 'A', text: 'Global Competitiveness' }, { id: 'B', text: 'Tertiary Education Readiness' }, { id: 'C', text: 'Holistically Developed Filipinos' }, { id: 'D', text: 'Employment' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },

  // Major: English
  {
    categoryName: 'Major: English',
    stem: "Which literary device involves the use of words that imitate sounds?",
    options: [{ id: 'A', text: 'Alliteration' }, { id: 'B', text: 'Onomatopoeia' }, { id: 'C', text: 'Assonance' }, { id: 'D', text: 'Hyperbole' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: English',
    stem: "Who wrote 'The Waste Land'?",
    options: [{ id: 'A', text: 'Robert Frost' }, { id: 'B', text: 'T.S. Eliot' }, { id: 'C', text: 'Ezra Pound' }, { id: 'D', text: 'W.B. Yeats' }],
    correctOptionId: 'B',
    difficulty: 'Hard'
  },
  {
    categoryName: 'Major: English',
    stem: "In George Orwell's 'Animal Farm', who represents Joseph Stalin?",
    options: [{ id: 'A', text: 'Snowball' }, { id: 'B', text: 'Napoleon' }, { id: 'C', text: 'Old Major' }, { id: 'D', text: 'Squealer' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: English',
    stem: "Which of the following is a characteristic of a 'Flat Character'?",
    options: [{ id: 'A', text: 'Undergoes significant change' }, { id: 'B', text: 'Complex and multidimensional' }, { id: 'C', text: 'Built around a single idea or quality' }, { id: 'D', text: 'Unpredictable behavior' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },

  // Major: Mathematics
  {
    categoryName: 'Major: Mathematics',
    stem: "What is the slope of the line passing through points (2, 3) and (4, 7)?",
    options: [{ id: 'A', text: '1/2' }, { id: 'B', text: '2' }, { id: 'C', text: '4' }, { id: 'D', text: '-2' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "In a right triangle, if the legs are 3 and 4, what is the length of the hypotenuse?",
    options: [{ id: 'A', text: '5' }, { id: 'B', text: '7' }, { id: 'C', text: '12' }, { id: 'D', text: '25' }],
    correctOptionId: 'A',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "What is the derivative of f(x) = x^2?",
    options: [{ id: 'A', text: 'x' }, { id: 'B', text: '2x' }, { id: 'C', text: 'x / 2' }, { id: 'D', text: '2' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },

  // Major: Science
  {
    categoryName: 'Major: Science',
    stem: "What is the basic unit of life?",
    options: [{ id: 'A', text: 'Atom' }, { id: 'B', text: 'Molecule' }, { id: 'C', text: 'Cell' }, { id: 'D', text: 'Organ' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Science',
    stem: "Which planet is known as the Red Planet?",
    options: [{ id: 'A', text: 'Venus' }, { id: 'B', text: 'Mars' }, { id: 'C', text: 'Jupiter' }, { id: 'D', text: 'Saturn' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Science',
    stem: "What is the atomic number of Hydrogen?",
    options: [{ id: 'A', text: '0' }, { id: 'B', text: '1' }, { id: 'C', text: '2' }, { id: 'D', text: '3' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },

  // Major: Social Science
  {
    categoryName: 'Major: Social Science',
    stem: "Who is the Father of Modern Economics?",
    options: [{ id: 'A', text: 'Karl Marx' }, { id: 'B', text: 'Adam Smith' }, { id: 'C', text: 'John Maynard Keynes' }, { id: 'D', text: 'David Ricardo' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Social Science',
    stem: "What was the name of the first Philippine Republic?",
    options: [{ id: 'A', text: 'Biak-na-Bato' }, { id: 'B', text: 'Malolos Republic' }, { id: 'C', text: 'Commonwealth' }, { id: 'D', text: 'Bagong Lipunan' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Social Science',
    stem: "Who was the leader of the 'Cry of Pugad Lawin'?",
    options: [{ id: 'A', text: 'Jose Rizal' }, { id: 'B', text: 'Andres Bonifacio' }, { id: 'C', text: 'Emilio Aguinaldo' }, { id: 'D', text: 'Apolinario Mabini' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Science',
    stem: "What is the process of converting gas directly into solid?",
    options: [{ id: 'A', text: 'Sublimation' }, { id: 'B', text: 'Deposition' }, { id: 'C', text: 'Condensation' }, { id: 'D', text: 'Evaporation' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Science',
    stem: "Which part of the brain is responsible for balance and coordination?",
    options: [{ id: 'A', text: 'Cerebrum' }, { id: 'B', text: 'Cerebellum' }, { id: 'C', text: 'Brainstem' }, { id: 'D', text: 'Thalamus' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which law enacted the 'Special Education' program in the Philippines?",
    options: [{ id: 'A', text: 'RA 7277' }, { id: 'B', text: 'RA 10533' }, { id: 'C', text: 'RA 9155' }, { id: 'D', text: 'RA 7836' }],
    correctOptionId: 'A',
    difficulty: 'Hard'
  },
  {
    categoryName: 'General Education',
    stem: "Which of the following is an example of an informal fallback in Filipino communication?",
    options: [{ id: 'A', text: 'Po and Opo' }, { id: 'B', text: 'Pagmamano' }, { id: 'C', text: 'Hospitality' }, { id: 'D', text: 'Bayanihan' }],
    correctOptionId: 'A',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "What is the area of a circle with a radius of 7 units? (Use pi = 22/7)",
    options: [{ id: 'A', text: '44 sq units' }, { id: 'B', text: '154 sq units' }, { id: 'C', text: '144 sq units' }, { id: 'D', text: '49 sq units' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "Which of the following is a prime number between 40 and 50?",
    options: [{ id: 'A', text: '42' }, { id: 'B', text: '45' }, { id: 'C', text: '47' }, { id: 'D', text: '49' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: English',
    stem: "What is the study of word origins called?",
    options: [{ id: 'A', text: 'Etymology' }, { id: 'B', text: 'Entomology' }, { id: 'C', text: 'Epidemiology' }, { id: 'D', text: 'Eschatology' }],
    correctOptionId: 'A',
    difficulty: 'Hard'
  },
  {
    categoryName: 'Major: English',
    stem: "Who is known as the 'Bard of Avon'?",
    options: [{ id: 'A', text: 'John Milton' }, { id: 'B', text: 'William Shakespeare' }, { id: 'C', text: 'Christopher Marlowe' }, { id: 'D', text: 'Edmund Spenser' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which Philippine President moved the celebration of Independence Day from July 4 to June 12?",
    options: [{ id: 'A', text: 'Manuel Quezon' }, { id: 'B', text: 'Diosdado Macapagal' }, { id: 'C', text: 'Ferdinand Marcos' }, { id: 'D', text: 'Corazon Aquino' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following refers to a teacher's professional accountability?",
    options: [{ id: 'A', text: 'Licensure Exam' }, { id: 'B', text: 'Code of Ethics' }, { id: 'C', text: 'Daily Lesson Log' }, { id: 'D', text: 'Performance Appraisal' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  // --- ADDITIONAL BATCH ---
  {
    categoryName: 'General Education',
    stem: "Which of the following is the 'Brain of the Computer'?",
    options: [{ id: 'A', text: 'RAM' }, { id: 'B', text: 'CPU' }, { id: 'C', text: 'Hard Drive' }, { id: 'D', text: 'Motherboard' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Who wrote the national anthem 'Lupang Hinirang'?",
    options: [{ id: 'A', text: 'Julian Felipe' }, { id: 'B', text: 'Jose Palma' }, { id: 'C', text: 'Juan Luna' }, { id: 'D', text: 'Apolinario Mabini' }],
    correctOptionId: 'A',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which philosophy of education emphasizes on the teaching of 'Basic Skills' and the '3 Rs' (Reading, Writing, Arithmetic)?",
    options: [{ id: 'A', text: 'Progressivism' }, { id: 'B', text: 'Essentialism' }, { id: 'C', text: 'Perennialism' }, { id: 'D', text: 'Existentialism' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "According to Maslow's Hierarchy of Needs, what is the most basic need of a human being?",
    options: [{ id: 'A', text: 'Safety' }, { id: 'B', text: 'Love and Belonging' }, { id: 'C', text: 'Physiological' }, { id: 'D', text: 'Self-actualization' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: English',
    stem: "Which of the following is a 'Direct Object' in the sentence: 'The teacher gave the students a difficult exam.'?",
    options: [{ id: 'A', text: 'Teacher' }, { id: 'B', text: 'Students' }, { id: 'C', text: 'Exam' }, { id: 'D', text: 'Gave' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "What is the sum of the interior angles of a pentagon?",
    options: [{ id: 'A', text: '180°' }, { id: 'B', text: '360°' }, { id: 'C', text: '540°' }, { id: 'D', text: '720°' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Science',
    stem: "What type of bond is formed when atoms share electrons?",
    options: [{ id: 'A', text: 'Ionic Bond' }, { id: 'B', text: 'Covalent Bond' }, { id: 'C', text: 'Hydrogen Bond' }, { id: 'D', text: 'Metallic Bond' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Social Science',
    stem: "Which ancient civilization built the 'Hanging Gardens'?",
    options: [{ id: 'A', text: 'Egyptians' }, { id: 'B', text: 'Babylonians' }, { id: 'C', text: 'Romans' }, { id: 'D', text: 'Greeks' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "A rectangle has a length of 10m and a width of 5m. What is its area?",
    options: [{ id: 'A', text: '15 sq m' }, { id: 'B', text: '30 sq m' }, { id: 'C', text: '50 sq m' }, { id: 'D', text: '25 sq m' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the primary role of the teacher in a learner-centered classroom?",
    options: [{ id: 'A', text: 'Lecturer' }, { id: 'B', text: 'Facilitator' }, { id: 'C', text: 'Disciplinarian' }, { id: 'D', text: 'Information Provider' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: English',
    stem: "Who is the author of 'To Kill a Mockingbird'?",
    options: [{ id: 'A', text: 'Ernest Hemingway' }, { id: 'B', text: 'Harper Lee' }, { id: 'C', text: 'Mark Twain' }, { id: 'D', text: 'F. Scott Fitzgerald' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "If the probability of an event is 0.75, what is the probability of its complement?",
    options: [{ id: 'A', text: '0.25' }, { id: 'B', text: '0.75' }, { id: 'C', text: '0.50' }, { id: 'D', text: '1.00' }],
    correctOptionId: 'A',
    difficulty: 'Medium'
  }
];

export async function seedDatabase() {
  console.log('Starting database seed...');
  
  const categoryMap: Record<string, string> = {};

  try {
    console.log('Starting seed process...');
    // 1. Seed Categories
    for (const cat of CATEGORIES) {
      const q = query(collection(db, 'categories'), where('name', '==', cat.name));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        const docRef = await addDoc(collection(db, 'categories'), cat);
        categoryMap[cat.name] = docRef.id;
        console.log(`Created category: ${cat.name}`);
      } else {
        categoryMap[cat.name] = snap.docs[0].id;
        console.log(`Category exists: ${cat.name}`);
      }
    }

    // 2. Seed Questions
    for (const quest of QUESTIONS) {
      const catId = categoryMap[quest.categoryName];
      if (!catId) {
        console.warn(`No category found for question: ${quest.stem.substring(0, 20)}`);
        continue;
      }

      const q = query(collection(db, 'questions'), where('stem', '==', quest.stem));
      const snap = await getDocs(q);

      if (snap.empty) {
        const { categoryName, ...questionData } = quest;
        await addDoc(collection(db, 'questions'), {
          ...questionData,
          categoryId: catId,
          updatedAt: new Date().toISOString()
        });
        console.log(`Created question: ${quest.stem.substring(0, 30)}...`);
      } else {
        console.log(`Question exists: ${quest.stem.substring(0, 30)}...`);
      }
    }

    // 3. Update Question Counts
    for (const [name, id] of Object.entries(categoryMap)) {
      const q = query(collection(db, 'questions'), where('categoryId', '==', id));
      const snap = await getDocs(q);
      await updateDoc(doc(db, 'categories', id), {
        questionCount: snap.size
      });
    }

    console.log('Database seed completed successfully!');
    return true;
  } catch (error: any) {
    console.error('Database seed error details:', error);
    if (error.message && error.message.includes('permission-denied')) {
        throw new Error('Permission Denied: You must be an admin in the database to perform this action. Your account may still be upgrading.');
    }
    throw error;
  }
}
