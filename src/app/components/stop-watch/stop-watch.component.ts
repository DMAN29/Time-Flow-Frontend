import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TimeStudyService } from '../../service/time-study.service';

@Component({
  selector: 'app-stop-watch',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './stop-watch.component.html',
  styleUrls: ['./stop-watch.component.css'],
})
export class StopWatchComponent implements OnInit {
  styleNo!: string;
  operatorId!: string;
  operatorName!: string;
  operationName!: string;
  section!: string;
  machineType!: string;
  noOfLaps: number = 10;

  time: number = 0;
  running: boolean = false;
  isPaused: boolean = false;
  intervalId: any;
  laps: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private timeStudyService: TimeStudyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.styleNo = params['styleNo'];
      this.operatorId = params['operatorId'];
      this.operatorName = params['operatorName'];
      this.operationName = params['operationName'];
      this.section = params['section'];
      this.machineType = params['machineType'];
      this.noOfLaps = +params['noOfLaps'] || 10;
    });
  }

  start(): void {
    this.running = true;
    this.isPaused = false;
    this.intervalId = setInterval(() => {
      this.time += 10;
    }, 10);
  }

  togglePauseResume(): void {
    if (this.running) {
      clearInterval(this.intervalId);
      this.running = false;
      this.isPaused = true;
    } else {
      this.running = true;
      this.isPaused = false;
      this.intervalId = setInterval(() => {
        this.time += 10;
      }, 10);
    }
  }

  flag(): void {
    if (this.laps.length < this.noOfLaps) {
      this.laps.push(this.time);

      if (this.laps.length === this.noOfLaps) {
        clearInterval(this.intervalId);
        this.running = false;
        this.isPaused = false;
      }
    }
  }

  reset(): void {
    clearInterval(this.intervalId);
    this.time = 0;
    this.running = false;
    this.isPaused = false;
    this.laps = [];
  }

  format(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${this.pad(minutes)}:${this.pad(seconds)}:${this.pad(
      milliseconds
    )}`;
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  getLapDifference(index: number): string {
    if (index === 0) return this.format(this.laps[0]);
    const diff = this.laps[index] - this.laps[index - 1];
    return this.format(diff);
  }

  getLapDifferences(): number[] {
    return this.laps.map((lap, index) =>
      index === 0 ? lap : lap - this.laps[index - 1]
    );
  }

  get showSubmitSection(): boolean {
    return this.laps.length === this.noOfLaps;
  }

  onSubmitLaps(): void {
    const payload = {
      styleNo: this.styleNo,
      operatorName: this.operatorName,
      operatorId: this.operatorId,
      operationName: this.operationName,
      section: this.section,
      machineType: this.machineType,
      lapsMS: this.getLapDifferences(),
    };

    this.timeStudyService.storeStudy(payload).subscribe({
      next: (res) => {
        console.log('✅ Study saved:', res);
        this.router.navigate(['/time-study', this.styleNo]); // 👈 navigate back
      },
      error: (err) => {
        console.error('❌ Failed to save study', err);
      },
    });
  }
}
