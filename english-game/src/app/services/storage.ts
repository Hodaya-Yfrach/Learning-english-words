import { Injectable, signal } from '@angular/core';
import { User, Word } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  currentUser = signal<User | null>(null);
  words = signal<Word[]>([]);
  scores = signal<number[]>([]);
  points = signal(0);
  celebrationActive = signal(false);

  constructor() {
    // קסם ההתחברות האוטומטית: בודק אם יש משתמש שמור ברגע שהאתר עולה
    const savedSession = localStorage.getItem('active_user_session');
    if (savedSession) {
      const user: User = JSON.parse(savedSession);
      this.currentUser.set(user);
      this.loadUserData(user.idNumber);
    }
  }

  login(name: string, idNumber: string) {
    const user: User = { name, idNumber };
    this.currentUser.set(user);
    
    // שמירת המשתמש הפעיל בדפדפן כדי שיישאר מחובר גם אחרי רענון
    localStorage.setItem('active_user_session', JSON.stringify(user));
    
    this.loadUserData(idNumber);
  }

  logout() {
    // מחיקת המשתמש והרשימה מהמסך, ומחיקת השמירה מהדפדפן
    this.currentUser.set(null);
    this.words.set([]);
    this.scores.set([]);
    this.points.set(0);
    this.celebrationActive.set(false);
    localStorage.removeItem('active_user_session');
  }

  private loadUserData(idNumber: string) {
    const data = localStorage.getItem(`words_game_${idNumber}`);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          this.words.set(parsed);
          this.scores.set([]);
          this.points.set(0);
          this.celebrationActive.set(false);
        } else {
          this.words.set(parsed.words || []);
          this.scores.set(parsed.scores || []);
          this.points.set(parsed.points || 0);
          this.celebrationActive.set(parsed.celebrationActive || false);
        }
      } catch {
        this.words.set([]);
        this.scores.set([]);
        this.points.set(0);
      }
    } else {
      this.words.set([]);
      this.scores.set([]);
      this.points.set(0);
    }
  }

  private saveUserData() {
    const user = this.currentUser();
    if (user) {
      localStorage.setItem(`words_game_${user.idNumber}`, JSON.stringify({
        words: this.words(),
        scores: this.scores(),
        points: this.points(),
        celebrationActive: this.celebrationActive()
      }));
    }
  }

  addWord(english: string, hebrew: string) {
    const newWord: Word = {
      id: Date.now().toString(),
      english: english.trim(),
      hebrew: hebrew.trim(),
      status: 'new'
    };
    
    this.words.update(currentWords => [...currentWords, newWord]);
    this.saveUserData();
  }

  moveWordsToOld() {
    this.words.update(currentWords =>
      currentWords.map(word => ({ ...word, status: 'old' }))
    );
    this.saveUserData();
  }

  moveWordToOld(wordId: string) {
    this.words.update(currentWords =>
      currentWords.map(word =>
        word.id === wordId ? { ...word, status: 'old' } : word
      )
    );
    this.saveUserData();
  }

  deleteWord(wordId: string) {
    this.words.update(currentWords =>
      currentWords.filter(word => word.id !== wordId)
    );
    this.saveUserData();
  }

  addScore(score: number) {
    this.scores.update(currentScores => [...currentScores, score]);
    this.saveUserData();
  }

  addPoints(points: number) {
    const nextPoints = this.points() + points;
    if (nextPoints >= 10000 && !this.celebrationActive()) {
      this.points.set(10000);
      this.celebrationActive.set(true);
      this.saveUserData();
      setTimeout(() => {
        this.points.set(0);
        this.celebrationActive.set(false);
        this.saveUserData();
      }, 60_000);
      return;
    }

    this.points.set(nextPoints);
    this.saveUserData();
  }
}
