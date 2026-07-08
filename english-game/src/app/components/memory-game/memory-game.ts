import { Component, inject, signal, computed } from '@angular/core';
import { StorageService } from '../../services/storage';
import { Word } from '../../models';

interface Card {
  id: string;
  wordId: string;
  text: string;
  isSelected: boolean;
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
  totalPairs = signal(0);
  currentBatchIndex = signal(0);
  private wordBatches: Word[][] = [];

  startGame(mode: 'new' | 'all') {
    let wordsPool = this.storageService.words();
    if (mode === 'new') wordsPool = wordsPool.filter(w => w.status === 'new');

    if (wordsPool.length < 2) {
      alert('צריך לפחות 2 מילים במאגר כדי להתחיל לשחק!');
      return;
    }

    const shuffledWords = [...wordsPool].sort(() => 0.5 - Math.random());
    this.wordBatches = [];
    while (shuffledWords.length > 0) {
      this.wordBatches.push(shuffledWords.splice(0, 8));
    }

    const totalPairs = this.wordBatches.reduce((sum, batch) => sum + batch.length, 0);
    this.totalPairs.set(totalPairs);
    this.errorsCount.set(0);
    this.selectedCards.set([]);
    this.currentBatchIndex.set(0);
    this.startBatch(0);
    this.gameState.set('playing');
  }

  private startBatch(batchIndex: number) {
    const batch = this.wordBatches[batchIndex];
    if (!batch) {
      return;
    }

    this.currentBatchIndex.set(batchIndex);
    let gameCards: Card[] = [];

    batch.forEach((word, index) => {
      gameCards.push({ id: `eng_${batchIndex}_${index}`, wordId: word.id, text: word.english, isSelected: false, isMatched: false, isError: false });
      gameCards.push({ id: `heb_${batchIndex}_${index}`, wordId: word.id, text: word.hebrew, isSelected: false, isMatched: false, isError: false });
    });

    this.cards.set(gameCards.sort(() => 0.5 - Math.random()));
    this.selectedCards.set([]);
  }

  onCardClick(card: Card) {
    if (card.isMatched || card.isSelected || this.selectedCards().length === 2) return;
    this.cards.update(cards => cards.map(c => c.id === card.id ? { ...c, isSelected: true } : c));
    const currentSelected = [...this.selectedCards(), card];
    this.selectedCards.set(currentSelected);
    if (currentSelected.length === 2) {
      this.checkMatch(currentSelected[0], currentSelected[1]);
    }
  }

  private checkMatch(card1: Card, card2: Card) {
    if (card1.wordId === card2.wordId) {
      setTimeout(() => {
        this.cards.update(cards => cards.map(c => (c.id === card1.id || c.id === card2.id) ? { ...c, isMatched: true, isSelected: false } : c));
        this.selectedCards.set([]);
        this.checkWin();
      }, 300);
    } else {
      this.errorsCount.update(c => c + 1);
      this.cards.update(cards => cards.map(c => (c.id === card1.id || c.id === card2.id) ? { ...c, isError: true } : c));
      setTimeout(() => {
        this.cards.update(cards => cards.map(c => (c.id === card1.id || c.id === card2.id) ? { ...c, isSelected: false, isError: false } : c));
        this.selectedCards.set([]);
      }, 1000);
    }
  }

  private checkWin() {
    const allMatched = this.cards().every(c => c.isMatched);
    if (allMatched) {
      const nextBatch = this.currentBatchIndex() + 1;
      if (nextBatch < this.wordBatches.length) {
        setTimeout(() => this.startBatch(nextBatch), 700);
        return;
      }

      const pairs = this.totalPairs();
      const maxErrors = pairs;
      const errors = this.errorsCount();
      let score = Math.round(((maxErrors - Math.min(errors, maxErrors)) / maxErrors) * 100);
      if (score < 0) score = 0;
      this.finalScore.set(score);
      this.storageService.addScore(score);
      setTimeout(() => this.gameState.set('finished'), 500);
    }
  }
}
