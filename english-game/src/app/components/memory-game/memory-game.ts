import { Component, inject, signal } from '@angular/core';
import { StorageService } from '../../services/storage';

interface Card {
  id: string;
  wordId: string;
  text: string;
  isSelected: boolean; // במקום מוסתר/גלוי, יש לנו רק מסומן
  isMatched: boolean;
  isError: boolean;
}

@Component({
  selector: 'app-memory-game',
  standalone: true,
  templateUrl: './memory-game.html',
  styleUrl: './memory-game.css'
})
export class MemoryGameComponent {
  storageService = inject(StorageService);

  gameState = signal<'menu' | 'playing' | 'finished'>('menu');
  cards = signal<Card[]>([]); 
  errorsCount = signal(0); 
  selectedCards = signal<Card[]>([]); 
  finalScore = signal(100); 

  startGame(mode: 'new' | 'all') {
    let wordsPool = this.storageService.words();
    if (mode === 'new') wordsPool = wordsPool.filter(w => w.status === 'new');

    if (wordsPool.length < 2) {
      alert('צריך לפחות 2 מילים במאגר כדי להתחיל לשחק!');
      return;
    }

    const selectedWords = [...wordsPool].sort(() => 0.5 - Math.random()).slice(0, 8);
    let gameCards: Card[] = [];
    
    selectedWords.forEach((word, index) => {
      // כל המילים נוצרות כגלויות (אין יותר isFlipped)
      gameCards.push({ id: `eng_${index}`, wordId: word.id, text: word.english, isSelected: false, isMatched: false, isError: false });
      gameCards.push({ id: `heb_${index}`, wordId: word.id, text: word.hebrew, isSelected: false, isMatched: false, isError: false });
    });

    gameCards = gameCards.sort(() => 0.5 - Math.random());

    this.cards.set(gameCards);
    this.errorsCount.set(0);
    this.selectedCards.set([]);
    this.gameState.set('playing');
  }

  onCardClick(card: Card) {
    // אם הכרטיסייה כבר הותאמה, כבר סומנה, או ששיש כבר 2 מסומנות - אל תעשה כלום
    if (card.isMatched || card.isSelected || this.selectedCards().length === 2) return;

    // מסמנים את הכרטיסייה שלחצו עליה
    this.cards.update(cards => cards.map(c => c.id === card.id ? { ...c, isSelected: true } : c));
    const currentSelected = [...this.selectedCards(), card];
    this.selectedCards.set(currentSelected);

    if (currentSelected.length === 2) {
      this.checkMatch(currentSelected[0], currentSelected[1]);
    }
  }

  private checkMatch(card1: Card, card2: Card) {
    if (card1.wordId === card2.wordId) {
      // התאמה נכונה!
      setTimeout(() => {
        this.cards.update(cards => cards.map(c => (c.id === card1.id || c.id === card2.id) ? { ...c, isMatched: true, isSelected: false } : c));
        this.selectedCards.set([]);
        this.checkWin();
      }, 300); 
    } else {
      // טעות!
      this.errorsCount.update(c => c + 1);
      
      // צובעים באדום
      this.cards.update(cards => cards.map(c => (c.id === card1.id || c.id === card2.id) ? { ...c, isError: true } : c));

      // מסירים את האדום והסימון אחרי שנייה
      setTimeout(() => {
        this.cards.update(cards => cards.map(c => (c.id === card1.id || c.id === card2.id) ? { ...c, isSelected: false, isError: false } : c));
        this.selectedCards.set([]);
      }, 1000);
    }
  }

  private checkWin() {
    const allMatched = this.cards().every(c => c.isMatched);
    if (allMatched) {
      let score = 100 - (this.errorsCount() * 5);
      if (score < 0) score = 0;
      this.finalScore.set(score);
      setTimeout(() => this.gameState.set('finished'), 500);
    }
  }
}