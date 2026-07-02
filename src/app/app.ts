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
  private audioCtx: AudioContext | null = null;

  // Persistence Load Helpers
  private getSavedMode(): 'beginner' | 'professional' {
    try {
      const saved = localStorage.getItem('angular_app_mode');
      return (saved === 'beginner' || saved === 'professional') ? saved : 'beginner';
    } catch {
      return 'beginner';
    }
  }

  private getSavedCounter(): number {
    try {
      const saved = localStorage.getItem('angular_app_counter');
      return saved !== null ? Number(saved) : 10;
    } catch {
      return 10;
    }
  }

  private getSavedTodoList(): TodoTask[] {
    try {
      const saved = localStorage.getItem('angular_app_todo');
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch {}
    return [
      { id: 1, text: 'Learn basic HTML and CSS tags', completed: true },
      { id: 2, text: 'Click buttons to increment things', completed: false },
      { id: 3, text: 'Build a premium ultra-responsive web application', completed: false }
    ];
  }

  private getSavedMuted(): boolean {
    try {
      const saved = localStorage.getItem('angular_app_muted');
      return saved === 'true';
    } catch {
      return false;
    }
  }

  // Application State Signals
  public mode = signal<'beginner' | 'professional'>(this.getSavedMode());
  public counter = signal(this.getSavedCounter());
  public todoList = signal<TodoTask[]>(this.getSavedTodoList());
  public audioMuted = signal<boolean>(this.getSavedMuted());
  public newTaskText = signal('');

  // Live local time display (updates every second)
  public currentTime = signal(new Date().toLocaleString());
  private _timeIntervalId: any = null;

  // Task list computations
  public completedCount = computed(() => this.todoList().filter(t => t.completed).length);
  public totalCount = computed(() => this.todoList().length);
  public completionPercentage = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });
  
  // All tasks completed checker
  public allTasksCompleted = computed(() => {
    const list = this.todoList();
    return list.length > 0 && list.every(t => t.completed);
  });

  constructor() {
    this._timeIntervalId = setInterval(() => {
      this.currentTime.set(new Date().toLocaleString());
    }, 1000);

    // Ensure interval cleared on unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => clearInterval(this._timeIntervalId));
    }
  }

  // Simple Form State
  public formName = signal('');
  public formEmail = signal('');
  public formRating = signal(5);
  public formFeedback = signal('');
  public isSubmitted = signal(false);

  // Persistence Save Helpers
  private saveState() {
    try {
      localStorage.setItem('angular_app_mode', this.mode());
      localStorage.setItem('angular_app_counter', String(this.counter()));
      localStorage.setItem('angular_app_todo', JSON.stringify(this.todoList()));
      localStorage.setItem('angular_app_muted', String(this.audioMuted()));
    } catch (e) {
      console.warn('Could not write to localStorage:', e);
    }
  }

  // Audio Synthesis Engine
  private playSound(type: 'click' | 'success' | 'retro-click' | 'retro-success') {
    if (this.audioMuted()) return;

    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'retro-click') {
        // High-pitched retro square wave beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
        
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'click') {
        // Modern soft click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'retro-success') {
        // Retro 8-bit win fanfare (arpeggio)
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          
          const time = now + index * 0.08;
          gain.gain.setValueAtTime(0.03, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(time);
          osc.stop(time + 0.16);
        });
      } else if (type === 'success') {
        // Gorgeous modern layout completion chime
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + index * 0.06);
          
          const time = now + index * 0.06;
          gain.gain.setValueAtTime(0.025, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(time);
          osc.stop(time + 0.35);
        });
      }
    } catch (e) {
      console.warn('Audio Context failed to play:', e);
    }
  }

  // Audio Toggle Mute
  public toggleMute() {
    this.audioMuted.set(!this.audioMuted());
    this.saveState();
    
    // Play chirp on unmute to verify
    if (!this.audioMuted()) {
      setTimeout(() => {
        this.playSound(this.mode() === 'beginner' ? 'retro-click' : 'click');
      }, 50);
    }
  }

  // Toggle App Mode
  public toggleMode() {
    if (this.mode() === 'beginner') {
      this.mode.set('professional');
      this.playSound('click');
    } else {
      this.mode.set('beginner');
      this.playSound('retro-click');
    }
    this.saveState();
  }

  // Counter Methods
  public increment() {
    this.counter.update(val => val + 1);
    this.playSound(this.mode() === 'beginner' ? 'retro-click' : 'click');
    this.saveState();
  }

  public decrement() {
    this.counter.update(val => val - 1);
    this.playSound(this.mode() === 'beginner' ? 'retro-click' : 'click');
    this.saveState();
  }

  public resetCounter() {
    this.counter.set(10);
    this.playSound(this.mode() === 'beginner' ? 'retro-click' : 'click');
    this.saveState();
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
    this.playSound(this.mode() === 'beginner' ? 'retro-click' : 'click');
    this.saveState();
  }

  public toggleTask(id: number) {
    let playedCompletionEffect = false;
    
    this.todoList.update(tasks => {
      const updated = tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
      
      // Check if this action results in 100% completion
      const completedAll = updated.length > 0 && updated.every(t => t.completed);
      
      // If completed all and we transitioned to completed, play the chime
      const wasCompleted = tasks.find(t => t.id === id)?.completed;
      if (completedAll && !wasCompleted) {
        playedCompletionEffect = true;
      }
      
      return updated;
    });

    if (playedCompletionEffect) {
      this.playSound(this.mode() === 'beginner' ? 'retro-success' : 'success');
    } else {
      this.playSound(this.mode() === 'beginner' ? 'retro-click' : 'click');
    }
    this.saveState();
  }

  public deleteTask(id: number) {
    this.todoList.update(tasks => tasks.filter(t => t.id !== id));
    this.playSound(this.mode() === 'beginner' ? 'retro-click' : 'click');
    this.saveState();
  }

  // Form Methods
  public submitForm() {
    if (this.formName().trim() && this.formEmail().trim()) {
      this.isSubmitted.set(true);
      this.playSound(this.mode() === 'beginner' ? 'retro-success' : 'success');
    }
  }

  public resetForm() {
    this.formName.set('');
    this.formEmail.set('');
    this.formRating.set(5);
    this.formFeedback.set('');
    this.isSubmitted.set(false);
    this.playSound(this.mode() === 'beginner' ? 'retro-click' : 'click');
  }
}
