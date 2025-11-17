/**
 * Angle calculation utilities for pose estimation
 * Ported from FitAI project
 */

/**
 * Calculate the angle at point b between three points a, b, c
 * Each point is an array [x, y]
 * @param a First point [x, y]
 * @param b Middle point [x, y] - the angle is calculated at this point
 * @param c Third point [x, y]
 * @returns Angle in degrees
 */
export function calculateAngle(a: [number, number], b: [number, number], c: [number, number]): number {
  const radians =
    Math.atan2(c[1] - b[1], c[0] - b[0]) -
    Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

/**
 * Base class for exercise counters (Squat, Push-up, etc.)
 */
export abstract class CounterBase {
  public name: string;
  public counter: number;
  public stage: string | null;

  constructor(name: string) {
    this.name = name;
    this.counter = 0;
    this.stage = null;
  }

  /**
   * Update counter logic - must be overridden by subclasses
   * @param landmarks Array of pose landmarks from MediaPipe
   * @returns Tuple of [counter, stage, metrics]
   */
  abstract update(landmarks: any[]): [number, string, any];
}
