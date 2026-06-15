import { Component, inject, signal } from '@angular/core';
import { LoginComponent } from './components/login/login';
import { WordsManagerComponent } from './components/words-manager/words-manager';
import { MemoryGameComponent } from './components/memory-game/memory-game';
import { StorageService } from './services/storage';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent, WordsManagerComponent, MemoryGameComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  storageService = inject(StorageService);
  
  // משתנה שמחזיק את המסך הנוכחי (ברירת מחדל: אזור הלמידה)
  currentView = signal<'manager' | 'game'>('manager'); 
}