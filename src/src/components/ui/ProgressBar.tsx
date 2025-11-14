import { motion } from 'motion/react';

interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  color?: 'sky' | 'lime' | 'orange' | 'purple';
  showPercentage?: boolean;
}

const colorClasses = {
  sky: 'bg-sky-500',
  lime: 'bg-lime-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
};

export const ProgressBar = ({
  current,
  target,
  label,
  color = 'sky',
  showPercentage = true,
}: ProgressBarProps) => {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">
              {current} / {target}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${colorClasses[color]} rounded-full`}
        />
      </div>
    </div>
  );
};
