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
