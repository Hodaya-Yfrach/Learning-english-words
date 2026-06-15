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

  newWords = computed(() => this.storageService.words().filter(w => w.status === 'new'));
  oldWords = computed(() => this.storageService.words().filter(w => w.status === 'old'));

  // מילון תרגום מקלדת: עברית לאנגלית
  private hebrewToEnglishMap: { [key: string]: string } = {
    '/': 'q', "'": 'w', 'ק': 'e', 'ר': 'r', 'א': 't', 'ט': 'y', 'ו': 'u', 'ן': 'i', 'ם': 'o', 'פ': 'p',
    'ש': 'a', 'ד': 's', 'ג': 'd', 'כ': 'f', 'ע': 'g', 'י': 'h', 'ח': 'j', 'ל': 'k', 'ך': 'l', 'ף': ';',
    'ז': 'z', 'ס': 'x', 'ב': 'c', 'ה': 'v', 'נ': 'b', 'מ': 'n', 'צ': 'm', 'ת': ',', 'ץ': '.', '.': '/'
  };

  private englishToHebrewMap = Object.entries(this.hebrewToEnglishMap).reduce(
    (map, [hebrew, english]) => ({ ...map, [english]: hebrew }), {} as { [key: string]: string }
  );

  // פונקציה שעובדת בכל פעם שמקלידים, ומתקנת את הטקסט לאנגלית
  fixEnglishTyping(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let originalText = inputElement.value;
    let fixedText = '';

    for (let char of originalText) {
      // אם התו נמצא במילון, נחליף אותו. אם לא (כמו רווח או אנגלית), נשאיר אותו
      fixedText += this.hebrewToEnglishMap[char] || char;
    }
    
    inputElement.value = fixedText;
  }

  // פונקציה שעובדת בתיבת טקסט עברית ומתרגמת מקלדת אנגלית לאותיות עבריות
  fixHebrewTyping(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let originalText = inputElement.value;
    let fixedText = '';

    for (let char of originalText) {
      fixedText += this.englishToHebrewMap[char] || char;
    }

    inputElement.value = fixedText;
  }

  onAddWord(englishInput: HTMLInputElement, hebrewInput: HTMLInputElement) {
    const english = englishInput.value;
    const hebrew = hebrewInput.value;

    if (english.trim() !== '' && hebrew.trim() !== '') {
      this.storageService.addWord(english, hebrew);
      englishInput.value = '';
      hebrewInput.value = '';
      englishInput.focus();
    } else {
      alert('היי! שכחת למלא את אחת התיבות 🖍️');
    }
  }

  onMoveToOld() {
    const confirmed = confirm('האם אתה בטוח שברצונך להעביר את כל המילים הישנות? פעולה זו תזיז את כל המילים החדשות לרשימת הישנות.');
    if (!confirmed) {
      return;
    }

    this.storageService.moveWordsToOld();
  }

  onMoveWordToOld(wordId: string) {
    const confirmed = confirm('האם אתה בטוח שברצונך להעביר מילה זו למילים שכבר נלמדו?');
    if (!confirmed) {
      return;
    }

    this.storageService.moveWordToOld(wordId);
  }

  onDeleteWord(wordId: string) {
    const confirmed = confirm('האם אתה בטוח שברצונך למחוק מילה זו? פעולה זו לא ניתנת לביטול.');
    if (!confirmed) {
      return;
    }

    this.storageService.deleteWord(wordId);
  }
}
