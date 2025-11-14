import { useEffect, useRef } from 'react';
import { Pose } from '../../hooks/usePushUpCounter';

interface PoseOverlayProps {
  pose: Pose | null;
  videoWidth: number;
  videoHeight: number;
  className?: string;
}

// MoveNet keypoint connections for drawing skeleton
const POSE_CONNECTIONS = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

const MIN_CONFIDENCE = 0.3;

export const PoseOverlay = ({
  pose,
  videoWidth,
  videoHeight,
  className = '',
}: PoseOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (!pose || !pose.keypoints || pose.keypoints.length === 0) {
      return;
    }

    // Draw skeleton connections
    ctx.strokeStyle = '#22d3ee'; // sky-400
    ctx.lineWidth = 3;

    POSE_CONNECTIONS.forEach(([start, end]) => {
      const startPoint = pose.keypoints.find((kp) => kp.name === start);
      const endPoint = pose.keypoints.find((kp) => kp.name === end);

      if (
        startPoint &&
        endPoint &&
        (startPoint.score ?? 1) > MIN_CONFIDENCE &&
        (endPoint.score ?? 1) > MIN_CONFIDENCE
      ) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    });

    // Draw keypoints
    pose.keypoints.forEach((keypoint) => {
      if ((keypoint.score ?? 1) > MIN_CONFIDENCE) {
        // Draw outer circle (glow)
        ctx.fillStyle = 'rgba(34, 211, 238, 0.3)'; // sky-400 with opacity
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 8, 0, 2 * Math.PI);
        ctx.fill();

        // Draw inner circle
        ctx.fillStyle = '#06b6d4'; // sky-500
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [pose, videoWidth, videoHeight]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
