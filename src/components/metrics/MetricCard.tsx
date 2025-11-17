import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  color?: 'sky' | 'lime' | 'orange' | 'purple' | 'pink';
  isHighlighted?: boolean;
}

const colorClasses = {
  sky: {
    gradient: 'from-sky-400 to-sky-500',
    bg: 'bg-sky-100',
    text: 'text-sky-600',
  },
  lime: {
    gradient: 'from-lime-400 to-lime-500',
    bg: 'bg-lime-100',
    text: 'text-lime-600',
  },
  orange: {
    gradient: 'from-orange-400 to-orange-500',
    bg: 'bg-orange-100',
    text: 'text-orange-600',
  },
  purple: {
    gradient: 'from-purple-400 to-purple-500',
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
  pink: {
    gradient: 'from-pink-400 to-pink-500',
    bg: 'bg-pink-100',
    text: 'text-pink-600',
  },
};

export const MetricCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  color = 'sky',
  isHighlighted = false,
}: MetricCardProps) => {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl shadow-md p-6 transition-all ${
        isHighlighted ? 'ring-2 ring-sky-500 shadow-lg' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <motion.p
            key={value}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-4xl font-bold text-gray-900 mb-1"
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};
