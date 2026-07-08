import { Component, inject, computed } from '@angular/core';
import { StorageService } from '../../services/storage';

@Component({
  selector: 'app-stats-dashboard',
  standalone: true,
  template: `
    <section class="stats-dashboard">
      <div class="dashboard-header">
        <div>
          <h3>סטטיסטיקת משתמש</h3>
          <p>שיא אישי: <strong>{{ highScore() }}</strong></p>
          <p>ממוצע 10 אחרונים: <strong>{{ average() }}</strong></p>
        </div>
        <div class="score-chip">נקודות: <span>{{ storageService.points() }}</span></div>
      </div>

      <div class="score-chart">
        @if (lastScores().length === 0) {
          <p class="empty-state">אין עדיין היסטוריית ציון לשחק.</p>
        } @else {
          <div class="chart-bars">
            @for (score of lastScores(); track score) {
              <div class="bar" style="height: calc(20px + (score * 1.4px));">
                <span>{{ score }}</span>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `.stats-dashboard { background: linear-gradient(145deg, #111111 0%, #161a1f 100%); border: 2px solid #00b4a6; border-radius: 24px; padding: 24px; margin-bottom: 24px; color: #f1f1f1; box-shadow: 0 24px 60px rgba(0,0,0,0.15); }
    .dashboard-header { display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 18px; flex-wrap: wrap; }
    .dashboard-header h3 { margin: 0; font-size: 22px; color: #00d8c8; }
    .dashboard-header p { margin: 6px 0; color: #cbd5d9; }
    .score-chip { background: rgba(0,180,166,0.15); border: 1px solid rgba(0,180,166,0.35); border-radius: 18px; padding: 12px 18px; font-weight: 900; color: #fff; }
    .score-chip span { color: #ffea00; }
    .score-chart { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 18px; }
    .chart-labels { display: flex; justify-content: space-between; color: #748096; font-size: 12px; margin-bottom: 12px; }
    .chart-bars { display: flex; align-items: flex-end; gap: 12px; }
    .bar { width: 28px; background: linear-gradient(180deg, #00d8c8, #007f72); border-radius: 14px 14px 4px 4px; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 8px; position: relative; }
    .bar span { color: #fff; font-size: 12px; font-weight: 800; transform: translateY(4px); }
    .empty-state { text-align: center; color: #9fa8b9; font-weight: 700; padding: 28px 0; }`
  ]
})
export class StatsDashboardComponent {
  storageService = inject(StorageService);

  scores = computed(() => this.storageService.scores());
  lastScores = computed(() => this.scores().slice(-10));
  chartData = computed(() => {
    const scores = this.lastScores();
    const maxScore = Math.max(100, ...scores);
    return scores.map((score, index) => {
      const previous = index > 0 ? scores[index - 1] : null;
      const height = Math.round((score / maxScore) * 180 + 20);
      return {
        score,
        label: `#${scores.length - index}`,
        trend: previous === null ? 'equal' : score > previous ? 'up' : score < previous ? 'down' : 'equal',
        change: previous === null ? 0 : score - previous,
        height
      };
    });
  });
  average = computed(() => {
    const scores = this.lastScores();
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  });
  highScore = computed(() => {
    const scores = this.scores();
    return scores.length ? Math.max(...scores) : 0;
  });
}
