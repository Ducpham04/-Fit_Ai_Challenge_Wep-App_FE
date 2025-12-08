import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getTrainingPlanDetail, submitChallengeVideo, updateChallengeStatus, getPersonalizedDayDetails, completeChallenge, saveDailyTrainingLog, regeneratePersonalizedPlanDetails } from '../api/myChallengeService';
import { TrainingPlanDetail, Challenge } from '../types/myChallenge.type';
import { TrainingPlanHeader } from '../components/TrainingPlanHeader';
import { DayTabs } from '../components/DayTabs';
import { ChallengeCard } from '../components/ChallengeCard';
import { ChallengeDetailModal } from '../components/ChallengeDetailModal';
import { AIAnalysisResult } from '../components/AIRepCounter';
import { ExerciseType, videoFrameToBase64 } from '@/api/fitnessAI.api';

interface TrainingPlanDetailPageProps {
  trainingPlanId: string | number;
  userName: string;
  userAvatar?: string;
  onBack: () => void;
  utId?: number; // UserTraining ID for personalized data
}

export const TrainingPlanDetailPage: React.FC<TrainingPlanDetailPageProps> = ({
  trainingPlanId,
  userName,
  userAvatar,
  onBack,
  utId,
}) => {
  const [plan, setPlan] = useState<TrainingPlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [personalizedData, setPersonalizedData] = useState<Map<number, any>>(new Map());
  const [isCompletingChallenge, setIsCompletingChallenge] = useState(false);
  
  // Refs để tránh infinite loop
  const planLoadedRef = useRef(false);
  const personalizedDataLoadedRef = useRef<Set<string>>(new Set()); // Track đã load cho day nào

  // ✅ Define functions BEFORE useEffect to avoid dependency issues
  const loadTrainingPlan = useCallback(async () => {
    // Prevent duplicate calls
    if (planLoadedRef.current) {
      console.log('⏸️ [TrainingPlanDetailPage] loadTrainingPlan already in progress, skipping');
      return;
    }
    
    try {
      planLoadedRef.current = true;
      setIsLoading(true);
      setError(null);
      console.log('📥 [TrainingPlanDetailPage] Loading Training Plan:', {
        trainingPlanId,
        type: typeof trainingPlanId,
        utId,
      });
      
      // Ensure trainingPlanId is a number
      const numId = typeof trainingPlanId === 'string' ? parseInt(trainingPlanId, 10) : trainingPlanId;
      
      if (isNaN(numId)) {
        throw new Error(`Invalid trainingPlanId: ${trainingPlanId}`);
      }
      
      const data = await getTrainingPlanDetail(numId);
      console.log('✅ [TrainingPlanDetailPage] Loaded Training Plan Data:', {
        planName: data?.planName,
        dayChallengesCount: data?.dayChallenges?.length,
      });
      
      // Check if plan has any challenges
      if (!data || data.dayChallenges.length === 0) {
        setError('This training plan has no exercises yet. Please contact admin to add exercises.');
      } else {
        // Reset personalized data cache khi load plan mới
        personalizedDataLoadedRef.current.clear();
        setPlan(data);
        setSelectedDay(1);
        console.log('✅ [TrainingPlanDetailPage] Plan state updated');
      }
    } catch (err) {
      console.error('❌ [TrainingPlanDetailPage] Error loading training plan:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load training plan';
      setError(errorMessage);
      
      // Show user-friendly error
      if (errorMessage.includes('No training plan details found') || errorMessage.includes('has no details')) {
        setError('This training plan has no exercises yet. Please contact admin to add exercises to this plan.');
      }
    } finally {
      setIsLoading(false);
      planLoadedRef.current = false;
    }
  }, [trainingPlanId]); // useCallback dependencies

  const loadPersonalizedData = useCallback(async (utId: number, dayNumber: number) => {
    try {
      console.log('📥 [TrainingPlanDetailPage] Loading personalized data:', { utId, dayNumber });
      const personalizedDetails = await getPersonalizedDayDetails(utId, dayNumber);
      
      console.log('📊 [TrainingPlanDetailPage] Personalized details received:', personalizedDetails);
      console.log('📊 [TrainingPlanDetailPage] Number of personalized details:', personalizedDetails.length);
      
      if (personalizedDetails.length === 0) {
        console.warn('⚠️ [TrainingPlanDetailPage] No personalized details found. Attempting to regenerate...');
        
        // Thử tạo lại PersonalizedPlanDetail nếu chưa có
        try {
          await regeneratePersonalizedPlanDetails(utId);
          console.log('✅ [TrainingPlanDetailPage] Personalized plan details regenerated, reloading...');
          
          // Reload sau khi regenerate
          const retryDetails = await getPersonalizedDayDetails(utId, dayNumber);
          if (retryDetails.length > 0) {
            console.log('✅ [TrainingPlanDetailPage] Found personalized details after regeneration:', retryDetails.length);
            // Continue với retryDetails thay vì return
            personalizedDetails.push(...retryDetails);
          } else {
            console.warn('⚠️ [TrainingPlanDetailPage] Still no personalized details after regeneration. Using template data.');
            return; // Không có personalized data, dùng template
          }
        } catch (regenerateError) {
          console.error('❌ [TrainingPlanDetailPage] Error regenerating personalized plan details:', regenerateError);
          console.warn('⚠️ [TrainingPlanDetailPage] Using template data as fallback.');
          return; // Không có personalized data, dùng template
        }
      }
      
      // Create a map: challengeId -> personalized data
      // PersonalizedPlanDetailResponse có: challengeId, reps, sets, difficulty, targetMuscle, videoUrl
      const personalizedMap = new Map();
      personalizedDetails.forEach((detail: any) => {
        console.log('📝 [TrainingPlanDetailPage] Mapping personalized detail:', {
          challengeId: detail.challengeId,
          exerciseName: detail.exerciseName,
          reps: detail.reps,
          sets: detail.sets,
        });
        personalizedMap.set(detail.challengeId, detail);
      });
      
      setPersonalizedData(personalizedMap);
      
      // Update plan with personalized data - CHỈ update nếu có thay đổi thực sự
      if (plan) {
        // Kiểm tra xem có thay đổi không trước khi update
        let hasChanges = false;
        const updatedPlan = JSON.parse(JSON.stringify(plan));
        updatedPlan.dayChallenges = updatedPlan.dayChallenges.map((day: any) => {
          // Chỉ update challenges của day hiện tại
          if (day.dayNumber === dayNumber) {
            return {
              ...day,
              challenges: day.challenges.map((ch: Challenge) => {
                // Map theo challengeId (từ challenge.challengeId hoặc challenge.id nếu là challengeId)
                const challengeId = ch.challengeId || ch.id;
                const personalized = personalizedMap.get(challengeId);
                
                if (personalized) {
                  console.log('✅ [TrainingPlanDetailPage] Found personalized data for challenge:', {
                    challengeId,
                    challengeName: ch.challengeName,
                    templateReps: ch.reps,
                    personalizedReps: personalized.reps,
                    templateSets: ch.sets,
                    personalizedSets: personalized.sets,
                  });
                  hasChanges = true;
                  return {
                    ...ch,
                    // Update với personalized values
                    reps: personalized.reps || ch.reps,
                    sets: personalized.sets || ch.sets,
                    difficulty: personalized.difficulty || ch.difficulty,
                    // PersonalizedPlanDetail có videoUrl từ Challenge
                    videoUrl: personalized.videoUrl || ch.videoUrl,
                    // Store personalized data for reference
                    defaultReps: ch.reps, // Template reps
                    customReps: personalized.reps, // Personalized reps
                    defaultSets: ch.sets, // Template sets
                    customSets: personalized.sets, // Personalized sets
                  };
                } else {
                  console.log('⚠️ [TrainingPlanDetailPage] No personalized data for challenge:', {
                    challengeId,
                    challengeName: ch.challengeName,
                    availableChallengeIds: Array.from(personalizedMap.keys()),
                  });
                }
                return ch;
              }),
            };
          }
          return day;
        });
        
        // CHỈ setPlan nếu có thay đổi thực sự
        if (hasChanges) {
          console.log('🔄 [TrainingPlanDetailPage] Updating plan with personalized data');
          setPlan(updatedPlan);
        } else {
          console.log('⏸️ [TrainingPlanDetailPage] No personalized changes, skipping plan update');
        }
      }
    } catch (err) {
      console.error('❌ [TrainingPlanDetailPage] Error loading personalized data:', err);
      // Don't show error to user, just use default values
    }
  }, [plan]); // useCallback - chỉ phụ thuộc vào plan để update state

  // ✅ useEffect hooks AFTER function definitions
  useEffect(() => {
    console.log('🔄 [TrainingPlanDetailPage] useEffect: loadTrainingPlan triggered');
    planLoadedRef.current = false;
    loadTrainingPlan();
  }, [loadTrainingPlan]);

  // Load personalized data when plan is first loaded
  useEffect(() => {
    if (plan && utId && selectedDay) {
      const key = `${utId}-${selectedDay}`;
      if (!personalizedDataLoadedRef.current.has(key)) {
        console.log('📥 [TrainingPlanDetailPage] Plan loaded, loading personalized data for initial day:', selectedDay);
        personalizedDataLoadedRef.current.add(key);
        loadPersonalizedData(utId, selectedDay);
      }
    }
  }, [plan?.id, utId, selectedDay, loadPersonalizedData]);

  // Load personalized data when day changes
  useEffect(() => {
    const key = `${utId}-${selectedDay}`;
    console.log('🔄 [TrainingPlanDetailPage] useEffect: loadPersonalizedData triggered (day change)', {
      hasPlan: !!plan,
      utId,
      selectedDay,
      key,
      alreadyLoaded: personalizedDataLoadedRef.current.has(key),
    });
    
    if (plan && utId && !personalizedDataLoadedRef.current.has(key)) {
      console.log('📥 [TrainingPlanDetailPage] Loading personalized data for day:', selectedDay);
      personalizedDataLoadedRef.current.add(key);
      loadPersonalizedData(utId, selectedDay);
    } else {
      console.log('⏸️ [TrainingPlanDetailPage] Skipping personalized data load:', {
        hasPlan: !!plan,
        hasUtId: !!utId,
        alreadyLoaded: personalizedDataLoadedRef.current.has(key),
      });
    }
  }, [selectedDay, utId, plan, loadPersonalizedData]);

  const handleChallengeStart = (challenge: Challenge) => {
    console.log('Challenge Selected:', challenge);
    console.log('Challenge ID:', challenge.id);
    console.log('Challenge ID (goalId):', challenge.challengeId);
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  const handleChallengeUpload = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  // ✅ Helper function để analyze video file và trả về kết quả
  const analyzeVideoFile = async (
    file: File,
    challenge: Challenge,
    exerciseType?: string
  ): Promise<AIAnalysisResult> => {
    return new Promise((resolve, reject) => {
      // Map exerciseType từ challenge
      const mapExerciseType = (exerciseType?: string): ExerciseType => {
        if (!exerciseType) return 'push-up';
        const type = exerciseType.toLowerCase();
        if (type.includes('push') || type.includes('push-up')) return 'push-up';
        if (type.includes('squat')) return 'squat';
        if (type.includes('pull') || type.includes('pull-up')) return 'pull-up';
        if (type.includes('sit') || type.includes('sit-up')) return 'sit-up';
        if (type.includes('plank')) return 'plank';
        return 'push-up';
      };

      const pythonExerciseType = mapExerciseType(exerciseType);
      const targetTotalReps = challenge.reps * challenge.sets;

      // Tạo video element ẩn để analyze
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.style.display = 'none';
      document.body.appendChild(video);

      // WebSocket để analyze
      let wsMetrics: any = null;
      let wsConnected = false;
      let wsError: string | null = null;
      let intervalId: NodeJS.Timeout | null = null;
      let ws: WebSocket | null = null;

      const FITNESS_AI_WS_URL = import.meta.env.VITE_FITNESS_AI_WS_URL || 'ws://localhost:8000';
      const wsUrl = `${FITNESS_AI_WS_URL}/ws/exercise/${pythonExerciseType}`;

      // Connect WebSocket
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('✅ [analyzeVideoFile] WebSocket connected');
          wsConnected = true;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.success && data.data && typeof data.data.reps === 'number') {
              wsMetrics = data.data;
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = () => {
          wsError = 'WebSocket connection error';
        };

        ws.onclose = () => {
          wsConnected = false;
        };
      } catch (err) {
        console.error('Failed to create WebSocket:', err);
        wsError = 'Failed to connect to AI service';
      }

      // Load video
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;

      const cleanup = () => {
        if (intervalId) clearInterval(intervalId);
        if (ws) ws.close();
        if (video && video.parentNode) {
          video.pause();
          video.src = '';
          document.body.removeChild(video);
        }
        URL.revokeObjectURL(videoUrl);
      };

      video.onloadedmetadata = () => {
        console.log('✅ [analyzeVideoFile] Video loaded, starting analysis...');
        
        // Wait for WebSocket connection
        const waitForConnection = setInterval(() => {
          if (wsConnected || wsError) {
            clearInterval(waitForConnection);
            
            if (wsError) {
              cleanup();
              reject(new Error(wsError));
              return;
            }

            // Start playing video
            video.play().catch(err => {
              console.error('Error playing video:', err);
              cleanup();
              reject(new Error('Failed to play video'));
            });
          }
        }, 100);

        // Send frames while playing
        intervalId = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN && !video.paused && video.readyState >= 2) {
            try {
              const base64Image = videoFrameToBase64(video);
              const base64Data = base64Image.split(',')[1];
              ws.send(JSON.stringify({
                frame: base64Data,
                timestamp: Date.now() / 1000,
                exercise_type: pythonExerciseType,
              }));
            } catch (err) {
              console.error('Error sending frame:', err);
            }
          }
        }, 100); // 10 FPS
      };

      // Khi video kết thúc, process analysis
      video.onended = () => {
        console.log('✅ [analyzeVideoFile] Video ended, processing results...');
        
        // Wait a bit for final metrics
        setTimeout(() => {
          if (!wsMetrics || typeof wsMetrics.reps !== 'number' || wsMetrics.reps <= 0) {
            cleanup();
            reject(new Error('No analysis results received'));
            return;
          }

          const correctReps = wsMetrics.reps;
          const isPassed = correctReps >= targetTotalReps;
          const qualityScore = typeof wsMetrics.quality_score === 'number' ? wsMetrics.quality_score : 0;
          
          const formErrors = Array.isArray(wsMetrics.form_errors) ? wsMetrics.form_errors : [];
          const formErrorsText = formErrors.length > 0
            ? formErrors.map((e: any) => e && e.message ? e.message : 'Form issue detected').join('. ')
            : 'Good form maintained throughout.';
          
          const feedback = isPassed
            ? `Excellent! You completed ${correctReps} reps with ${qualityScore}% quality score. ${formErrorsText}`
            : `You completed ${correctReps} reps. Need ${targetTotalReps - correctReps} more to reach the target. ${formErrorsText}`;
          
          const is_valid_form = typeof wsMetrics.is_valid_form === 'boolean' 
            ? wsMetrics.is_valid_form 
            : qualityScore >= 60;

          const analysis: AIAnalysisResult = {
            correctReps,
            totalReps: correctReps,
            accuracy: qualityScore / 100,
            feedback,
            posture: qualityScore >= 80 ? 'Excellent' : qualityScore >= 60 ? 'Good' : 'Fair',
            formScore: qualityScore / 100,
            isPassed,
            videoUrl: videoUrl,
            confidence: is_valid_form ? 0.95 : 0.75,
            processingTime: 0,
          };

          cleanup();
          resolve(analysis);
        }, 1000);
      };

      video.onerror = () => {
        cleanup();
        reject(new Error('Failed to load video'));
      };
    });
  };

  // ✅ Function để handle video upload và tự động analyze
  const handleVideoUploadAndAnalyze = async (challenge: Challenge, file: File) => {
    console.log('🔵 [TrainingPlanDetailPage] ========== handleVideoUploadAndAnalyze ==========');
    console.log('🔵 [TrainingPlanDetailPage] Starting video analysis:', {
      challengeId: challenge.challengeId,
      challengeName: challenge.challengeName,
      fileName: file.name,
      exerciseType: challenge.exerciseType,
    });

    try {
      // Analyze video
      const analysis = await analyzeVideoFile(file, challenge, challenge.exerciseType);
      console.log('✅ [TrainingPlanDetailPage] Video analysis complete:', {
        correctReps: analysis.correctReps,
        isPassed: analysis.isPassed,
        accuracy: analysis.accuracy,
      });

      // Update UI với analysis results
      if (!plan) {
        console.warn('⚠️ [TrainingPlanDetailPage] Plan is null, cannot update');
        return;
      }

      const targetTotalReps = challenge.reps * challenge.sets;
      const isPassed = analysis.correctReps >= targetTotalReps;

      const updatedPlan = { ...plan };
      updatedPlan.dayChallenges = updatedPlan.dayChallenges.map((day: any) => ({
        ...day,
        challenges: day.challenges.map((ch: any) => {
          if (ch.id === challenge.id || ch.challengeId === challenge.challengeId) {
            return {
              ...ch,
              status: isPassed ? 'COMPLETED' : ch.status,
              aiAnalysis: {
                correctReps: analysis.correctReps,
                totalReps: analysis.totalReps,
                accuracy: Math.round(analysis.accuracy * 100),
                feedback: analysis.feedback,
                posture: analysis.posture,
              },
              videoUrl: analysis.videoUrl || ch.videoUrl,
            };
          }
          return ch;
        }),
      }));

      setPlan(updatedPlan);

      // ✅ Nếu passed, gọi handleCompleteChallenge để lưu DailyTrainingLog
      if (isPassed) {
        console.log('🎉 [TrainingPlanDetailPage] Challenge PASSED - Calling handleCompleteChallenge...');
        try {
          await handleCompleteChallenge(challenge.challengeId, undefined, analysis);
          console.log('✅ [TrainingPlanDetailPage] handleCompleteChallenge completed');
        } catch (error) {
          console.error('❌ [TrainingPlanDetailPage] Error calling handleCompleteChallenge:', error);
        }
      }
    } catch (error) {
      console.error('❌ [TrainingPlanDetailPage] Error analyzing video:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze video. Please try again.');
      throw error;
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!plan || !selectedChallenge) return;

    try {
      setIsUploading(true);
      console.log('📤 [MOCK] Video upload (no backend API call):');
      console.log('  Plan ID:', plan.id);
      console.log('  Challenge ID:', selectedChallenge.challengeId);
      console.log('  File:', file.name);
      
      // ⚠️ MOCK MODE: Không gọi API, chỉ update UI
      // const result = await submitChallengeVideo(...); // Commented out
      
      // Mock AI analysis result
      const mockAnalysis = {
        correctReps: selectedChallenge.reps * selectedChallenge.sets,
        totalReps: selectedChallenge.reps * selectedChallenge.sets + 2,
        accuracy: 0.92,
        feedback: 'Excellent form! Keep your back straight and maintain consistent pace.',
        posture: 'Excellent',
      };
      
      // Update challenge with AI analysis results (local state only)
      const updatedPlan = { ...plan };
      updatedPlan.dayChallenges = updatedPlan.dayChallenges.map((day) => ({
        ...day,
        challenges: day.challenges.map((ch) =>
          ch.id === selectedChallenge.id
            ? {
                ...ch,
                status: 'COMPLETED' as const,
                aiAnalysis: mockAnalysis,
              }
            : ch
        ),
      }));
      setPlan(updatedPlan);

      // Recalculate progress
      const completedCount = updatedPlan.dayChallenges.reduce(
        (sum, day) => sum + day.challenges.filter(c => c.status === 'COMPLETED').length,
        0
      );
      const totalChallenges = updatedPlan.dayChallenges.reduce(
        (sum, day) => sum + day.challenges.length,
        0
      );
      updatedPlan.progressPercentage = Math.round((completedCount / totalChallenges) * 100);
      setPlan(updatedPlan);

      console.log('✅ [MOCK] Challenge updated locally:', {
        challengeId: selectedChallenge.challengeId,
        status: 'COMPLETED',
        progress: updatedPlan.progressPercentage + '%',
      });

      // Close modal
      setIsModalOpen(false);
      setSelectedChallenge(null);
    } catch (error) {
      console.error('Error in video upload handler:', error);
      setError('Failed to process video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId: number, userChallengeId?: number, analysisData?: any) => {
    console.log('🎯 [TrainingPlanDetailPage] ========== handleCompleteChallenge CALLED ==========');
    console.log('🎯 [TrainingPlanDetailPage] handleCompleteChallenge called:', {
      challengeId,
      userChallengeId,
      trainingPlanId,
      isCompletingChallenge,
      hasAnalysisData: !!analysisData,
      analysisDataKeys: analysisData ? Object.keys(analysisData) : [],
    });

    // Prevent multiple simultaneous calls
    if (isCompletingChallenge) {
      console.warn('⚠️ [TrainingPlanDetailPage] Challenge completion already in progress, skipping duplicate call');
      console.warn('⚠️ [TrainingPlanDetailPage] Current isCompletingChallenge state:', isCompletingChallenge);
      return;
    }
    
    console.log('✅ [TrainingPlanDetailPage] isCompletingChallenge check passed, proceeding...');

    console.log('🔄 [TrainingPlanDetailPage] Setting isCompletingChallenge = true');
    setIsCompletingChallenge(true);
    try {
      console.log('🎯 [TrainingPlanDetailPage] Marking challenge as completed:', {
        challengeId,
        userChallengeId,
        trainingPlanId,
      });

      // Ensure trainingPlanId is a number
      const numTrainingPlanId = typeof trainingPlanId === 'string' ? parseInt(trainingPlanId, 10) : trainingPlanId;
      
      if (isNaN(numTrainingPlanId)) {
        throw new Error(`Invalid trainingPlanId: ${trainingPlanId}`);
      }

      // Step 1: Update UI optimistically first (for better UX)
      console.log('📝 [TrainingPlanDetailPage] Step 1: Updating UI optimistically...');
      if (plan && selectedChallenge) {
        console.log('📝 [TrainingPlanDetailPage] Plan and selectedChallenge exist, updating...');
        const updatedPlan = { ...plan };
        updatedPlan.dayChallenges = updatedPlan.dayChallenges.map((day) => ({
          ...day,
          challenges: day.challenges.map((ch) =>
            ch.id === selectedChallenge.id || ch.challengeId === challengeId
              ? {
                  ...ch,
                  status: 'COMPLETED' as const,
                }
              : ch
          ),
        }));

        // Recalculate progress
        const completedCount = updatedPlan.dayChallenges.reduce(
          (sum, day) => sum + day.challenges.filter(c => c.status === 'COMPLETED').length,
          0
        );
        const totalChallenges = updatedPlan.dayChallenges.reduce(
          (sum, day) => sum + day.challenges.length,
          0
        );
        updatedPlan.progressPercentage = Math.round((completedCount / totalChallenges) * 100);
        
        console.log('🔄 [TrainingPlanDetailPage] Calling setPlan with updated plan...');
        setPlan(updatedPlan);
        console.log('✅ [TrainingPlanDetailPage] Challenge marked as completed (UI updated optimistically)');
      } else {
        console.warn('⚠️ [TrainingPlanDetailPage] Plan or selectedChallenge missing:', {
          hasPlan: !!plan,
          hasSelectedChallenge: !!selectedChallenge,
        });
      }

      // Step 2: Update challenge status in training plan context
      console.log('🔵 [TrainingPlanDetailPage] ========== STEP 2: Update Challenge Status ==========');
      try {
        console.log('🔵 [TrainingPlanDetailPage] Calling updateChallengeStatus...');
        await updateChallengeStatus(numTrainingPlanId, challengeId, 'COMPLETED');
        console.log('✅ [TrainingPlanDetailPage] Challenge status updated in training plan');
      } catch (statusError) {
        console.error('❌ [TrainingPlanDetailPage] ========== ERROR IN STEP 2 ==========');
        console.error('❌ [TrainingPlanDetailPage] Could not update challenge status in training plan:', statusError);
        console.error('❌ [TrainingPlanDetailPage] Error details:', {
          message: statusError instanceof Error ? statusError.message : String(statusError),
          stack: statusError instanceof Error ? statusError.stack : undefined,
        });
        // Revert optimistic update on error
        if (plan && selectedChallenge) {
          console.log('🔄 [TrainingPlanDetailPage] Reverting optimistic update...');
          await loadTrainingPlan();
        }
        throw statusError;
      }
      
      console.log('✅ [TrainingPlanDetailPage] Step 2 completed, proceeding to Step 3...');

      // Step 3: Save to DailyTrainingLog - QUAN TRỌNG: Lưu vào database để persist
      console.log('🔵 [TrainingPlanDetailPage] ========== STEP 3: Save DailyTrainingLog ==========');
      console.log('🔵 [TrainingPlanDetailPage] Step 3: Starting saveDailyTrainingLog...');
      try {
        // Tìm dayNumber từ challenge trong plan
        let dayNumber = selectedDay; // Default to selectedDay
        console.log('🔵 [TrainingPlanDetailPage] Initial dayNumber:', dayNumber);
        
        if (plan && selectedChallenge) {
          // Tìm day chứa challenge này
          const dayWithChallenge = plan.dayChallenges.find(day =>
            day.challenges.some(ch => ch.challengeId === challengeId || ch.id === selectedChallenge.id)
          );
          if (dayWithChallenge) {
            dayNumber = dayWithChallenge.dayNumber;
            console.log('🔵 [TrainingPlanDetailPage] Found dayNumber from plan:', dayNumber);
          }
        }

        // Lấy thông tin từ analysisData (từ AI analysis) hoặc selectedChallenge
        const dailyLogData = analysisData ? {
          repsCompleted: analysisData.repsCompleted || analysisData.correctReps || analysisData.totalReps || 0,
          setsCompleted: analysisData.setsCompleted || selectedChallenge?.sets || 1,
          score: analysisData.score || Math.round((analysisData.formScore || analysisData.accuracy || 0) * 100),
          confidence: analysisData.confidence || 0,
          actualDurationMinutes: analysisData.actualDurationMinutes || (analysisData.processingTime ? Math.round(analysisData.processingTime / 1000 / 60) : undefined),
        } : (selectedChallenge ? {
          repsCompleted: selectedChallenge.repsCompleted || selectedChallenge.reps,
          setsCompleted: selectedChallenge.setsCompleted || selectedChallenge.sets,
          score: selectedChallenge.score,
          confidence: selectedChallenge.confidence,
          actualDurationMinutes: selectedChallenge.actualDurationMinutes,
        } : undefined);

        console.log('🔵 [TrainingPlanDetailPage] ========== PREPARING DAILY LOG DATA ==========');
        console.log('🔵 [TrainingPlanDetailPage] Full analysisData received:', JSON.stringify(analysisData, null, 2));
        console.log('🔵 [TrainingPlanDetailPage] Extracted dailyLogData:', JSON.stringify(dailyLogData, null, 2));
        console.log('🔵 [TrainingPlanDetailPage] Calling saveDailyTrainingLog with:', {
          trainingPlanId: numTrainingPlanId,
          dayNumber,
          challengeId,
          status: 'completed',
          dailyLogData: JSON.stringify(dailyLogData, null, 2),
        });

        const saveResult = await saveDailyTrainingLog(
          numTrainingPlanId,
          dayNumber,
          challengeId,
          'completed',
          dailyLogData
        );
        
        console.log('✅ [TrainingPlanDetailPage] ========== DAILY LOG SAVED SUCCESSFULLY ==========');
        console.log('✅ [TrainingPlanDetailPage] DailyTrainingLog saved successfully:', {
          trainingPlanId: numTrainingPlanId,
          dayNumber,
          challengeId,
          status: 'completed',
          savedData: JSON.stringify(dailyLogData, null, 2),
          saveResult: JSON.stringify(saveResult, null, 2),
        });
        console.log('✅ [TrainingPlanDetailPage] Data persisted to database - will remain after reload');
      } catch (dailyLogError) {
        console.error('❌ [TrainingPlanDetailPage] Could not save DailyTrainingLog:', dailyLogError);
        console.error('❌ [TrainingPlanDetailPage] Error details:', {
          message: dailyLogError instanceof Error ? dailyLogError.message : String(dailyLogError),
          stack: dailyLogError instanceof Error ? dailyLogError.stack : undefined,
        });
        // Don't throw - this is important but we don't want to block completion
        // User will see the challenge as completed in UI, but it won't persist on reload
      }

      // Step 4: If we have userChallengeId, also mark UserChallenge as complete
      if (userChallengeId) {
        try {
          await completeChallenge(userChallengeId);
          console.log('✅ UserChallenge marked as completed');
        } catch (completeError) {
          console.warn('⚠️ Could not mark UserChallenge as completed:', completeError);
          // Don't throw, this is optional
        }
      } else {
        console.warn('⚠️ No userChallengeId provided, skipping UserChallenge completion');
      }

      // Step 5: Reload training plan to sync with backend (but don't show loading to avoid flicker)
      // Only reload if we need to get fresh data, but do it silently
      console.log('🔄 [TrainingPlanDetailPage] Step 5: Reloading training plan from backend...');
      try {
        const numId = typeof trainingPlanId === 'string' ? parseInt(trainingPlanId, 10) : trainingPlanId;
        if (!isNaN(numId)) {
          console.log('📥 [TrainingPlanDetailPage] Fetching training plan detail...');
          const data = await getTrainingPlanDetail(numId);
          if (data && data.dayChallenges.length > 0) {
            console.log('✅ [TrainingPlanDetailPage] Training plan data received, updating state...');
            setPlan(data);
            console.log('✅ [TrainingPlanDetailPage] Training plan reloaded from backend');
          } else {
            console.warn('⚠️ [TrainingPlanDetailPage] No data or empty dayChallenges:', data);
          }
        }
      } catch (reloadError) {
        console.warn('⚠️ [TrainingPlanDetailPage] Could not reload training plan, but challenge is already marked complete:', reloadError);
        // Don't throw, UI is already updated
      }

      console.log('✅ [TrainingPlanDetailPage] handleCompleteChallenge completed successfully');
    } catch (error) {
      console.error('❌ [TrainingPlanDetailPage] Error in complete challenge handler:', error);
      // Show error to user
      setError(error instanceof Error ? error.message : 'Failed to complete challenge. Please try again.');
      // Reload to get correct state from backend
      try {
        console.log('🔄 [TrainingPlanDetailPage] Reloading training plan due to error...');
        await loadTrainingPlan();
      } catch (reloadError) {
        console.error('❌ [TrainingPlanDetailPage] Could not reload training plan after error:', reloadError);
      }
    } finally {
      console.log('🏁 [TrainingPlanDetailPage] Finally block - resetting isCompletingChallenge flag');
      setIsCompletingChallenge(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2"
        >
          ← Back
        </button>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">Loading training plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          ← Back to Plans
        </button>
        <div className="bg-white rounded-lg border-2 border-orange-200 p-8 text-center max-w-2xl mx-auto">
          <div className="mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Training Plan Not Ready</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left text-sm text-gray-700">
              <p className="font-semibold mb-2">What you can do:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Contact the administrator to add exercises to this training plan</li>
                <li>Try selecting a different training plan</li>
                <li>Check back later if exercises are being added</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all"
            >
              Back to Plans
            </button>
            <button
              onClick={loadTrainingPlan}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-8">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2"
        >
          ← Back
        </button>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-red-600">Training plan not found</p>
        </div>
      </div>
    );
  }

  const currentDayData = plan.dayChallenges.find((d) => d.dayNumber === selectedDay);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
        >
        ← Back to Plans
      </button>

      <TrainingPlanHeader
        planName={plan.planName}
        description={plan.description}
        difficulty={plan.difficulty}
        progressPercentage={plan.progressPercentage}
        daysCompleted={plan.dayChallenges.reduce(
          (count, day) =>
            count +
            day.challenges.filter((ch) => ch.status === 'COMPLETED').length,
          0
        )}
        totalDays={plan.dayChallenges.reduce(
          (count, day) => count + day.challenges.length,
          0
        )}
        userName={userName}
        userAvatar={userAvatar}
      />

      {plan.dayChallenges.length > 0 && (
        <>
          <DayTabs
            dayChallenges={plan.dayChallenges}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          {currentDayData && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{currentDayData.dayName}</h2>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {currentDayData.challenges.length} Challenge{currentDayData.challenges.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentDayData.challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onStartClick={handleChallengeStart}
                    onUploadClick={handleChallengeUpload}
                    trainingPlanId={trainingPlanId}
                    onVideoUpload={handleVideoUploadAndAnalyze} // ✅ Tự động analyze khi upload
                    onAnalysisComplete={async (challenge, analysis) => {
                      console.log('🔵 [TrainingPlanDetailPage] ========== FLOW 1: onAnalysisComplete from ChallengeCard ==========');
                      console.log('🔵 [TrainingPlanDetailPage] Received analysis from ChallengeCard:', {
                        challengeId: challenge.challengeId,
                        challengeName: challenge.challengeName,
                        correctReps: analysis.correctReps,
                        isPassed: analysis.isPassed,
                        hasAnalysisData: !!analysis,
                      });
                      
                      if (!plan) {
                        console.warn('⚠️ [TrainingPlanDetailPage] Plan is null, cannot update');
                        return;
                      }
                      
                      const targetTotalReps = challenge.reps * challenge.sets;
                      const isPassed = analysis.correctReps >= targetTotalReps;
                      
                      console.log('🎯 [TrainingPlanDetailPage] Checking completion requirement:', {
                        challengeId: challenge.challengeId,
                        targetTotalReps,
                        correctReps: analysis.correctReps,
                        isPassed,
                      });
                      
                      // Update UI với analysis results
                      const updatedPlan = { ...plan };
                      updatedPlan.dayChallenges = updatedPlan.dayChallenges.map((day: any) => ({
                        ...day,
                        challenges: day.challenges.map((ch: any) => {
                          if (ch.id === challenge.id || ch.challengeId === challenge.challengeId) {
                            return {
                              ...ch,
                              // Update aiAnalysis và status nếu passed
                              status: isPassed ? 'COMPLETED' : ch.status,
                              aiAnalysis: {
                                correctReps: analysis.correctReps,
                                totalReps: analysis.totalReps,
                                accuracy: Math.round(analysis.accuracy * 100),
                                feedback: analysis.feedback,
                                posture: analysis.posture,
                              },
                              // ✅ ĐỒNG BỘ: Lưu video URL nếu có
                              videoUrl: analysis.videoUrl || ch.videoUrl,
                            };
                          }
                          return ch;
                        }),
                      }));
                      
                      setPlan(updatedPlan);
                      
                      // ✅ ĐỒNG BỘ: Nếu passed, gọi handleCompleteChallenge để lưu DailyTrainingLog
                      if (isPassed) {
                        console.log('🎉 [TrainingPlanDetailPage] Flow 1: Challenge PASSED - Calling handleCompleteChallenge...');
                        try {
                          await handleCompleteChallenge(challenge.challengeId, undefined, analysis);
                          console.log('✅ [TrainingPlanDetailPage] Flow 1: handleCompleteChallenge completed');
                        } catch (error) {
                          console.error('❌ [TrainingPlanDetailPage] Flow 1: Error calling handleCompleteChallenge:', error);
                        }
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {selectedChallenge && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedChallenge(null);
          }}
          onUpload={handleVideoUpload}
          onComplete={handleCompleteChallenge}
          isLoading={isUploading}
          trainingPlanId={trainingPlanId}
        />
      )}
      </div>
    </main>
  );
};
