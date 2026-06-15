
// src/app/models.ts

export interface User {
  name: string;
  idNumber: string;
}

export interface Word {
  id: string;
  english: string;
  hebrew: string;
  status: 'new' | 'old';
}