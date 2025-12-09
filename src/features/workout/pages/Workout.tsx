import { motion } from 'motion/react';
import { useState } from 'react';
import { Play, Pause, RotateCcw, Timer, Flame, Target } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';

interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  sets: number;
  reps: number;
  instructions: string;
}

const sampleExercises: Exercise[] = [
  {
    id: '1',
    name: 'Push-ups',
    duration: 60,
    sets: 3,
    reps: 15,
    instructions: 'Start in plank position, lower your body until chest nearly touches floor, then push back up.'
  },
  {
    id: '2',
    name: 'Squats',
    duration: 45,
    sets: 3,
    reps: 20,
    instructions: 'Stand with feet shoulder-width apart, lower your body as if sitting back into a chair, then stand back up.'
  },
  {
    id: '3',
    name: 'Plank',
    duration: 30,
    sets: 3,
    reps: 1,
    instructions: 'Hold plank position with forearms on ground, body in straight line from head to heels.'
  }
];

export const Workout = () => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(sampleExercises[0].duration);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  const currentEx = sampleExercises[currentExercise];
  const progress = ((sampleExercises.length - (sampleExercises.length - currentExercise - 1)) / sampleExercises.length) * 100;

  const handleNext = () => {
    if (currentExercise < sampleExercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setTimeLeft(sampleExercises[currentExercise + 1].duration);
      setCompletedExercises(prev => new Set([...prev, currentEx.id]));
    }
  };

  const handleReset = () => {
    setCurrentExercise(0);
    setTimeLeft(sampleExercises[0].duration);
    setIsActive(false);
    setCompletedExercises(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl text-gray-900 mb-2">Workout Session</h1>
          <p className="text-xl text-gray-600">Follow along with your personalized workout</p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl text-gray-900">Workout Progress</h2>
                <span className="text-sm text-gray-600">
                  {currentExercise + 1} of {sampleExercises.length} exercises
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current Exercise */}
          <motion.div
            key={currentExercise}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-sky-500" />
                  {currentEx.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-sky-500 mb-2">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-gray-600">Time remaining</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{currentEx.sets}</div>
                    <p className="text-sm text-gray-600">Sets</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{currentEx.reps}</div>
                    <p className="text-sm text-gray-600">Reps</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                  <p className="text-gray-700">{currentEx.instructions}</p>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setIsActive(!isActive)}
                    className="flex-1"
                    variant={isActive ? "secondary" : "default"}
                  >
                    {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isActive ? 'Pause' : 'Start'}
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Workout Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  Workout Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleExercises.map((exercise, index) => (
                    <div
                      key={exercise.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === currentExercise
                          ? 'bg-sky-50 border border-sky-200'
                          : completedExercises.has(exercise.id)
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === currentExercise
                            ? 'bg-sky-500'
                            : completedExercises.has(exercise.id)
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`} />
                        <span className={`font-medium ${
                          index === currentExercise ? 'text-sky-900' : 'text-gray-900'
                        }`}>
                          {exercise.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {exercise.sets}×{exercise.reps}
                      </span>
                    </div>
                  ))}
                </div>

                {currentExercise < sampleExercises.length - 1 && (
                  <Button
                    onClick={handleNext}
                    className="w-full mt-6"
                    disabled={!completedExercises.has(currentEx.id)}
                  >
                    Next Exercise
                  </Button>
                )}

                {currentExercise === sampleExercises.length - 1 && completedExercises.has(currentEx.id) && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Workout Complete! 🎉</h3>
                    <p className="text-green-700">Great job! You've finished your workout session.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
