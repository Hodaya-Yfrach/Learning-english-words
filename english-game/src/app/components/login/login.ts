import { Component, inject, signal } from '@angular/core';
import { StorageService } from '../../services/storage';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  storageService = inject(StorageService);
  
  // ניהול הודעות שגיאה
  errorMessage = signal<string>('');

  onLogin(name: string, idNumber: string) {
    this.errorMessage.set(''); // איפוס שגיאות
    const cleanName = name.trim();
    const cleanId = idNumber.trim();

    if (!this.isValidName(cleanName)) {
      this.errorMessage.set('אופס! 🙈 השם חייב להיות רק באנגלית ועד 15 אותיות (אנחנו הרי לומדים אנגלית, לא?)');
      return;
    }

    if (!this.isValidId(cleanId)) {
      this.errorMessage.set('הממ... 🤔 תעודת הזהות הזו לא נראית תקינה. בטוח שהקלדת נכון?');
      return;
    }

    // הכל תקין - מתחברים!
    this.storageService.login(cleanName, cleanId);
  }

  // בדיקת שם (רק אותיות באנגלית ורווחים, 2-15 תווים)
  private isValidName(name: string): boolean {
    const nameRegex = /^[A-Za-z\s]{2,15}$/;
    return nameRegex.test(name);
  }

  // בדיקת תקינות תעודת זהות ישראלית אמיתית
  private isValidId(id: string): boolean {
    if (id.length > 9 || id.length < 5 || isNaN(Number(id))) return false;
    const paddedId = id.padStart(9, '0');
    const sum = Array.from(paddedId, Number).reduce((counter, digit, i) => {
      const step = digit * ((i % 2) + 1);
      return counter + (step > 9 ? step - 9 : step);
    }, 0);
    return sum % 10 === 0;
  }
}