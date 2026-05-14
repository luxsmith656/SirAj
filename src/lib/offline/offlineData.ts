import { initDB } from './db';

export class OfflineData {
  static async getCategories() {
    const db = await initDB();
    return await db.getAll('localCategories');
  }

  static async getTopicsByCategory(categoryId: string) {
    const db = await initDB();
    const tx = db.transaction('localTopics', 'readonly');
    const index = tx.store.index('by-category');
    return await index.getAll(categoryId);
  }

  static async getQuestionsByCategory(categoryId: string) {
    const db = await initDB();
    const tx = db.transaction('localQuestions', 'readonly');
    const index = tx.store.index('by-category');
    return await index.getAll(categoryId);
  }

  static async getModules() {
    const db = await initDB();
    return await db.getAll('localModules');
  }

  static async getRandomQuestions(categoryId: string, count: number) {
    const questions = await this.getQuestionsByCategory(categoryId);
    // Shuffle and pick count
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static async saveQuizAttempt(attempt: any) {
    const db = await initDB();
    const localAttemptId = crypto.randomUUID();
    const record = {
      localAttemptId,
      ...attempt,
      synced: 0, // 0 means unsynced
      createdAt: Date.now()
    };
    await db.put('localQuizAttempts', record);
    return localAttemptId;
  }

  static async getUnsyncedAttempts() {
    const db = await initDB();
    const tx = db.transaction('localQuizAttempts', 'readonly');
    const index = tx.store.index('by-synced');
    return await index.getAll(0);
  }

  static async markAttemptSynced(localAttemptId: string) {
    const db = await initDB();
    const attempt = await db.get('localQuizAttempts', localAttemptId);
    if (attempt) {
      attempt.synced = 1;
      await db.put('localQuizAttempts', attempt);
    }
  }
}
