/**
 * Pose processor utilities for drawing overlays and handling pose results
 * Ported from FitAI project and adapted for TypeScript
 */

import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { POSE_CONNECTIONS } from '@mediapipe/pose';
import type { PoseResults } from './poseDetector';

export interface DrawInfoPanelOptions {
  ctx: CanvasRenderingContext2D;
  exerciseName: string;
  counterValue: number;
  stage: string;
  metrics?: {
    elbow?: number;
    body?: number;
    totalTime?: number;
  };
}

/**
 * Draw information panel overlay on canvas
 */
export function drawInfoPanel({
  ctx,
  exerciseName,
  counterValue,
  stage,
  metrics = {}
}: DrawInfoPanelOptions): void {
  const panelWidth = 200;
  const panelHeight = 140;
  const padding = 15;

  // Create gradient background with rounded corners
  const gradient = ctx.createLinearGradient(0, 0, panelWidth, 0);
  gradient.addColorStop(0, '#ff6600');
  gradient.addColorStop(1, '#ff8800');

  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = gradient;
  roundRect(ctx, 0, 0, panelWidth, panelHeight, 10);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Exercise name (line 1)
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px system-ui';
  ctx.textBaseline = 'top';
  ctx.fillText(exerciseName.toUpperCase(), padding, padding);

  // Stage (line 2)
  ctx.font = '600 18px system-ui';
  ctx.fillText(`Stage: ${stage || '-'}`, padding, padding + 28);

  // Time (line 3)
  ctx.font = 'bold 20px system-ui';
  const total = metrics?.totalTime ?? 0;
  ctx.fillText(`Time: ${total.toFixed(2)}s`, padding, padding + 56);

  // Count (line 4)
  ctx.font = 'bold 30px system-ui';
  ctx.fillText(`Count: ${counterValue ?? 0}`, padding, padding + 90);

  ctx.restore();
}

/**
 * Helper function to draw rounded rectangle
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw pose landmarks and connections on canvas
 */
export function drawPose(
  ctx: CanvasRenderingContext2D,
  poseLandmarks: any[]
): void {
  // Draw connections (skeleton)
  drawConnectors(ctx, poseLandmarks, POSE_CONNECTIONS, {
    color: '#00FF00',
    lineWidth: 3,
  });

  // Draw landmarks (joints)
  drawLandmarks(ctx, poseLandmarks, {
    color: '#FF0000',
    radius: 2,
  });
}

/**
 * Process pose results and draw on canvas
 */
export function processPoseResults(
  results: PoseResults,
  canvas: HTMLCanvasElement,
  counter: any,
  onMetricsUpdate?: (metrics: any) => void
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Update canvas dimensions to match video
  canvas.width = results.image.width;
  canvas.height = results.image.height;

  // Clear and draw video frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (results.poseLandmarks) {
    // Draw skeleton
    drawPose(ctx, results.poseLandmarks);

    // Update counter logic
    const [count, stage, metrics] = counter.update(results.poseLandmarks);

    // Draw overlay UI
    drawInfoPanel({
      ctx,
      exerciseName: counter.name,
      counterValue: count,
      stage,
      metrics
    });

    // Notify parent of metrics update
    if (onMetricsUpdate) {
      onMetricsUpdate({
        count,
        stage,
        time: metrics?.totalTime ?? 0,
        metrics
      });
    }
  } else {
    // No pose detected
    drawInfoPanel({
      ctx,
      exerciseName: counter.name,
      counterValue: 0,
      stage: 'no_pose'
    });

    if (onMetricsUpdate) {
      onMetricsUpdate({
        count: 0,
        stage: 'no_pose',
        time: 0
      });
    }
  }
}
