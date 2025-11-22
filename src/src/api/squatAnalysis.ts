/**
 * Squat Analysis API Client
 * Backend integration for AI-powered squat analysis
 */

import apiClient from './client';

// ===== Types & Interfaces =====

export interface SquatAnalysisRequest {
  video: File;
  targetReps: number;
}

export interface RepDetail {
  repNumber: number;
  duration: number;
  quality: number;
  depthAchieved: number; // knee angle (degrees)
  timestamp: number;
}

export interface QualityMetrics {
  overallForm: number; // 0-100
  consistency: number; // 0-100
  depthOfSquat: number; // 0-100
  kneeAlignment: number; // 0-100
  tempo: number; // 0-100
}

export interface VideoMetadata {
  filename: string;
  size: number;
  duration: number;
  resolution: string;
  frameRate: number;
}

export interface SquatAnalysisResult {
  success: boolean;
  data: {
    totalReps: number;
    duration: number;
    averageRepSpeed: number;
    formScore: number;
    repDetails: RepDetail[];
    qualityMetrics: QualityMetrics;
    videoMetadata: VideoMetadata;
  };
  analysisId: string;
  timestamp: string;
}

export interface AnalysisProgress {
  status: 'uploading' | 'processing' | 'analyzing' | 'complete';
  progress: number; // 0-100
  message?: string;
}

// ===== API Functions =====

/**
 * Upload video for squat analysis
 * @param request Contains video file and target reps
 * @param onProgress Optional callback for tracking upload/analysis progress
 * @returns Analysis result with detailed metrics
 */
export const uploadVideoForSquatAnalysis = async (
  request: SquatAnalysisRequest,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<SquatAnalysisResult> => {
  const formData = new FormData();
  formData.append('video', request.video);
  formData.append('targetReps', request.targetReps.toString());

  try {
    const response = await apiClient.post<SquatAnalysisResult>(
      '/analysis/squat',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress({
              status: 'uploading',
              progress: percentCompleted,
              message: `Uploading video: ${percentCompleted}%`,
            });
          }
        },
      }
    );

    // Simulate processing progress (in real app, this would be websocket or polling)
    if (onProgress) {
      onProgress({
        status: 'complete',
        progress: 100,
        message: 'Analysis complete!',
      });
    }

    return response.data;
  } catch (error: any) {
    console.error('Squat analysis upload failed:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Failed to upload video for analysis'
    );
  }
};

/**
 * Get status of an ongoing analysis
 * @param analysisId The unique analysis identifier
 * @returns Current analysis progress
 */
export const getSquatAnalysisStatus = async (
  analysisId: string
): Promise<AnalysisProgress> => {
  try {
    const response = await apiClient.get<AnalysisProgress>(
      `/analysis/squat/${analysisId}/status`
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to get analysis status:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to retrieve analysis status'
    );
  }
};

/**
 * Get completed analysis result
 * @param analysisId The unique analysis identifier
 * @returns Full analysis result
 */
export const getSquatAnalysisResult = async (
  analysisId: string
): Promise<SquatAnalysisResult> => {
  try {
    const response = await apiClient.get<SquatAnalysisResult>(
      `/analysis/squat/${analysisId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to get analysis result:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to retrieve analysis result'
    );
  }
};

/**
 * Get analysis history for current user
 * @param limit Maximum number of results to return
 * @returns Array of past analyses
 */
export const getSquatAnalysisHistory = async (
  limit: number = 10
): Promise<SquatAnalysisResult[]> => {
  try {
    const response = await apiClient.get<{ data: SquatAnalysisResult[] }>(
      '/analysis/squat/history',
      { params: { limit } }
    );
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to get analysis history:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to retrieve analysis history'
    );
  }
};

/**
 * Compare two analyses
 * @param analysisId1 First analysis ID
 * @param analysisId2 Second analysis ID
 * @returns Comparison data
 */
export const compareSquatAnalyses = async (
  analysisId1: string,
  analysisId2: string
): Promise<any> => {
  try {
    const response = await apiClient.get(
      '/analysis/squat/compare',
      { params: { id1: analysisId1, id2: analysisId2 } }
    );
    return response.data;
  } catch (error: any) {
    console.error('Failed to compare analyses:', error);
    throw new Error(
      error.response?.data?.message || 
      'Failed to compare analyses'
    );
  }
};
