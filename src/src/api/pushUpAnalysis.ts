import apiClient from './client';

/**
 * Push-up Analysis API Types
 */

export interface PushUpAnalysisRequest {
  video: File;
  targetReps?: number;
  userId?: string;
  challengeId?: string;
}

export interface PushUpAnalysisResult {
  success: boolean;
  data: {
    totalReps: number;
    duration: number; // seconds
    averageRepSpeed: number; // reps per minute
    formScore: number; // 0-100
    repDetails: RepDetail[];
    qualityMetrics: QualityMetrics;
    videoMetadata: VideoMetadata;
  };
  message?: string;
  analysisId?: string;
  timestamp: string;
}

export interface RepDetail {
  repNumber: number;
  duration: number; // milliseconds
  formScore: number; // 0-100
  startTime: number; // seconds in video
  endTime: number; // seconds in video
  issues?: string[]; // e.g., ["elbows flaring", "hips sagging"]
}

export interface QualityMetrics {
  overallForm: number; // 0-100
  consistency: number; // 0-100
  rangeOfMotion: number; // 0-100
  bodyAlignment: number; // 0-100
  tempo: number; // 0-100
}

export interface VideoMetadata {
  fileName: string;
  fileSize: number; // bytes
  duration: number; // seconds
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
  uploadedAt: string;
}

export interface AnalysisProgress {
  status: 'uploading' | 'processing' | 'analyzing' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  estimatedTimeRemaining?: number; // seconds
}

/**
 * Upload video and request push-up analysis
 */
export const uploadVideoForAnalysis = async (
  request: PushUpAnalysisRequest,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<PushUpAnalysisResult> => {
  const formData = new FormData();
  formData.append('video', request.video);
  
  if (request.targetReps) {
    formData.append('targetReps', request.targetReps.toString());
  }
  
  if (request.userId) {
    formData.append('userId', request.userId);
  }
  
  if (request.challengeId) {
    formData.append('challengeId', request.challengeId);
  }

  try {
    // Report upload start
    onProgress?.({
      status: 'uploading',
      progress: 0,
      message: 'Uploading video...',
    });

    const response = await apiClient.post<PushUpAnalysisResult>(
      '/analysis/pushup',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes for large videos
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress?.({
              status: 'uploading',
              progress: percentCompleted,
              message: `Uploading video... ${percentCompleted}%`,
            });
          }
        },
      }
    );

    // Report processing
    onProgress?.({
      status: 'completed',
      progress: 100,
      message: 'Analysis completed!',
    });

    return response.data;
  } catch (error: any) {
    onProgress?.({
      status: 'failed',
      progress: 0,
      message: error.response?.data?.message || 'Analysis failed',
    });
    throw error;
  }
};

/**
 * Poll for analysis status (for async processing)
 */
export const getAnalysisStatus = async (
  analysisId: string
): Promise<AnalysisProgress> => {
  const response = await apiClient.get<AnalysisProgress>(
    `/analysis/pushup/${analysisId}/status`
  );
  return response.data;
};

/**
 * Get completed analysis results
 */
export const getAnalysisResult = async (
  analysisId: string
): Promise<PushUpAnalysisResult> => {
  const response = await apiClient.get<PushUpAnalysisResult>(
    `/analysis/pushup/${analysisId}`
  );
  return response.data;
};

/**
 * Get user's analysis history
 */
export const getAnalysisHistory = async (
  userId: string,
  limit: number = 10
): Promise<PushUpAnalysisResult[]> => {
  const response = await apiClient.get<PushUpAnalysisResult[]>(
    `/analysis/pushup/history/${userId}`,
    { params: { limit } }
  );
  return response.data;
};

/**
 * Delete an analysis
 */
export const deleteAnalysis = async (analysisId: string): Promise<void> => {
  await apiClient.delete(`/analysis/pushup/${analysisId}`);
};

/**
 * Compare two analyses
 */
export interface ComparisonResult {
  analysis1: PushUpAnalysisResult;
  analysis2: PushUpAnalysisResult;
  improvements: {
    reps: number;
    formScore: number;
    averageRepSpeed: number;
    consistency: number;
  };
  insights: string[];
}

export const compareAnalyses = async (
  analysisId1: string,
  analysisId2: string
): Promise<ComparisonResult> => {
  const response = await apiClient.post<ComparisonResult>(
    '/analysis/pushup/compare',
    {
      analysisId1,
      analysisId2,
    }
  );
  return response.data;
};
