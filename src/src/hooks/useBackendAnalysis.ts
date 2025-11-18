import { useState, useCallback } from 'react';
import {
  uploadVideoForAnalysis,
  getAnalysisStatus,
  getAnalysisResult,
  PushUpAnalysisRequest,
  PushUpAnalysisResult,
  AnalysisProgress,
} from '../api/pushUpAnalysis';

interface UseBackendAnalysisReturn {
  analyzeVideo: (video: File, targetReps?: number) => Promise<void>;
  progress: AnalysisProgress | null;
  result: PushUpAnalysisResult | null;
  error: string | null;
  isAnalyzing: boolean;
  reset: () => void;
}

/**
 * Hook for backend push-up analysis
 * Handles video upload, progress tracking, and result retrieval
 */
export const useBackendAnalysis = (): UseBackendAnalysisReturn => {
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [result, setResult] = useState<PushUpAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeVideo = useCallback(
    async (video: File, targetReps: number = 10) => {
      setIsAnalyzing(true);
      setError(null);
      setProgress({
        status: 'uploading',
        progress: 0,
        message: 'Preparing to upload...',
      });

      try {
        const request: PushUpAnalysisRequest = {
          video,
          targetReps,
        };

        // Upload video and get analysis
        const analysisResult = await uploadVideoForAnalysis(
          request,
          (progressUpdate) => {
            setProgress(progressUpdate);
          }
        );

        // If backend returns analysis ID for async processing
        if (analysisResult.analysisId && analysisResult.data.totalReps === 0) {
          // Poll for results
          await pollForResults(analysisResult.analysisId);
        } else {
          // Immediate results
          setResult(analysisResult);
          setProgress({
            status: 'completed',
            progress: 100,
            message: 'Analysis completed successfully!',
          });
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to analyze video';
        setError(errorMessage);
        setProgress({
          status: 'failed',
          progress: 0,
          message: errorMessage,
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  const pollForResults = async (analysisId: string) => {
    const maxAttempts = 60; // 5 minutes (60 * 5 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        
        // Get status
        const status = await getAnalysisStatus(analysisId);
        setProgress(status);

        if (status.status === 'completed') {
          // Get final results
          const finalResult = await getAnalysisResult(analysisId);
          setResult(finalResult);
          return;
        }

        if (status.status === 'failed') {
          throw new Error(status.message || 'Analysis failed');
        }

        if (attempts >= maxAttempts) {
          throw new Error('Analysis timeout - taking too long');
        }

        // Continue polling
        setTimeout(poll, 5000); // Poll every 5 seconds
      } catch (err: any) {
        setError(err.message);
        setProgress({
          status: 'failed',
          progress: 0,
          message: err.message,
        });
      }
    };

    await poll();
  };

  const reset = useCallback(() => {
    setProgress(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analyzeVideo,
    progress,
    result,
    error,
    isAnalyzing,
    reset,
  };
};
