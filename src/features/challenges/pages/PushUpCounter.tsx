import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export const PushUpCounter = () => {
  const [count, setCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    if (!isSessionActive) return;
    const timer = setInterval(() => setSessionTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isSessionActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleIncrement = () => setCount(count + 1);
  const handleUndo = () => count > 0 && setCount(count - 1);
  const handleReset = () => {
    setCount(0);
    setSessionTime(0);
    setIsSessionActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-sky-500 to-lime-400 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <Activity className="w-16 h-16 text-sky-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Push-up Counter</h1>
            <p className="text-gray-600 mt-2">AI-Powered Form Tracking</p>
          </div>

          {/* Counter Display */}
          <div className="bg-gradient-to-r from-sky-50 to-lime-50 rounded-xl p-8 mb-8 text-center">
            <div className="text-6xl font-bold text-sky-600 mb-4">{count}</div>
            <div className="text-2xl text-gray-700">{formatTime(sessionTime)}</div>
          </div>

          {/* Button Grid */}
          <div className="space-y-4">
            <button
              onClick={() => {
                setIsSessionActive(!isSessionActive);
              }}
              className="w-full py-4 bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg hover:shadow-lg transition-shadow font-semibold text-lg"
            >
              {isSessionActive ? 'Pause' : 'Start Session'}
            </button>

            <button
              onClick={handleIncrement}
              disabled={!isSessionActive}
              className="w-full py-4 bg-lime-500 text-white rounded-lg hover:shadow-lg transition-shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add Push-up
            </button>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleUndo}
                className="py-3 bg-orange-400 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Undo
              </button>
              <button
                onClick={handleReset}
                className="py-3 bg-gray-400 text-white rounded-lg hover:shadow-lg transition-shadow"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-2xl font-bold text-sky-600">{count}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Rate</p>
                <p className="text-2xl font-bold text-lime-600">
                  {sessionTime > 0 ? Math.round(count / (sessionTime / 60)) : 0}/min
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Time</p>
                <p className="text-2xl font-bold text-orange-600">{formatTime(sessionTime)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
