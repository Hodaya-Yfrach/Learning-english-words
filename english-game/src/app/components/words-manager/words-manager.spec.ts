import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordsManager } from './words-manager';

describe('WordsManager', () => {
  let component: WordsManager;
  let fixture: ComponentFixture<WordsManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordsManager],
    }).compileComponents();

    fixture = TestBed.createComponent(WordsManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
