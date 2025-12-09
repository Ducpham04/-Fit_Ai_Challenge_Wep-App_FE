/**
 * Enhanced AIRepCounter Component with Real API Integration
 * 
 * This is a guide for integrating real API calls into the existing AIRepCounter component.
 * 
 * Current Flow:
 * 1. User selects video file
 * 2. File is validated (type, size)
 * 3. Mock AI analysis simulates processing
 * 4. Results displayed
 * 
 * Real API Integration Flow:
 * 1. User selects video file
 * 2. File is validated
 * 3. Upload video to backend: POST /api/user/training/{trainingPlanId}/challenge/{challengeId}/submitVideo
 * 4. Backend returns submission ID and analysis status
 * 5. If status is PROCESSING, poll for results
 * 6. Display results when complete
 * 7. Update challenge status: PATCH /api/user/training/{trainingPlanId}/challenge/{challengeId}/status
 */

// STEP 1: Import the video submission service at the top of AIRepCounter.tsx
// import { 
//   submitVideoForAnalysis, 
//   pollAnalysisStatus,
//   updateChallengeStatus 
// } from '../api/videoSubmission.service';
// import { AIAnalysisResult } from './AIRepCounter';

// STEP 2: Replace the mock analysis with real API call
// In handleAnalyze function:

/*
const handleAnalyze = async () => {
  if (!selectedFile) {
    setError('Please select a video file');
    return;
  }

  setAnalyzing(true);
  setError(null);
  const startTime = Date.now();

  try {
    // Step 1: Submit video to backend
    const submissionResponse = await submitVideoForAnalysis({
      trainingPlanId: Number(trainingPlanId),
      challengeId: challengeId,
      videoFile: selectedFile,
    });

    console.log('✅ Video submitted:', submissionResponse.data.submissionId);

    // Step 2: Check if analysis is already complete
    let analysisResult = submissionResponse.data.aiAnalysis;
    
    if (submissionResponse.data.analysisStatus === 'PROCESSING') {
      console.log('⏳ Waiting for AI analysis...');
      // Step 3: Poll until analysis is complete
      analysisResult = await pollAnalysisStatus(submissionResponse.data.submissionId);
    }

    if (!analysisResult) {
      throw new Error('Failed to get AI analysis results');
    }

    const processingTimeMs = Date.now() - startTime;

    // Step 4: Format results
    const result: AIAnalysisResult = {
      correctReps: analysisResult.correctReps,
      totalReps: analysisResult.totalReps,
      accuracy: analysisResult.accuracy,
      feedback: analysisResult.feedback,
      posture: analysisResult.posture,
      formScore: analysisResult.formScore,
      isPassed: analysisResult.isPassed,
      videoUrl: preview,
      confidence: analysisResult.confidence,
      processingTime: processingTimeMs,
    };

    console.log('✅ AI Analysis Complete:', {
      correctReps: result.correctReps,
      accuracy: (result.accuracy * 100).toFixed(1) + '%',
      formScore: (result.formScore * 100).toFixed(1) + '%',
      isPassed: result.isPassed,
      processingTime: processingTimeMs + 'ms',
    });

    setResult(result);
    setProcessingTime(processingTimeMs);
    onAnalysisComplete(result);

    // Step 5: Optional - Update challenge status to COMPLETED
    try {
      await updateChallengeStatus(
        Number(trainingPlanId),
        challengeId,
        'COMPLETED'
      );
    } catch (statusError) {
      console.warn('Warning: Could not update challenge status:', statusError);
      // Don't fail the whole flow if status update fails
    }

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to analyze video';
    setError(errorMsg);
    console.error('Analysis Error:', err);
  } finally {
    setAnalyzing(false);
  }
};
*/

// STEP 3: Add upload progress tracking (optional)
// In handleAnalyze, capture progress events:
/*
const submitResponse = await submitVideoForAnalysis({
  trainingPlanId: Number(trainingPlanId),
  challengeId: challengeId,
  videoFile: selectedFile,
  onProgress: (progress) => {
    setUploadProgress(progress);
  }
});
*/

// STEP 4: Add retry logic with exponential backoff (optional)
/*
const submitWithRetry = async (
  request,
  maxRetries = 3,
  delayMs = 1000
) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await submitVideoForAnalysis(request);
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const waitTime = delayMs * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};
*/

// CURRENT MOCK STATE:
// The AIRepCounter component currently uses mock data simulation.
// To enable real API:
// 1. Uncomment the import statements above
// 2. Replace the handleAnalyze function with the real API version
// 3. Test with your backend endpoint

// TESTING CHECKLIST:
// [ ] Backend API endpoint is accessible
// [ ] JWT token is included in headers
// [ ] multipart/form-data is handled correctly
// [ ] Video file is successfully stored
// [ ] AI analysis completes and returns results
// [ ] Progress tracking updates correctly
// [ ] Error handling works for network issues
// [ ] Retry logic works for transient failures
// [ ] Results are displayed to user
// [ ] Challenge status is updated to COMPLETED

// API ENDPOINT EXPECTATIONS:
// POST /api/user/training/{trainingPlanId}/challenge/{challengeId}/submitVideo
// 
// Request:
// - Content-Type: multipart/form-data
// - Body: video file in 'video' field
// 
// Response (200 OK):
// {
//   "success": true,
//   "data": {
//     "submissionId": "sub-123",
//     "videoUrl": "s3://...",
//     "analysisStatus": "COMPLETED" | "PROCESSING",
//     "aiAnalysis": {
//       "correctReps": 15,
//       "totalReps": 15,
//       "accuracy": 0.92,
//       "feedback": "Great form!",
//       "posture": "Excellent",
//       "formScore": 0.88,
//       "isPassed": true,
//       "confidence": 0.95,
//       "processingTime": 2500
//     }
//   }
// }

export const REAL_API_INTEGRATION_GUIDE = 'See comments above';
