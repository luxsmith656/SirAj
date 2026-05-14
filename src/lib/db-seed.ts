import { collection, addDoc, getDocs, query, where, doc, updateDoc, setDoc } from 'firebase/firestore';
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
  },
  // --- FINAL CURRICULUM BATCH ---
  {
    categoryName: 'General Education',
    stem: "Alin sa mga sumusunod ang 'Tayutay' na gumagamit ng paghahambing ng dalawang magkaibang bagay na DI-TUWIRAN (hindi gumagamit ng parang, gaya, atbp)?",
    options: [{ id: 'A', text: 'Pagtutulad (Simile)' }, { id: 'B', text: 'Pagwawangis (Metaphor)' }, { id: 'C', text: 'Pagsasatao (Personification)' }, { id: 'D', text: 'Pagmamalabis (Hyperbole)' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "Who is the primary author of the 1987 Philippine Constitution?",
    options: [{ id: 'A', text: 'Cecilia Muñoz-Palma' }, { id: 'B', text: 'Claro M. Recto' }, { id: 'C', text: 'Jose Laurel' }, { id: 'D', text: 'Diosdado Macapagal' }],
    correctOptionId: 'A',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "Which element is the most abundant in the Earth's atmosphere?",
    options: [{ id: 'A', text: 'Oxygen' }, { id: 'B', text: 'Carbon Dioxide' }, { id: 'C', text: 'Nitrogen' }, { id: 'D', text: 'Argon' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "The 'Tax Reform for Acceleration and Inclusion' (TRAIN) Law is otherwise known as:",
    options: [{ id: 'A', text: 'RA 10963' }, { id: 'B', text: 'RA 10533' }, { id: 'C', text: 'RA 9155' }, { id: 'D', text: 'RA 7836' }],
    correctOptionId: 'A',
    difficulty: 'Hard'
  },
  {
    categoryName: 'General Education',
    stem: "What is the process by which plants convert light energy into chemical energy?",
    options: [{ id: 'A', text: 'Respiration' }, { id: 'B', text: 'Transpiration' }, { id: 'C', text: 'Photosynthesis' }, { id: 'D', text: 'Oxidation' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "According to Kohlberg, what stage of moral development is characterized by an orientation towards 'Law and Order'?",
    options: [{ id: 'A', text: 'Pre-conventional' }, { id: 'B', text: 'Conventional' }, { id: 'C', text: 'Post-conventional' }, { id: 'D', text: 'Sub-conventional' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following refers to the range of tasks that a learner can only perform with the help or guidance of others?",
    options: [{ id: 'A', text: 'Scaffolding' }, { id: 'B', text: 'Schema' }, { id: 'C', text: 'Zone of Proximal Development' }, { id: 'D', text: 'Metacognition' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the type of assessment given at the end of a unit or course to determine student achievement?",
    options: [{ id: 'A', text: 'Diagnostic' }, { id: 'B', text: 'Formative' }, { id: 'C', text: 'Summative' }, { id: 'D', text: 'Placement' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "The Magna Carta for Public School Teachers is also known as:",
    options: [{ id: 'A', text: 'RA 4670' }, { id: 'B', text: 'RA 7836' }, { id: 'C', text: 'RA 9293' }, { id: 'D', text: 'RA 9155' }],
    correctOptionId: 'A',
    difficulty: 'Hard'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which teaching strategy is based on the idea of 'learning by doing'?",
    options: [{ id: 'A', text: 'Lecturing' }, { id: 'B', text: 'Experiential Learning' }, { id: 'C', text: 'Memorization' }, { id: 'D', text: 'Direct Instruction' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the primary purpose of a 'Table of Specifications' (TOS)?",
    options: [{ id: 'A', text: 'To record student grades' }, { id: 'B', text: 'To ensure content validity of a test' }, { id: 'C', text: 'To schedule classes' }, { id: 'D', text: 'To evaluate teacher performance' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: English',
    stem: "Which of the following is an example of an 'Oxymoron'?",
    options: [{ id: 'A', text: 'Brave lion' }, { id: 'B', text: 'Jumbo shrimp' }, { id: 'C', text: 'Fast car' }, { id: 'D', text: 'Dark night' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: English',
    stem: "In linguistics, what is the smallest unit of sound that can distinguish one word from another?",
    options: [{ id: 'A', text: 'Morpheme' }, { id: 'B', text: 'Phoneme' }, { id: 'C', text: 'Allomorph' }, { id: 'D', text: 'Syntax' }],
    correctOptionId: 'B',
    difficulty: 'Hard'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "What is the value of 'x' in the equation 2x + 5 = 15?",
    options: [{ id: 'A', text: '5' }, { id: 'B', text: '10' }, { id: 'C', text: '20' }, { id: 'D', text: '7.5' }],
    correctOptionId: 'A',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "Which of the following describes the set of all possible outcomes of an experiment?",
    options: [{ id: 'A', text: 'Event' }, { id: 'B', text: 'Sample Space' }, { id: 'C', text: 'Probability' }, { id: 'D', text: 'Mean' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Science',
    stem: "Which law of motion states that 'For every action, there is an equal and opposite reaction'?",
    options: [{ id: 'A', text: 'First Law' }, { id: 'B', text: 'Second Law' }, { id: 'C', text: 'Third Law' }, { id: 'D', text: 'Universal Law of Gravitation' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Science',
    stem: "What is the center of an atom called?",
    options: [{ id: 'A', text: 'Electron' }, { id: 'B', text: 'Proton' }, { id: 'C', text: 'Nucleus' }, { id: 'D', text: 'Neutron' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Social Science',
    stem: "Which economic system is characterized by private ownership of the means of production?",
    options: [{ id: 'A', text: 'Socialism' }, { id: 'B', text: 'Communism' }, { id: 'C', text: 'Capitalism' }, { id: 'D', text: 'Feudalism' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Social Science',
    stem: "The movement of the Earth around the sun is called:",
    options: [{ id: 'A', text: 'Rotation' }, { id: 'B', text: 'Revolution' }, { id: 'C', text: 'Precession' }, { id: 'D', text: 'Nutation' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Who is the 'Father of the Filipino Language' (Ama ng Wikang Pambansa)?",
    options: [{ id: 'A', text: 'Jose Rizal' }, { id: 'B', text: 'Lope K. Santos' }, { id: 'C', text: 'Manuel L. Quezon' }, { id: 'D', text: 'Francisco Balagtas' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is the highest level of 'Affective Domain' in Krathwohl's Taxonomy?",
    options: [{ id: 'A', text: 'Responding' }, { id: 'B', text: 'Valuing' }, { id: 'C', text: 'Organization' }, { id: 'D', text: 'Characterization' }],
    correctOptionId: 'D',
    difficulty: 'Hard'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "A triangle with all three sides unequal in length is called:",
    options: [{ id: 'A', text: 'Equilateral' }, { id: 'B', text: 'Isosceles' }, { id: 'C', text: 'Scalene' }, { id: 'D', text: 'Right' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What was the title of Jose Rizal's first novel?",
    options: [{ id: 'A', text: 'El Filibusterismo' }, { id: 'B', text: 'Noli Me Tangere' }, { id: 'C', text: 'Mi Ultimo Adios' }, { id: 'D', text: 'A La Juventud Filipina' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following promotes 'Lifelong Learning'?",
    options: [{ id: 'A', text: 'Strict assessment' }, { id: 'B', text: 'Rote memorization' }, { id: 'C', text: 'Self-directed learning' }, { id: 'D', text: 'Teacher-centered lecturing' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: English',
    stem: "Which of the following is a 'Subordinate Conjunction'?",
    options: [{ id: 'A', text: 'And' }, { id: 'B', text: 'But' }, { id: 'C', text: 'Because' }, { id: 'D', text: 'Or' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "Which of the following is an example of an informal fallback in Filipino communication?",
    options: [{ id: 'A', text: 'Po and Opo' }, { id: 'B', text: 'Pagmamano' }, { id: 'C', text: 'Hospitality' }, { id: 'D', text: 'Bayanihan' }],
    correctOptionId: 'A',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which Philippine President is known for his 'Filipino First Policy'?",
    options: [{ id: 'A', text: 'Carlos P. Garcia' }, { id: 'B', text: 'Ramon Magsaysay' }, { id: 'C', text: 'Elpidio Quirino' }, { id: 'D', text: 'Manuel Roxas' }],
    correctOptionId: 'A',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "What is the process of water moving from the Earth's surface to the atmosphere and back?",
    options: [{ id: 'A', text: 'Carbon Cycle' }, { id: 'B', text: 'Nitrogen Cycle' }, { id: 'C', text: 'Water Cycle' }, { id: 'D', text: 'Oxygen Cycle' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "The binary system is composed of which two numbers?",
    options: [{ id: 'A', text: '0 and 1' }, { id: 'B', text: '1 and 2' }, { id: 'C', text: '0 and 2' }, { id: 'D', text: '1 and 10' }],
    correctOptionId: 'A',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Who is the primary philosopher of 'Stoicism'?",
    options: [{ id: 'A', text: 'Zeno of Citium' }, { id: 'B', text: 'Epicurus' }, { id: 'C', text: 'Aristotle' }, { id: 'D', text: 'Plato' }],
    correctOptionId: 'A',
    difficulty: 'Hard'
  },
  {
    categoryName: 'General Education',
    stem: "How many syllables are in a traditional Haiku poem?",
    options: [{ id: 'A', text: '12' }, { id: 'B', text: '14' }, { id: 'C', text: '17' }, { id: 'D', text: '19' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "Which of the following is a primary color?",
    options: [{ id: 'A', text: 'Green' }, { id: 'B', text: 'Orange' }, { id: 'C', text: 'Red' }, { id: 'D', text: 'Purple' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the capital of the Philippines?",
    options: [{ id: 'A', text: 'Quezon City' }, { id: 'B', text: 'Manila' }, { id: 'C', text: 'Cebu' }, { id: 'D', text: 'Davao' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the largest organ of the human body?",
    options: [{ id: 'A', text: 'Liver' }, { id: 'B', text: 'Skin' }, { id: 'C', text: 'Brain' }, { id: 'D', text: 'Heart' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which gas do plants primarily release during photosynthesis?",
    options: [{ id: 'A', text: 'Carbon Dioxide' }, { id: 'B', text: 'Hydrogen' }, { id: 'C', text: 'Oxygen' }, { id: 'D', text: 'Nitrogen' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the name of the nearest star to Earth?",
    options: [{ id: 'A', text: 'Sirius' }, { id: 'B', text: 'Alpha Centauri' }, { id: 'C', text: 'Proxima Centauri' }, { id: 'D', text: 'The Sun' }],
    correctOptionId: 'D',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Who is the author of 'Florante at Laura'?",
    options: [{ id: 'A', text: 'Jose Rizal' }, { id: 'B', text: 'Francisco Balagtas' }, { id: 'C', text: 'Apolinario Mabini' }, { id: 'D', text: 'Emilio Jacinto' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which stage of Piaget's development involves the concept of 'Conservation'?",
    options: [{ id: 'A', text: 'Sensorimotor' }, { id: 'B', text: 'Pre-operational' }, { id: 'C', text: 'Concrete Operational' }, { id: 'D', text: 'Formal Operational' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "In Pavlov's experiment, the bell after conditioning is the:",
    options: [{ id: 'A', text: 'Unconditioned Stimulus' }, { id: 'B', text: 'Conditioned Stimulus' }, { id: 'C', text: 'Unconditioned Response' }, { id: 'D', text: 'Conditioned Response' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which type of intelligence involves the ability to understand oneself?",
    options: [{ id: 'A', text: 'Interpersonal' }, { id: 'B', text: 'Intrapersonal' }, { id: 'C', text: 'Existential' }, { id: 'D', text: 'Naturalist' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is a characteristic of a 'Formative Assessment'?",
    options: [{ id: 'A', text: 'Graded at the end of semester' }, { id: 'B', text: 'Used to provide feedback during learning' }, { id: 'C', text: 'Used for ranking' }, { id: 'D', text: 'Final exam' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "The 'Philippine Professional Standards for Teachers' (PPST) has how many domains?",
    options: [{ id: 'A', text: '5' }, { id: 'B', text: '7' }, { id: 'C', text: '10' }, { id: 'D', text: '12' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following refers to the teacher's role as a model of good character?",
    options: [{ id: 'A', text: 'Instructional' }, { id: 'B', text: 'Exemplary' }, { id: 'C', text: 'Managerial' }, { id: 'D', text: 'Civic' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the primary purpose of 'Parent-Teacher Conferences'?",
    options: [{ id: 'A', text: 'To collect fees' }, { id: 'B', text: 'To discuss student progress and welfare' }, { id: 'C', text: 'To discipline parents' }, { id: 'D', text: 'To socialize' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is a 'High-Stakes' test?",
    options: [{ id: 'A', text: 'Weekly Quiz' }, { id: 'B', text: 'Unit Test' }, { id: 'C', text: 'Licensure Examination for Teachers' }, { id: 'D', text: 'Seatwork' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which philosophy believes that 'Education is Life' and not just a preparation for life?",
    options: [{ id: 'A', text: 'Progressivism' }, { id: 'B', text: 'Essentialism' }, { id: 'C', text: 'Perennialism' }, { id: 'D', text: 'Existentialism' }],
    correctOptionId: 'A',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "In a 'Spiral Curriculum', topics are:",
    options: [{ id: 'A', text: 'Taught only once' }, { id: 'B', text: 'Revisited with increasing complexity' }, { id: 'C', text: 'Taught randomly' }, { id: 'D', text: 'Ignored if too difficult' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the 'Hidden Curriculum'?",
    options: [{ id: 'A', text: 'Secret lesson plans' }, { id: 'B', text: 'Lessons taught illegally' }, { id: 'C', text: 'Unintended lessons learned in school' }, { id: 'D', text: 'Curriculum for gifted students' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is an example of 'Scaffolding'?",
    options: [{ id: 'A', text: 'Giving the answer directly' }, { id: 'B', text: 'Providing hints and cues' }, { id: 'C', text: 'Ignoring the student' }, { id: 'D', text: 'Punishing mistakes' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "The 'Enhanced Basic Education Act of 2013' is also known as:",
    options: [{ id: 'A', text: 'RA 9155' }, { id: 'B', text: 'RA 10533' }, { id: 'C', text: 'RA 7836' }, { id: 'D', text: 'RA 4670' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which component of the lesson plan states what students should be able to do after the lesson?",
    options: [{ id: 'A', text: 'Subject Matter' }, { id: 'B', text: 'Objectives' }, { id: 'C', text: 'Procedure' }, { id: 'D', text: 'Evaluation' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the main focus of 'Pragmatism'?",
    options: [{ id: 'A', text: 'Ideal forms' }, { id: 'B', text: 'Practicality and utility' }, { id: 'C', text: 'Religious dogma' }, { id: 'D', text: 'Abstract theories' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is a 'Non-Verbal' cue in teaching?",
    options: [{ id: 'A', text: 'Speaking clearly' }, { id: 'B', text: 'Writing on the board' }, { id: 'C', text: 'Eye contact' }, { id: 'D', text: 'Explaining a concept' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is a 'Criterion-Referenced' interpretation?",
    options: [{ id: 'A', text: 'Top 10 of the class' }, { id: 'B', text: 'Passed the minimum score requirement' }, { id: 'C', text: 'Average performance' }, { id: 'D', text: 'Better than 80% of the class' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the primary objective of 'Inclusive Education'?",
    options: [{ id: 'A', text: 'To separate students by ability' }, { id: 'B', text: 'To include all learners regardless of background or ability' }, { id: 'C', text: 'To teach only the gifted' }, { id: 'D', text: 'To reduce school funding' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is a benefit of 'Collaborative Learning'?",
    options: [{ id: 'A', text: 'Increased competition' }, { id: 'B', text: 'Development of social and teamwork skills' }, { id: 'C', text: 'Less work for the teacher' }, { id: 'D', text: 'Lower grades for everyone' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the importance of 'Feedback' in the learning process?",
    options: [{ id: 'A', text: 'To discourage students' }, { id: 'B', text: 'To inform students of their progress and guide improvement' }, { id: 'C', text: 'To waste time' }, { id: 'D', text: 'To show teacher authority' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is an example of an 'Authentic Assessment'?",
    options: [{ id: 'A', text: 'Multiple choice test' }, { id: 'B', text: 'Performance task or project' }, { id: 'C', text: 'Matching type' }, { id: 'D', text: 'True or False' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "Who is the national hero of the Philippines?",
    options: [{ id: 'A', text: 'Andres Bonifacio' }, { id: 'B', text: 'Jose Rizal' }, { id: 'C', text: 'Emilio Aguinaldo' }, { id: 'D', text: 'Apolinario Mabini' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which of the following is the national fruit of the Philippines?",
    options: [{ id: 'A', text: 'Durian' }, { id: 'B', text: 'Mango' }, { id: 'C', text: 'Pineapple' }, { id: 'D', text: 'Banana' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the national leaf of the Philippines?",
    options: [{ id: 'A', text: 'Banana Leaf' }, { id: 'B', text: 'Anahaw' }, { id: 'C', text: 'Nipa' }, { id: 'D', text: 'Sambong' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the smallest province in the Philippines in terms of land area?",
    options: [{ id: 'A', text: 'Camiguin' }, { id: 'B', text: 'Batanes' }, { id: 'C', text: 'Siquijor' }, { id: 'D', text: 'Catanduanes' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "Which volcano is known for its 'Perfect Cone'?",
    options: [{ id: 'A', text: 'Mount Pinatubo' }, { id: 'B', text: 'Mount Mayon' }, { id: 'C', text: 'Mount Apo' }, { id: 'D', text: 'Mount Taal' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Who was the first female president of the Philippines?",
    options: [{ id: 'A', text: 'Gloria Macapagal Arroyo' }, { id: 'B', text: 'Corazon Aquino' }, { id: 'C', text: 'Imelda Marcos' }, { id: 'D', text: 'Miriam Defensor Santiago' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the currency of the Philippines?",
    options: [{ id: 'A', text: 'Dollar' }, { id: 'B', text: 'Peso' }, { id: 'C', text: 'Baht' }, { id: 'D', text: 'Yen' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which of the following is the longest river in the Philippines?",
    options: [{ id: 'A', text: 'Pasig River' }, { id: 'B', text: 'Cagayan River' }, { id: 'C', text: 'Agusan River' }, { id: 'D', text: 'Pampanga River' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "What is the national flower of the Philippines?",
    options: [{ id: 'A', text: 'Rose' }, { id: 'B', text: 'Sampaguita' }, { id: 'C', text: 'Orchid' }, { id: 'D', text: 'Sunflower' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which city is known as the 'Summer Capital' of the Philippines?",
    options: [{ id: 'A', text: 'Tagaytay' }, { id: 'B', text: 'Baguio' }, { id: 'C', text: 'Cebu' }, { id: 'D', text: 'Davao' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the primary language used in the 1987 Constitution for official communications?",
    options: [{ id: 'A', text: 'Filipino and English' }, { id: 'B', text: 'Filipino only' }, { id: 'C', text: 'English and Spanish' }, { id: 'D', text: 'Tagalog and English' }],
    correctOptionId: 'A',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "Who was the 'Brains of the Katipunan'?",
    options: [{ id: 'A', text: 'Andres Bonifacio' }, { id: 'B', text: 'Emilio Jacinto' }, { id: 'C', text: 'Apolinario Mabini' }, { id: 'D', text: 'Antonio Luna' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "How many islands are there in the Philippine archipelago?",
    options: [{ id: 'A', text: '7,107' }, { id: 'B', text: '7,641' }, { id: 'C', text: '8,000' }, { id: 'D', text: '5,000' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "Which explorer led the first circumnavigation of the world (though he died in the Philippines)?",
    options: [{ id: 'A', text: 'Christopher Columbus' }, { id: 'B', text: 'Ferdinand Magellan' }, { id: 'C', text: 'Vasco da Gama' }, { id: 'D', text: 'Miguel Lopez de Legazpi' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the largest island in the Philippines?",
    options: [{ id: 'A', text: 'Mindanao' }, { id: 'B', text: 'Luzon' }, { id: 'C', text: 'Samar' }, { id: 'D', text: 'Leyte' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Who said 'The youth is the hope of the Fatherland'?",
    options: [{ id: 'A', text: 'Andres Bonifacio' }, { id: 'B', text: 'Jose Rizal' }, { id: 'C', text: 'Manuel Quezon' }, { id: 'D', text: 'Ferdinand Marcos' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the name of the Philippine national anthem?",
    options: [{ id: 'A', text: 'Bayang Magiliw' }, { id: 'B', text: 'Lupang Hinirang' }, { id: 'C', text: 'Perlas ng Silangan' }, { id: 'D', text: 'Marangal na Dalit ng Katagalugan' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which of the following is the highest mountain in the Philippines?",
    options: [{ id: 'A', text: 'Mount Pulag' }, { id: 'B', text: 'Mount Apo' }, { id: 'C', text: 'Mount Dulang-dulang' }, { id: 'D', text: 'Mount Kitanglad' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "What is the date of the Philippine Independence Day?",
    options: [{ id: 'A', text: 'July 4' }, { id: 'B', text: 'June 12' }, { id: 'C', text: 'December 30' }, { id: 'D', text: 'Wait, which year?' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which of the following is a primary greenhouse gas?",
    options: [{ id: 'A', text: 'Oxygen' }, { id: 'B', text: 'Carbon Dioxide' }, { id: 'C', text: 'Nitrogen' }, { id: 'D', text: 'Argon' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the chemical formula for water?",
    options: [{ id: 'A', text: 'CO2' }, { id: 'B', text: 'H2O' }, { id: 'C', text: 'NaCl' }, { id: 'D', text: 'O2' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which organ is responsible for pumping blood throughout the body?",
    options: [{ id: 'A', text: 'Lungs' }, { id: 'B', text: 'Heart' }, { id: 'C', text: 'Liver' }, { id: 'D', text: 'Kidneys' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the value of Pi (to two decimal places)?",
    options: [{ id: 'A', text: '3.12' }, { id: 'B', text: '3.14' }, { id: 'C', text: '3.16' }, { id: 'D', text: '3.18' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which planet is closest to the Sun?",
    options: [{ id: 'A', text: 'Venus' }, { id: 'B', text: 'Mercury' }, { id: 'C', text: 'Earth' }, { id: 'D', text: 'Mars' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the color of a mirror?",
    options: [{ id: 'A', text: 'Silver' }, { id: 'B', text: 'White' }, { id: 'C', text: 'Green' }, { id: 'D', text: 'Colorless' }],
    correctOptionId: 'C',
    difficulty: 'Hard'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is an example of 'Operant Conditioning'?",
    options: [{ id: 'A', text: 'Salivating at the smell of food' }, { id: 'B', text: 'Receiving a reward for good behavior' }, { id: 'C', text: 'Pulling your hand away from a hot stove' }, { id: 'D', text: 'Blinking at a bright light' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which type of test is used to measure a student's potential for future success?",
    options: [{ id: 'A', text: 'Achievement Test' }, { id: 'B', text: 'Aptitude Test' }, { id: 'C', text: 'Intelligence Test' }, { id: 'D', text: 'Projective Test' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is 'Reliability' in testing?",
    options: [{ id: 'A', text: 'The test measures what it intends to measure' }, { id: 'B', text: 'The consistency of scores across multiple administrations' }, { id: 'C', text: 'The ease of scoring the test' }, { id: 'D', text: 'The length of the test' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  // --- ADDED 40+ TOTAL SPECIALIZED QUESTIONS BATCH ---
  {
    categoryName: 'General Education',
    stem: "What is the study of the distribution of life forms over geographical areas?",
    options: [{ id: 'A', text: 'Biogeography' }, { id: 'B', text: 'Geology' }, { id: 'C', text: 'Ecology' }, { id: 'D', text: 'Paleontology' }],
    correctOptionId: 'A',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is the most important factor in the success of a classroom discussion?",
    options: [{ id: 'A', text: 'The teacher\'s knowledge' }, { id: 'B', text: 'The quality of questions asked' }, { id: 'C', text: 'The number of students' }, { id: 'D', text: 'The duration of the class' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "What is the derivative of f(x) = x³ - 5x + 2?",
    options: [{ id: 'A', text: '3x² - 5' }, { id: 'B', text: 'x² - 5' }, { id: 'C', text: '3x² + 5' }, { id: 'D', text: '3x - 5' }],
    correctOptionId: 'A',
    difficulty: 'Hard'
  },
  {
    categoryName: 'Major: Science',
    stem: "Which organelle is responsible for cellular respiration?",
    options: [{ id: 'A', text: 'Ribosome' }, { id: 'B', text: 'Mitochondria' }, { id: 'C', text: 'Golgi Apparatus' }, { id: 'D', text: 'Lysosome' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Who was the 'Grand Old Man of Philippine Art'?",
    options: [{ id: 'A', text: 'Fernando Amorsolo' }, { id: 'B', text: 'Juan Luna' }, { id: 'C', text: 'Guillermo Tolentino' }, { id: 'D', text: 'Vicente Manansala' }],
    correctOptionId: 'A',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following refers to the consistency of a test's results?",
    options: [{ id: 'A', text: 'Validity' }, { id: 'B', text: 'Reliability' }, { id: 'C', text: 'Usability' }, { id: 'D', text: 'Objectivity' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: English',
    stem: "What is the term for a figure of speech that uses 'like' or 'as' for comparison?",
    options: [{ id: 'A', text: 'Metaphor' }, { id: 'B', text: 'Simile' }, { id: 'C', text: 'Personification' }, { id: 'D', text: 'Hyperbole' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Social Science',
    stem: "Which theory states that the continents were once a single landmass called Pangaea?",
    options: [{ id: 'A', text: 'Plate Tectonics' }, { id: 'B', text: 'Continental Drift' }, { id: 'C', text: 'Seafloor Spreading' }, { id: 'D', text: 'Evolution' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the reciprocal of 4/5?",
    options: [{ id: 'A', text: '5/4' }, { id: 'B', text: '4/5' }, { id: 'C', text: '1/5' }, { id: 'D', text: '0.8' }],
    correctOptionId: 'A',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "According to Erikson, what is the primary conflict during adolescence?",
    options: [{ id: 'A', text: 'Trust vs Mistrust' }, { id: 'B', text: 'Autonomy vs Shame' }, { id: 'C', text: 'Identity vs Role Confusion' }, { id: 'D', text: 'Intimacy vs Isolation' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: English',
    stem: "Which of the following is a 'Collective Noun'?",
    options: [{ id: 'A', text: 'Team' }, { id: 'B', text: 'Dogs' }, { id: 'C', text: 'Water' }, { id: 'D', text: 'Happiness' }],
    correctOptionId: 'A',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "In a right triangle, if the legs are 3 and 4, what is the length of the hypotenuse?",
    options: [{ id: 'A', text: '5' }, { id: 'B', text: '7' }, { id: 'C', text: '25' }, { id: 'D', text: '12' }],
    correctOptionId: 'A',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which department is responsible for the protection and management of the environment in the Philippines?",
    options: [{ id: 'A', text: 'DepEd' }, { id: 'B', text: 'DOH' }, { id: 'C', text: 'DENR' }, { id: 'D', text: 'DOST' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the main goal of 'Differentiated Instruction'?",
    options: [{ id: 'A', text: 'To give harder tasks to everyone' }, { id: 'B', text: 'To meet the unique needs of each student' }, { id: 'C', text: 'To standardize testing' }, { id: 'D', text: 'To reduce the teacher\'s workload' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Science',
    stem: "Which planet is known as the 'Red Planet'?",
    options: [{ id: 'A', text: 'Venus' }, { id: 'B', text: 'Mars' }, { id: 'C', text: 'Jupiter' }, { id: 'D', text: 'Saturn' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Social Science',
    stem: "Who was the founder of the Katipunan?",
    options: [{ id: 'A', text: 'Jose Rizal' }, { id: 'B', text: 'Andres Bonifacio' }, { id: 'C', text: 'Emilio Aguinaldo' }, { id: 'D', text: 'Apolinario Mabini' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "What is the smallest prime number?",
    options: [{ id: 'A', text: '0' }, { id: 'B', text: '1' }, { id: 'C', text: '2' }, { id: 'D', text: '3' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which of the following is an example of an 'Intrinsic Motivator'?",
    options: [{ id: 'A', text: 'High Grades' }, { id: 'B', text: 'Praise from teacher' }, { id: 'C', text: 'Curiosity' }, { id: 'D', text: 'Monetary reward' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: English',
    stem: "Which of the following is a 'Pronoun'?",
    options: [{ id: 'A', text: 'Quickly' }, { id: 'B', text: 'They' }, { id: 'C', text: 'Under' }, { id: 'D', text: 'Green' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "What is the value of 5!? (5 factorial)",
    options: [{ id: 'A', text: '120' }, { id: 'B', text: '25' }, { id: 'C', text: '60' }, { id: 'D', text: '15' }],
    correctOptionId: 'A',
    difficulty: 'Medium'
  },
  // --- SUB-TOPIC DEPTH BATCH (ICT, CURRICULUM, ETHICS) ---
  {
    categoryName: 'General Education',
    stem: "In computing, what does 'HTTP' stand for?",
    options: [{ id: 'A', text: 'HyperText Transfer Protocol' }, { id: 'B', text: 'Hyperlink Text Transfer Process' }, { id: 'C', text: 'High-speed Tech Transfer Path' }, { id: 'D', text: 'HyperText Terminal Point' }],
    correctOptionId: 'A',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which curriculum design centers on the learners' interests, needs, and backgrounds?",
    options: [{ id: 'A', text: 'Subject-centered' }, { id: 'B', text: 'Learner-centered' }, { id: 'C', text: 'Problem-centered' }, { id: 'D', text: 'Society-centered' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Science',
    stem: "Which of the following is a unit of power?",
    options: [{ id: 'A', text: 'Joule' }, { id: 'B', text: 'Watt' }, { id: 'C', text: 'Newton' }, { id: 'D', text: 'Volt' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Social Science',
    stem: "Which Philippine law established the free public secondary education?",
    options: [{ id: 'A', text: 'RA 6655' }, { id: 'B', text: 'RA 7722' }, { id: 'C', text: 'RA 9155' }, { id: 'D', text: 'RA 10533' }],
    correctOptionId: 'A',
    difficulty: 'Hard'
  },
  {
    categoryName: 'Professional Education',
    stem: "What is the focus of 'Reconstructionism' in education?",
    options: [{ id: 'A', text: 'Return to basics' }, { id: 'B', text: 'Social reform and change' }, { id: 'C', text: 'Individual freedom' }, { id: 'D', text: 'Great books' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "What is the chemical symbol for Gold?",
    options: [{ id: 'A', text: 'Ag' }, { id: 'B', text: 'Au' }, { id: 'C', text: 'Pb' }, { id: 'D', text: 'Fe' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which IQ range is considered 'Genius' level in most scales?",
    options: [{ id: 'A', text: '90-110' }, { id: 'B', text: '120-130' }, { id: 'C', text: 'Above 140' }, { id: 'D', text: '70-80' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "What is the square root of 225?",
    options: [{ id: 'A', text: '13' }, { id: 'B', text: '15' }, { id: 'C', text: '25' }, { id: 'D', text: '12' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'General Education',
    stem: "Which of the following describes 'Biodiversity'?",
    options: [{ id: 'A', text: 'The number of people in a city' }, { id: 'B', text: 'The variety of life forms in an ecosystem' }, { id: 'C', text: 'The amount of rain in a year' }, { id: 'D', text: 'The temperature of the ocean' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "In the 'PDCA' cycle of quality management, what does 'C' stand for?",
    options: [{ id: 'A', text: 'Control' }, { id: 'B', text: 'Check' }, { id: 'C', text: 'Communicate' }, { id: 'D', text: 'Construct' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "What is the main function of 'White Blood Cells'?",
    options: [{ id: 'A', text: 'Transport oxygen' }, { id: 'B', text: 'Clotting' }, { id: 'C', text: 'Fights infection' }, { id: 'D', text: 'Digestion' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: English',
    stem: "Who wrote 'The Waste Land'?",
    options: [{ id: 'A', text: 'W.B. Yeats' }, { id: 'B', text: 'T.S. Eliot' }, { id: 'C', text: 'Robert Frost' }, { id: 'D', text: 'Ezra Pound' }],
    correctOptionId: 'B',
    difficulty: 'Hard'
  },
  {
    categoryName: 'Professional Education',
    stem: "Which assessment is used to identify a student's strengths and weaknesses BEFORE instruction?",
    options: [{ id: 'A', text: 'Summative' }, { id: 'B', text: 'Diagnostic' }, { id: 'C', text: 'Formative' }, { id: 'D', text: 'Placement' }],
    correctOptionId: 'B',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Mathematics',
    stem: "How many degrees are in a full circle?",
    options: [{ id: 'A', text: '90°' }, { id: 'B', text: '180°' }, { id: 'C', text: '270°' }, { id: 'D', text: '360°' }],
    correctOptionId: 'D',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Major: Science',
    stem: "What is the speed of light in a vacuum approximately?",
    options: [{ id: 'A', text: '300,000 km/s' }, { id: 'B', text: '150,000 km/s' }, { id: 'C', text: '1,000,000 km/s' }, { id: 'D', text: '10,000 km/s' }],
    correctOptionId: 'A',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "Who was the Filipino general known as the 'Hero of Tirad Pass'?",
    options: [{ id: 'A', text: 'Antonio Luna' }, { id: 'B', text: 'Gregorio del Pilar' }, { id: 'C', text: 'Miguel Malvar' }, { id: 'D', text: 'Macario Sakay' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Professional Education',
    stem: "What does 'NCBTS' stand for?",
    options: [{ id: 'A', text: 'National Core Building for Teacher Standards' }, { id: 'B', text: 'National Competency-Based Teacher Standards' }, { id: 'C', text: 'Nationwide Curriculum Base for Teaching Success' }, { id: 'D', text: 'Newly Certified Basic Teaching Skills' }],
    correctOptionId: 'B',
    difficulty: 'Medium'
  },
  {
    categoryName: 'Major: English',
    stem: "What is the study of meaning in language?",
    options: [{ id: 'A', text: 'Syntax' }, { id: 'B', text: 'Morphology' }, { id: 'C', text: 'Semantics' }, { id: 'D', text: 'Pragmatics' }],
    correctOptionId: 'C',
    difficulty: 'Medium'
  },
  {
    categoryName: 'General Education',
    stem: "Which of the following is a non-renewable source of energy?",
    options: [{ id: 'A', text: 'Solar' }, { id: 'B', text: 'Wind' }, { id: 'C', text: 'Coal' }, { id: 'D', text: 'Hydroelectric' }],
    correctOptionId: 'C',
    difficulty: 'Easy'
  },
  {
    categoryName: 'Professional Education',
    stem: "In the context of the 21st-century learner, what does the '4Cs' stand for?",
    options: [{ id: 'A', text: 'Calculation, Coding, Commerce, Craft' }, { id: 'B', text: 'Critical Thinking, Communication, Collaboration, Creativity' }, { id: 'C', text: 'Control, Command, Change, Climate' }, { id: 'D', text: 'Concepts, Content, Context, Curriculum' }],
    correctOptionId: 'B',
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

    // 4. Seed Dummy Users (Profiles only - Auth must be created manually or via Sign Up)
    const DUMMY_USERS = [
      { email: 'admin@letmastery.test', role: 'admin', fullName: 'System Admin', onboarded: true },
      { email: 'instructor@letmastery.test', role: 'instructor', fullName: 'Professor X', onboarded: true },
      { email: 'student@letmastery.test', role: 'student', fullName: 'John Doe', onboarded: false }
    ];

    for (const dUser of DUMMY_USERS) {
      const uQ = query(collection(db, 'users'), where('email', '==', dUser.email));
      const uSnap = await getDocs(uQ);
      if (uSnap.empty) {
        // We use email as a temporary ID or just add it. 
        // Real UID will be set upon first auth login if we don't have it.
        // For testing, we'll just add it to 'users' collection.
        await addDoc(collection(db, 'users'), {
          ...dUser,
          createdAt: new Date().toISOString()
        });
        console.log(`Seeded dummy profile: ${dUser.email}`);
      }
    }

    console.log('Seeding badges...');
    const badges = [
      { id: 'badge_pioneer', name: 'Pathfinder', description: 'Completed the diagnostic assessment and unlocked the learning path.', icon: 'target', rarity: 'Common' }
    ];
    for (const badge of badges) {
      await setDoc(doc(db, 'badges', badge.id), {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity
      }, { merge: true });
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
