import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, Trophy, TrendingUp } from 'lucide-react';
import { ChallengeCard } from '../../challenges/components/ChallengeCard';
import { mockChallenges } from '../../challenges/api/mockData';
import { useChallenges } from '../../../context/ChallengeContext';

export const Home = () => {
  const { challenges } = useChallenges();
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-400 via-sky-500 to-lime-400 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl mb-6">
                Transform Your Fitness with AI
              </h1>
              <p className="text-xl mb-8 text-sky-50">
                Join thousands of athletes in AI-powered challenges. 
                Get personalized coaching, track your progress, and achieve your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-sky-500 rounded-lg hover:shadow-2xl transition-shadow text-center"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/challenges"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-sky-500 transition-colors text-center"
                >
                  Explore Challenges
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1756115484694-009466dbaa67?w=600"
                alt="Fitness Hero"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl text-gray-900 mb-4">Why Choose Fit AI Challenge?</h2>
            <p className="text-xl text-gray-600">AI-powered features to supercharge your fitness journey</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: 'AI Coaching',
                description: 'Real-time form analysis and personalized feedback',
                color: 'from-yellow-400 to-orange-400',
              },
              {
                icon: Users,
                title: 'Community',
                description: 'Connect with thousands of motivated athletes',
                color: 'from-sky-400 to-blue-400',
              },
              {
                icon: Trophy,
                title: 'Challenges',
                description: 'Compete in exciting AI-tracked challenges',
                color: 'from-lime-400 to-green-400',
              },
              {
                icon: TrendingUp,
                title: 'Progress Tracking',
                description: 'Detailed analytics and performance insights',
                color: 'from-purple-400 to-pink-400',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className={`inline-block p-4 rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Workouts */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-4xl text-gray-900 mb-2">Popular Challenges</h2>
              <p className="text-xl text-gray-600">Join the most exciting challenges today</p>
            </div>
            <Link
              to="/challenges"
              className="hidden md:flex items-center gap-2 text-sky-500 hover:text-sky-600"
            >
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {challenges.map((workout: any, index: number) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ChallengeCard
      id={workout.id}
      title={workout.title}
      description={workout.description}
      image={"http://localhost:8080/" +workout.image}
      difficulty={workout.difficulty}
      participants={workout.participants || 0} 
    />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link
              to="/challenges"
              className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600"
            >
              View All Challenges <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-500 to-lime-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl mb-6">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 text-sky-50">
              Join over 50,000 athletes transforming their fitness with AI coaching
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-sky-500 rounded-lg hover:shadow-2xl transition-shadow"
            >
              Join Now - It's Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
