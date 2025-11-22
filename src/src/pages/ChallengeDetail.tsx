import { motion } from 'motion/react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Trophy, Clock, Target, ArrowLeft, CheckCircle } from 'lucide-react';
import { mockChallenges } from '../api/mockData';
import { useState } from 'react';

export const ChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);
  
  const challenge = mockChallenges.find((c) => c.id === Number(id));

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl text-gray-900 mb-4">Challenge Not Found</h1>
          <Link to="/challenges" className="text-sky-500 hover:text-sky-600">
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  const handleJoinChallenge = () => {
    setIsJoined(true);
    // Redirect to the Push-Up Counter for challenge 1
    if (id === '1') {
      setTimeout(() => {
        navigate(`/challenges/${id}/counter`);
      }, 500);
    } 
    // Redirect to the Squat Counter for challenge 2
    else if (id === '2') {
      setTimeout(() => {
        navigate(`/challenges/${id}/squat-counter`);
      }, 500);
    } 
    else {
      // For other challenges, show alert
      setTimeout(() => {
        alert('Successfully joined the challenge! 🎉');
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/challenges"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-sky-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Challenges
        </Link>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
        >
          <div className="relative h-96">
            <img
              src={challenge.image}
              alt={challenge.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  challenge.difficulty === 'Easy' ? 'bg-lime-500' :
                  challenge.difficulty === 'Medium' ? 'bg-sky-500' : 'bg-orange-500'
                }`}>
                  {challenge.difficulty}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  challenge.status === 'Active' ? 'bg-lime-500' :
                  challenge.status === 'Upcoming' ? 'bg-sky-500' : 'bg-gray-500'
                }`}>
                  {challenge.status}
                </span>
              </div>
              <h1 className="text-4xl mb-2">{challenge.title}</h1>
              <p className="text-xl text-gray-200">{challenge.description}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* About */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl text-gray-900 mb-4">About This Challenge</h2>
              <p className="text-gray-600 mb-4">
                This challenge is designed to push your limits and help you achieve new fitness milestones. 
                Our AI coach will track your form, provide real-time feedback, and adjust your plan based on your progress.
              </p>
              <p className="text-gray-600">
                Perfect for athletes looking to {challenge.difficulty === 'Easy' ? 'start their fitness journey' : 
                challenge.difficulty === 'Medium' ? 'take their training to the next level' : 
                'achieve elite performance goals'}.
              </p>
            </div>

            {/* What You'll Get */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl text-gray-900 mb-4">What You'll Get</h2>
              <div className="space-y-3">
                {[
                  'AI-powered form analysis and corrections',
                  'Personalized workout adjustments',
                  'Real-time performance tracking',
                  'Daily motivation and tips',
                  'Community support and leaderboards',
                  'Achievement badges and rewards',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-lime-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl text-gray-900 mb-4">Challenge Schedule</h2>
              <div className="space-y-4">
                {[
                  { week: 'Week 1-2', focus: 'Foundation Building', description: 'Learn proper form and build endurance' },
                  { week: 'Week 3-4', focus: 'Intensity Increase', description: 'Progressive overload and strength gains' },
                  { week: 'Week 5-6', focus: 'Peak Performance', description: 'Maximum effort and personal records' },
                  { week: 'Week 7-8', focus: 'Mastery & Assessment', description: 'Final push and AI evaluation' },
                ].map((phase, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-lime-400 flex items-center justify-center text-white flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1">{phase.week}: {phase.focus}</h3>
                        <p className="text-sm text-gray-600">{phase.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Join Card */}
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Reward</p>
                    <p className="text-gray-900">{challenge.reward}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-sky-500" />
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="text-gray-900">{challenge.participants.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-lime-500" />
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="text-gray-900">{new Date(challenge.startDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="text-gray-900">{new Date(challenge.endDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">AI Score</p>
                    <p className="text-gray-900">{challenge.aiScore}/100</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleJoinChallenge}
                disabled={isJoined}
                className={`w-full py-3 rounded-lg transition-all ${
                  isJoined
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-sky-400 to-lime-400 text-white hover:shadow-lg'
                }`}
              >
                {isJoined ? 'Already Joined' : 'Join Challenge'}
              </button>

              {isJoined && (
                <p className="text-center text-sm text-lime-600 mt-3">
                  ✓ You're in! Check your dashboard to start.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
