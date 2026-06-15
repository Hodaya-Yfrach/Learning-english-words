import { Injectable, signal } from '@angular/core';
import { User, Word } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  currentUser = signal<User | null>(null);
  words = signal<Word[]>([]);

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
    localStorage.removeItem('active_user_session');
  }

  private loadUserData(idNumber: string) {
    const data = localStorage.getItem(`words_game_${idNumber}`);
    if (data) {
      this.words.set(JSON.parse(data));
    } else {
      this.words.set([]); 
    }
  }

  private saveUserData() {
    const user = this.currentUser();
    if (user) {
      localStorage.setItem(`words_game_${user.idNumber}`, JSON.stringify(this.words()));
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
}