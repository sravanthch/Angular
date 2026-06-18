import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface TodoTask {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Application Mode
  public mode = signal<'beginner' | 'professional'>('beginner');

  // 1. Counter State
  public counter = signal(10);

  // 2. Task List State
  public newTaskText = signal('');
  public todoList = signal<TodoTask[]>([
    { id: 1, text: 'Learn basic HTML and CSS tags', completed: true },
    { id: 2, text: 'Click buttons to increment things', completed: false },
    { id: 3, text: 'Build a premium ultra-responsive web application', completed: false }
  ]);

  // Task list computations
  public completedCount = computed(() => this.todoList().filter(t => t.completed).length);
  public totalCount = computed(() => this.todoList().length);
  public completionPercentage = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  // 3. Simple Form State
  public formName = signal('');
  public formEmail = signal('');
  public formRating = signal(5);
  public formFeedback = signal('');
  public isSubmitted = signal(false);

  // Toggle App Mode
  public toggleMode() {
    if (this.mode() === 'beginner') {
      this.mode.set('professional');
    } else {
      this.mode.set('beginner');
    }
  }

  // Counter Methods
  public increment() {
    this.counter.update(val => val + 1);
  }

  public decrement() {
    this.counter.update(val => val - 1);
  }

  public resetCounter() {
    this.counter.set(10);
  }

  // Task List Methods
  public addTask() {
    const text = this.newTaskText().trim();
    if (!text) return;
    
    const newTask: TodoTask = {
      id: Date.now(),
      text,
      completed: false
    };

    this.todoList.update(tasks => [...tasks, newTask]);
    this.newTaskText.set('');
  }

  public toggleTask(id: number) {
    this.todoList.update(tasks =>
      tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  public deleteTask(id: number) {
    this.todoList.update(tasks => tasks.filter(t => t.id !== id));
  }

  // Form Methods
  public submitForm() {
    if (this.formName().trim() && this.formEmail().trim()) {
      this.isSubmitted.set(true);
    }
  }

  public resetForm() {
    this.formName.set('');
    this.formEmail.set('');
    this.formRating.set(5);
    this.formFeedback.set('');
    this.isSubmitted.set(false);
  }
}
