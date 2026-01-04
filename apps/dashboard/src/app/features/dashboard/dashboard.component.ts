
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskBoardComponent } from './task-board/task-board.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, TaskBoardComponent],
    template: `
    <div class="px-4 py-6 sm:px-0">
      <app-task-board></app-task-board>
    </div>
  `
})
export class DashboardComponent { }
