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
                    body: `This is the comprehensive notes for ${lesson}. \n\nKey Concepts:\n- Read carefully to understand the context.\n- Be prepared to analyze and apply theories.\n- Practice answers continuously.`,
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
                stem: `What is the most appropriate concept regarding ${topicInfo.topic.replace(/_/g, ' ')}? (Question ${index})`,
                options: [
                    { id: 'A', text: `A distracter that seems correct for ${topicInfo.topic}` },
                    { id: 'B', text: `The universally accepted correct principle for ${topicInfo.topic}` },
                    { id: 'C', text: `An outdated pedagogical theory related to ${topicInfo.topic}` },
                    { id: 'D', text: `A completely irrelevant answer choice` }
                ],
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
