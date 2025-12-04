import React from 'react';
import { DayChallenges } from '../types/myChallenge.type';

interface DayTabsProps {
  dayChallenges: DayChallenges[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({ dayChallenges, selectedDay, onSelectDay }) => {
  return (
    <div className="flex overflow-x-auto gap-2 pb-2 mb-6 border-b border-gray-200">
      {dayChallenges.map((day) => (
        <button
          key={day.dayNumber}
          onClick={() => onSelectDay(day.dayNumber)}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            selectedDay === day.dayNumber
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          Day {day.dayNumber}
        </button>
      ))}
    </div>
  );
};
