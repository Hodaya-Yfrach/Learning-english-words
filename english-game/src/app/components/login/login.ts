import { Component, inject } from '@angular/core';
import { StorageService } from '../../services/storage';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // חיבור השירות שיצרנו קודם אל הקומפוננטה
  storageService = inject(StorageService);

  // פונקציה שמופעלת בעת לחיצה על כפתור ההתחברות
  onLogin(name: string, idNumber: string) {
    if (name.trim() !== '' && idNumber.trim() !== '') {
      this.storageService.login(name, idNumber);
    } else {
      alert('אנא הזן שם ותעודת זהות תקינים כדי להתחיל!');
    }
  }
}