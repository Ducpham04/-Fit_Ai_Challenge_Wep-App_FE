import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  color?: 'sky' | 'lime' | 'orange' | 'purple';
  trend?: number;
}

const colorClasses = {
  sky: 'from-sky-400 to-sky-500',
  lime: 'from-lime-400 to-lime-500',
  orange: 'from-orange-400 to-orange-500',
  purple: 'from-purple-400 to-purple-500',
};

export const StatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  color = 'sky',
  trend,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend !== undefined && (
            <p
              className={`text-sm mt-2 ${
                trend >= 0 ? 'text-lime-500' : 'text-red-500'
              }`}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};
