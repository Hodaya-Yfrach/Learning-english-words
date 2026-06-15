import { Component, inject, computed } from '@angular/core';
import { StorageService } from '../../services/storage';

@Component({
  selector: 'app-words-manager',
  standalone: true,
  templateUrl: './words-manager.html',
  styleUrl: './words-manager.css'
})
export class WordsManagerComponent {
  storageService = inject(StorageService);

  // פיצול הרשימה אוטומטית לחדשות וישנות בעזרת computed
  newWords = computed(() => this.storageService.words().filter(w => w.status === 'new'));
  oldWords = computed(() => this.storageService.words().filter(w => w.status === 'old'));

  // פונקציה להוספת מילה שמקבלת את תיבות הטקסט עצמן כדי שנוכל לנקות אותן
  onAddWord(englishInput: HTMLInputElement, hebrewInput: HTMLInputElement) {
    const english = englishInput.value;
    const hebrew = hebrewInput.value;

    if (english.trim() !== '' && hebrew.trim() !== '') {
      this.storageService.addWord(english, hebrew);
      
      // ניקוי השדות והחזרת הסמן לשדה הראשון
      englishInput.value = '';
      hebrewInput.value = '';
      englishInput.focus();
    } else {
      alert('יש למלא גם אנגלית וגם עברית! 🖍️');
    }
  }

  // פונקציה להעברת המילים
  onMoveToOld() {
    this.storageService.moveWordsToOld();
  }
}