/**
 * MediaPipe Pose Estimator
 * Ported from FitAI project and adapted for TypeScript/React
 */

import { Pose, Results as PoseResults } from '@mediapipe/pose';

export interface PoseEstimatorOptions {
  detectionConf?: number;
  trackingConf?: number;
  modelComplexity?: 0 | 1 | 2;
}

export type { PoseResults };

export class PoseEstimator {
  private pose: Pose;
  private deviceId: string | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;

  constructor({ 
    detectionConf = 0.5, 
    trackingConf = 0.5,
    modelComplexity = 1
  }: PoseEstimatorOptions = {}) {
    this.pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    this.pose.setOptions({
      modelComplexity,
      smoothLandmarks: true,
      minDetectionConfidence: detectionConf,
      minTrackingConfidence: trackingConf,
    });
  }

  setDeviceId(id: string): void {
    this.deviceId = id;
  }

  onResults(callback: (results: PoseResults) => void): void {
    this.pose.onResults(callback);
  }

  /**
   * Start webcam mode (realtime loop)
   */
  async startWebcam(videoEl: HTMLVideoElement): Promise<void> {
    this.stop();

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        width: 640,
        height: 480,
        deviceId: this.deviceId ? { exact: this.deviceId } : undefined,
      },
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.error('Cannot access camera:', err);
      throw err;
    }

    videoEl.srcObject = this.stream;
    await new Promise<void>((resolve) => {
      videoEl.onloadedmetadata = () => resolve();
    });
    await videoEl.play();

    const loop = async (): Promise<void> => {
      await this.pose.send({ image: videoEl });
      this.rafId = requestAnimationFrame(loop);
    };
    loop();

    console.log('Webcam started & pose tracking loop running');
  }

  /**
   * Start uploaded video file mode
   */
  async startVideoFile(videoEl: HTMLVideoElement): Promise<void> {
    this.stop();

    if (!videoEl.src) {
      console.warn('No video file loaded.');
      return;
    }

    if (videoEl.readyState < 1) {
      await new Promise<void>((resolve) => {
        videoEl.onloadedmetadata = () => resolve();
      });
    }

    const loop = async (): Promise<void> => {
      if (videoEl.paused || videoEl.ended) return;
      await this.pose.send({ image: videoEl });
      this.rafId = requestAnimationFrame(loop);
    };

    const handlePlay = (): void => {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }
      loop();
    };

    const handlePause = (): void => {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    };

    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('ended', handlePause);

    await videoEl.play();
    console.log('Video playback started & tracking loop active');
  }

  /**
   * Process a single frame (for manual control)
   */
  async process(videoEl: HTMLVideoElement): Promise<void> {
    await this.pose.send({ image: videoEl });
  }

  /**
   * Stop all processing and cleanup resources
   */
  stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }
}
