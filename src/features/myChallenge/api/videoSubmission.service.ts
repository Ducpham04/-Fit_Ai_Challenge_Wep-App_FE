/**
 * Video Submission Service
 * Handles video upload and AI analysis submission to backend
 */

import apiClient from '@/api/client';

export interface VideoSubmissionRequest {
  trainingPlanId: number;
  challengeId: number;
  videoFile: File;
}

export interface VideoSubmissionResponse {
  success: boolean;
  data: {
    submissionId: string;
    videoUrl: string;
    analysisStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    aiAnalysis?: {
      correctReps: number;
      totalReps: number;
      accuracy: number;
      feedback: string;
      posture: string;
      formScore: number;
      isPassed: boolean;
      confidence?: number;
      processingTime?: number;
    };
    message: string;
  };
}

/**
 * Submit video for AI analysis
 * 
 * Real API Implementation:
 * POST /api/user/training/{trainingPlanId}/challenge/{challengeId}/submitVideo
 * 
 * Expected Response:
 * {
 *   "success": true,
 *   "data": {
 *     "submissionId": "sub-123",
 *     "videoUrl": "s3://bucket/video.mp4",
 *     "analysisStatus": "PROCESSING",
 *     "aiAnalysis": {
 *       "correctReps": 15,
 *       "totalReps": 15,
 *       "accuracy": 0.92,
 *       "feedback": "Great form!",
 *       "posture": "Excellent",
 *       "formScore": 0.88,
 *       "isPassed": true,
 *       "confidence": 0.95,
 *       "processingTime": 2500
 *     },
 *     "message": "Video submitted successfully"
 *   }
 * }
 */
export const submitVideoForAnalysis = async (
  request: VideoSubmissionRequest
): Promise<VideoSubmissionResponse> => {
  const { trainingPlanId, challengeId, videoFile } = request;

  // Create FormData for file upload
  const formData = new FormData();
  formData.append('video', videoFile);
  
  // Optional: Add metadata
  formData.append('fileName', videoFile.name);
  formData.append('fileSize', videoFile.size.toString());
  formData.append('fileType', videoFile.type);

  try {
    console.log('🎬 Submitting video for AI analysis:');
    console.log('   Training Plan ID:', trainingPlanId);
    console.log('   Challenge ID:', challengeId);
    console.log('   File:', videoFile.name);
    console.log('   File Size:', (videoFile.size / 1024 / 1024).toFixed(2), 'MB');

    const response = await apiClient.post<VideoSubmissionResponse>(
      `/api/user/training/${trainingPlanId}/challenge/${challengeId}/submitVideo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for video upload
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log('   Upload Progress:', percentCompleted + '%');
        },
      }
    );

    console.log('✅ Video submission response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Video submission error:', error);
    throw error;
  }
};

/**
 * Poll for AI analysis completion
 * Use this if the backend returns PROCESSING status
 */
export const pollAnalysisStatus = async (
  submissionId: string,
  maxAttempts: number = 30,
  delayMs: number = 1000
): Promise<VideoSubmissionResponse['data']['aiAnalysis']> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Wait before checking
      await new Promise(resolve => setTimeout(resolve, delayMs));

      const response = await apiClient.get<VideoSubmissionResponse>(
        `/api/user/training/submission/${submissionId}/status`
      );

      const { analysisStatus, aiAnalysis } = response.data.data;

      if (analysisStatus === 'COMPLETED' && aiAnalysis) {
        console.log('✅ Analysis completed after', attempt + 1, 'attempts');
        return aiAnalysis;
      }

      if (analysisStatus === 'FAILED') {
        throw new Error('AI analysis failed on backend');
      }

      console.log(`⏳ Polling for analysis... (${attempt + 1}/${maxAttempts})`);
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw new Error('Analysis timeout - no response after ' + maxAttempts + ' attempts');
};

/**
 * Update challenge status after successful submission
 */
export const updateChallengeStatus = async (
  trainingPlanId: number,
  challengeId: number,
  status: 'COMPLETED' | 'ACTIVE' | 'INACTIVE'
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.patch(
      `/api/user/training/${trainingPlanId}/challenge/${challengeId}/status`,
      { status }
    );

    console.log('✅ Challenge status updated:', status);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update challenge status:', error);
    throw error;
  }
};

/**
 * Get previous submissions for a challenge
 */
export const getChallengeSubmissions = async (
  trainingPlanId: number,
  challengeId: number
): Promise<any[]> => {
  try {
    const response = await apiClient.get(
      `/api/user/training/${trainingPlanId}/challenge/${challengeId}/submissions`
    );

    return response.data.data || [];
  } catch (error) {
    console.error('❌ Failed to fetch submissions:', error);
    return [];
  }
};
