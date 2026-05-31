import { initDB } from './db';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db as firestoreDb } from '../firebase';

const CURRICULUM = {
  gened: {
    title: "General Education (GenEd)",
    topics: [
      { id: "gened_english", title: "English", lessons: ["Grammar", "Vocabulary", "Reading Comprehension", "Literature", "Writing"] },
      { id: "gened_filipino", title: "Filipino", lessons: ["Wastong gamit ng salita", "Balarila", "Panitikan", "Komunikasyon", "Pagbasa at pag-unawa"] },
      { id: "gened_math", title: "Mathematics", lessons: ["Basic Arithmetic", "Fractions", "Algebra", "Geometry", "Statistics", "Word Problems"] },
      { id: "gened_science", title: "Science", lessons: ["Biology", "Chemistry", "Physics", "Earth Science"] },
      { id: "gened_socsci", title: "Social Sciences", lessons: ["Philippine History", "World History", "Economics", "Sociology", "Government"] },
      { id: "gened_ict", title: "ICT", lessons: ["Computer Fundamentals", "Networking Basics", "Internet", "Cybersecurity"] },
      { id: "gened_rizal", title: "Rizal and Constitution", lessons: ["Noli Me Tangere", "El Filibusterismo", "Life of José Rizal", "1987 Constitution"] }
    ]
  },
  profed: {
    title: "Professional Education (ProfEd)",
    topics: [
      { id: "profed_psychology", title: "Educational Psychology", lessons: ["Learning Theories", "Behaviorism", "Cognitivism", "Constructivism", "Motivation"] },
      { id: "profed_child_dev", title: "Child and Adolescent Development", lessons: ["Physical Development", "Cognitive Development", "Moral Development"] },
      { id: "profed_principles", title: "Principles of Teaching", lessons: ["Teaching Strategies", "Classroom Management", "Lesson Planning", "Questioning Techniques"] },
      { id: "profed_assessment", title: "Assessment of Learning", lessons: ["Formative Assessment", "Summative Assessment", "Reliability", "Validity", "Rubrics"] },
      { id: "profed_curriculum", title: "Curriculum Development", lessons: ["Curriculum Models", "Curriculum Planning", "Curriculum Evaluation"] },
      { id: "profed_edtech", title: "Educational Technology", lessons: ["Technology Integration", "Multimedia Learning", "Digital Citizenship"] },
      { id: "profed_reading", title: "Developmental Reading", lessons: ["Reading Skills", "Reading Strategies", "Reading Assessment"] },
      { id: "profed_profession", title: "Teaching Profession", lessons: ["RA 7836", "Code of Ethics", "Magna Carta"] }
    ]
  },
  major: {
    title: "SPECIALIZATION / MAJOR",
    topics: [
      { id: "major_english", title: "BSEd English", lessons: ["Grammar", "Linguistics", "Literature", "Language Teaching"] },
      { id: "major_math", title: "BSEd Mathematics", lessons: ["Algebra", "Geometry", "Trigonometry", "Calculus"] },
      { id: "major_science", title: "BSEd Science", lessons: ["Biology", "Chemistry", "Physics", "Earth Science"] },
      { id: "major_socsci", title: "BSEd Social Studies", lessons: ["Philippine History", "World History", "Economics", "Political Science"] },
      { id: "major_filipino", title: "BSEd Filipino", lessons: ["Panitikan", "Wika", "Lingguwistika", "Pagtuturo ng Filipino"] },
      { id: "major_mapeh", title: "BSEd MAPEH", lessons: ["Music", "Arts", "PE", "Health"] },
      { id: "major_tle", title: "BSEd TLE", lessons: ["ICT", "Entrepreneurship", "Agriculture", "Home Economics"] }
    ]
  }
};

