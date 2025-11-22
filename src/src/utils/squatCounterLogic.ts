/**
 * Squat Counter (Front View with timing)
 * Ported from FitAI project and adapted for TypeScript
 * 
 * Features:
 * - Based on average knee angle of both legs: (23-25-27) and (24-26-28)
 * - Hysteresis: must stand up straight before counting squat down
 * - Tracks total time
 * - Validates both legs are visible
 */

import { calculateAngle, CounterBase } from './angleUtils';

export interface SquatMetrics {
  angle: number;
  totalTime: number;
}

export class SquatCounter extends CounterBase {
  public stage: string;

  // Timing
  private startTime: number | null = null;
  public totalTime: number = 0;

  constructor() {
    super('Squat');
    this.stage = 'up';
  }

  /**
   * Main update method - processes landmarks and returns metrics
   * @param landmarks Array of pose landmarks from MediaPipe
   * @returns [counter, stage, metrics]
   */
  update(landmarks: any[]): [number, string, SquatMetrics] {
    if (!landmarks || landmarks.length === 0) {
      return [this.counter, 'no_pose', { angle: 0, totalTime: 0 }];
    }

    // Update total time
    if (!this.startTime) {
      this.startTime = performance.now();
    }
    this.totalTime = (performance.now() - this.startTime) / 1000;

    // Get landmarks for both legs
    const l_hip = landmarks[23];
    const l_knee = landmarks[25];
    const l_ankle = landmarks[27];
    const r_hip = landmarks[24];
    const r_knee = landmarks[26];
    const r_ankle = landmarks[28];

    // Check visibility
    const leftValid = [l_hip, l_knee, l_ankle].every(pt => pt && pt.visibility > 0.5);
    const rightValid = [r_hip, r_knee, r_ankle].every(pt => pt && pt.visibility > 0.5);

    if (!leftValid && !rightValid) {
      return [this.counter, 'no_pose', { angle: 0, totalTime: this.totalTime }];
    }

    // Calculate knee angles for both sides
    const lAngle = calculateAngle(
      [l_hip.x, l_hip.y],
      [l_knee.x, l_knee.y],
      [l_ankle.x, l_ankle.y]
    );

    const rAngle = calculateAngle(
      [r_hip.x, r_hip.y],
      [r_knee.x, r_knee.y],
      [r_ankle.x, r_ankle.y]
    );

    // Average angle of both knees
    const avgAngle = (lAngle + rAngle) / 2;

    // Counting logic (hysteresis)
    if (avgAngle > 150) {
      // Standing up straight
      this.stage = 'up';
    } else if (avgAngle < 120 && this.stage === 'up') {
      // Squatting down deep enough after standing
      this.stage = 'down';
      this.counter += 1;
    }

    // Return results
    const metrics: SquatMetrics = {
      angle: Math.round(avgAngle),
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
    this.startTime = null;
    this.totalTime = 0;
  }
}
