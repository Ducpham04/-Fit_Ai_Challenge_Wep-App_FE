import { Calendar, Users, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface ChallengeCardProps {
  id: number;
  title: string;
  description: string;
  image: string;
  difficulty: string;
  participants: number;
  reward?: string;
  status?: 'Active' | 'Upcoming' | 'Completed';
}

const difficultyColors = {
  Easy: 'bg-lime-100 text-lime-700',
  Medium: 'bg-sky-100 text-sky-700',
  Hard: 'bg-orange-100 text-orange-700',
  Beginner: 'bg-lime-100 text-lime-700',
  Intermediate: 'bg-sky-100 text-sky-700',
  Advanced: 'bg-orange-100 text-orange-700',
};

const statusColors = {
  Active: 'bg-lime-500',
  Upcoming: 'bg-sky-500',
  Completed: 'bg-gray-500',
};

export const ChallengeCard = ({
  id,
  title,
  description,
  image,
  difficulty,
  participants,
  reward,
  status = 'Active',
}: ChallengeCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs text-white ${statusColors[status]}`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2 py-1 rounded text-xs ${
              difficultyColors[difficulty as keyof typeof difficultyColors] ||
              difficultyColors.Medium
            }`}
          >
            {difficulty}
          </span>
        </div>

        <h3 className="text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{participants.toLocaleString()}</span>
          </div>
          {reward && (
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-xs">{reward}</span>
            </div>
          )}
        </div>

        <Link
          to={`/challenges/${id}`}
          className="block w-full px-4 py-2 text-center bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg hover:shadow-lg transition-shadow"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};