function generateLectureText(lesson: string, topic: string) {
  return `# Comprehensive Guide to ${lesson}\n\n## 1. Introduction and Core Concepts\nThe study of **${lesson}** is foundational to mastering **${topic}**. It involves understanding the complex mechanics and theories that form the backbone of this subject area.\n\nIn this module, we will explore the theoretical frameworks, practical applications, and historical context of ${lesson}. \n\n## 2. Key Principles\n1. **Principle of Consistency**: Ensuring that applications of ${lesson} remain stable across different scenarios.\n2. **Principle of Adaptation**: The ability to bend theoretical rules to fit practical constraints in ${topic}.\n3. **Principle of Analytical Rigor**: The necessity of evaluating inputs and outputs critically.\n\n## 3. Deep Dive into Applications\nWhen applying the concepts of ${lesson}, professionals must consider various edge cases. For instance, in a practical environment, the variables are rarely static. The dynamic nature of ${topic} means that memorizing facts is insufficient; one must synthesize information dynamically.\n\n> **Important Note:** Always double-check your initial assumptions when evaluating problems related to ${lesson}. Many common pitfalls occur due to overlooking foundational details.\n\n### 3.1 Advanced Methodologies\n- **Taxonomy of Skills**: Breaking down ${lesson} into discrete, observable behaviors and cognitive steps.\n- **Heuristic Evaluation**: Using rules of thumb to solve complex problems when standard algorithms are too slow.\n- **Iterative Refinement**: Building mastery through repeated, varied practice across different contexts.\n\n## 4. Conclusion and Summary\nMastering ${lesson} requires patience and deliberate practice. As you prepare for the licensure examination, focus not just on recalling the definitions provided here, but on understanding *why* they matter within the broader scope of ${topic}.\n\n*Review these notes regularly and test your knowledge using the practice drills.*`;
}

function generateQuestionOptions(index: number, topic: string) {
    const isTopicGen = topic.includes('gened');
    const isTopicProf = topic.includes('profed');
    if (index % 4 === 0) {
        return [
            { id: 'A', text: `It focuses solely on the theoretical aspects of ${topic}.` },
            { id: 'B', text: `It integrates both theory and practice in addressing ${topic}.` },
            { id: 'C', text: `It minimizes the importance of foundational concepts.` },
            { id: 'D', text: `It relies entirely on outdated traditional methods.` }
        ];
    } else if (index % 4 === 1) {
        return [
            { id: 'A', text: `By applying a strict rule-based approach without exceptions.` },
            { id: 'B', text: `By adopting a flexible, adaptive strategy based on context.` },
            { id: 'C', text: `By ignoring edge cases to simplify the overall process.` },
            { id: 'D', text: `By delegating the responsibility to external stakeholders.` }
        ];
    } else if (index % 4 === 2) {
        return [
            { id: 'A', text: `The primary objective is rote memorization of facts.` },
            { id: 'B', text: `The primary objective is the critical synthesis and application of knowledge.` },
            { id: 'C', text: `The primary objective is to complete the curriculum as fast as possible.` },
            { id: 'D', text: `The primary objective is to focus only on subjective interpretations.` }
        ];
    } else {
        return [
            { id: 'A', text: `It ensures that all perspectives are universally identical.` },
            { id: 'B', text: `It accommodates diverse methods and promotes inclusive understanding.` },
            { id: 'C', text: `It restricts the scope of learning to a single rigid framework.` },
            { id: 'D', text: `It eliminates the need for any formal assessment.` }
        ];
    }
}

