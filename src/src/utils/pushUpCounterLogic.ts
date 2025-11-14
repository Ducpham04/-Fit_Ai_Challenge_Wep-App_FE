/**
 * Push-up Counter (Side View with timing)
 * Ported from FitAI project and adapted for TypeScript
 * 
 * Features:
 * - Automatic left/right side selection based on visibility
 * - EMA smoothing for stable angle measurements
 * - Hysteresis: must go down deep enough then up high enough to count
 * - Only counts when body is relatively straight
 * - Tracks total time
 */

import { calculateAngle, CounterBase } from './angleUtils';

export interface PushUpMetrics {
  elbow: number;
  body: number;
  totalTime: number;
}

export class PushUpCounter extends CounterBase {
  public stage: string;
  private _elbowEMA: number | null = null;
  private _bodyEMA: number | null = null;
  private _hitBottom: boolean = false;
  private _lastRepTime: number | null = null;

  // Timing
  private startTime: number | null = null;
  public totalTime: number = 0;

  constructor() {
    super('Push-up');
    this.stage = 'up';
  }

  /**
   * Exponential Moving Average for smoothing
   */
  private _ema(prev: number | null, val: number, alpha: number = 0.35): number {
    return prev == null ? val : alpha * val + (1 - alpha) * prev;
  }

  /**
   * Normalize angle to be within 180 degrees
   */
  private _norm180(a: number): number {
    return a > 180 ? 360 - a : a;
  }

  /**
   * Main update method - processes landmarks and returns metrics
   * @param landmarks Array of pose landmarks from MediaPipe
   * @returns [counter, stage, metrics]
   */
  update(landmarks: any[]): [number, string, PushUpMetrics] {
    if (!landmarks?.length) {
      return [this.counter, 'no_pose', { elbow: 0, body: 0, totalTime: 0 }];
    }

    // Select side with higher visibility
    const LEFT = [11, 13, 15, 23, 27];  // shoulder, elbow, wrist, hip, ankle
    const RIGHT = [12, 14, 16, 24, 28];
    
    const sumVis = (ids: number[]) => 
      ids.reduce((s, i) => s + (landmarks[i]?.visibility || 0), 0);
    
    const useLeft = sumVis(LEFT) >= sumVis(RIGHT);
    const [shoulder, elbow, wrist, hip, ankle] = (useLeft ? LEFT : RIGHT).map(i => landmarks[i]);

    // Check if all required landmarks are visible
    if (![shoulder, elbow, wrist, hip, ankle].every(pt => pt && pt.visibility > 0.5)) {
      return [this.counter, 'no_pose', { elbow: 0, body: 0, totalTime: this.totalTime }];
    }

    // Update total time
    if (!this.startTime) {
      this.startTime = performance.now();
    }
    this.totalTime = (performance.now() - this.startTime) / 1000;

    // Calculate angles (normalized and smoothed)
    const elbowAngle = this._norm180(
      calculateAngle(
        [shoulder.x, shoulder.y],
        [elbow.x, elbow.y],
        [wrist.x, wrist.y]
      )
    );

    const bodyAngle = this._norm180(
      calculateAngle(
        [shoulder.x, shoulder.y],
        [hip.x, hip.y],
        [ankle.x, ankle.y]
      )
    );

    // Apply EMA smoothing
    const e = this._elbowEMA = this._ema(this._elbowEMA, elbowAngle);
    const b = this._bodyEMA = this._ema(this._bodyEMA, bodyAngle);

    // Threshold logic
    const UP_ELBOW = 155;     // arm nearly extended
    const DOWN_ELBOW = 95;    // arm bent deep
    const BODY_OK = 150;      // body sufficiently straight
    const MIN_GAP = 0.45;     // seconds between reps
    const now = performance.now() / 1000;
    const goodForm = b >= BODY_OK;

    // Counting logic
    if (e < DOWN_ELBOW && goodForm) {
      this._hitBottom = true;
      this.stage = 'down';
    }

    if (this._hitBottom && e > UP_ELBOW && goodForm) {
      if (!this._lastRepTime || now - this._lastRepTime > MIN_GAP) {
        this.counter += 1;
        this._lastRepTime = now;
        this._hitBottom = false;
      }
      this.stage = 'up';
    }

    // Return results
    const metrics: PushUpMetrics = {
      elbow: Math.round(e),
      body: Math.round(b),
      totalTime: parseFloat(this.totalTime.toFixed(2))
    };

    return [this.counter, this.stage, metrics];
  }

  /**
   * Reset counter to initial state
   */
  reset(): void {
    this.counter = 0;
    this.stage = 'up';
    this._elbowEMA = null;
    this._bodyEMA = null;
    this._hitBottom = false;
    this._lastRepTime = null;
    this.startTime = null;
    this.totalTime = 0;
  }
}