export async function seedCloudDatabase() {
    console.log("Seeding cloud database with Categories, Topics, Textbooks and Questions...");
    
    // 1. Seed Categories & Topics
    const setupBatch = writeBatch(firestoreDb);
    const categoriesRef = collection(firestoreDb, 'categories');
    const topicsRef = collection(firestoreDb, 'topics');
    const modulesRef = collection(firestoreDb, 'modules');
    
    let allTopicIds: {cat: string, topic: string}[] = [];

    for (const [catId, catData] of Object.entries(CURRICULUM)) {
        setupBatch.set(doc(categoriesRef, catId), {
            id: catId,
            name: catData.title,
            description: `Complete LET Review for ${catData.title}`,
            order: catId === 'gened' ? 1 : catId === 'profed' ? 2 : 3
        });
        
        let order = 1;
        
        for (const t of catData.topics) {
            setupBatch.set(doc(topicsRef, t.id), {
                id: t.id,
                categoryId: catId,
                title: t.title,
                description: `Master ${t.title} for the board exams.`,
                order: order++
            });
            allTopicIds.push({ cat: catId, topic: t.id });
            
            // Seed a Textbook/Module per topic
            setupBatch.set(doc(modulesRef, t.id), {
                 title: `Comprehensive Review: ${t.title}`,
                 description: `Everything you need to know about ${t.title}.`,
                 categoryId: catId,
                 topicId: t.id,
                 publishScope: 'public',
                 modules: t.lessons.map((lesson, idx) => ({
                     id: `lesson_${idx}`,
                     title: lesson,
                     topicId: t.id,
                     order: idx + 1
                 })),
                 sections: t.lessons.map((lesson, idx) => ({
                    id: `sec_${idx}`,
                    moduleId: `lesson_${idx}`,
                    title: `Introduction to ${lesson}`,
                    body: generateLectureText(lesson, t.title),
                    type: 'reading'
                 })),
                 quizzes: t.lessons.map((lesson, idx) => ({
                     id: `quiz_${idx}`,
                     moduleId: `lesson_${idx}`,
                     title: `${lesson} Mastery Check`,
                     questionCount: 5
                 }))
            });
        }
    }
    
    await setupBatch.commit();
    console.log("Categories, Topics, and Modules seeded.");

    const NUM_QUESTIONS = 5000;
    const CHUNK_SIZE = 500; 
    let currentTopicIndex = 0;
    
    for (let i = 0; i < NUM_QUESTIONS; i += CHUNK_SIZE) {
        const batch = writeBatch(firestoreDb);
        const questionsRef = collection(firestoreDb, 'questions');
        for (let j = 0; j < CHUNK_SIZE && i + j < NUM_QUESTIONS; j++) {
            const index = i + j;
            
            const topicInfo = allTopicIds[currentTopicIndex % allTopicIds.length];
            currentTopicIndex++;
            
            const newDoc = doc(questionsRef);
            batch.set(newDoc, {
                stem: `In the context of ${topicInfo.topic.replace(/_/g, ' ')}, which of the following best describes the core principle? (Q${index})`,
                options: generateQuestionOptions(index, topicInfo.topic.replace(/_/g, ' ')),
                correctOptionId: 'B',
                categoryId: topicInfo.cat,
                topicId: topicInfo.topic,
                explanation: `Option B is correct because it directly addresses the fundamental principles of ${topicInfo.topic} as recognized in Philippine educational standards. Options A and C contain logical fallacies.`,
                isPublished: true,
                approved: true,
                difficulty: index % 3 === 0 ? 'hard' : index % 2 === 0 ? 'easy' : 'medium',
                createdAt: new Date().toISOString()
            });
        }
        await batch.commit();
        console.log(`Pushed batch of ${Math.min((i + CHUNK_SIZE), NUM_QUESTIONS)} / ${NUM_QUESTIONS} questions to cloud...`);
    }
    console.log("Cloud Seeding Complete.");
}

export async function seedLocalDatabase() {
    console.log("Seeding local database with 5000 questions...");
    const db = await initDB();
    const count = await db.count('localQuestions');
    if (count >= 5000) {
        console.log("Database already seeded");
        return;
    }

    const categories = ['gened', 'profed', 'major'];
    const CHUNK_SIZE = 500;
    const NUM_QUESTIONS = 5000;
    
    for (let i = count; i < NUM_QUESTIONS; i += CHUNK_SIZE) {
        const tx = db.transaction('localQuestions', 'readwrite');
        for (let j = 0; j < CHUNK_SIZE && i + j < NUM_QUESTIONS; j++) {
            const index = i + j;
            const categoryId = categories[index % categories.length];
            const q = {
                id: `seeded-q-${index}`,
                stem: `(Seeded local ${index}) Which of the following is essential in ${categoryId}?`,
                options: [
                    { id: 'A', text: `Option A` },
                    { id: 'B', text: `Option B` },
                    { id: 'C', text: `Option C` },
                    { id: 'D', text: `Option D` }
                ],
                correctOptionId: 'B',
                categoryId: categoryId,
                explanation: `This is the rationalization for ${index}.`,
                topicId: 'general',
                isPublished: true,
                approved: true
            };
            tx.store.put(q);
        }
        await tx.done;
    }
    console.log("Local Seeding complete.");
}
