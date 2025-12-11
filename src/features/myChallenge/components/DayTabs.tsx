import React, { useMemo } from 'react';
import { DayChallenges, Challenge } from '../types/myChallenge.type';
import { Calendar, CheckCircle2, Lock, AlertTriangle, Clock } from 'lucide-react';

interface DayTabsProps {
  dayChallenges: DayChallenges[];
  selectedDay: number;
  onSelectDay: (dayNumber: number) => void;
  startDate?: string; // Training plan start date (YYYY-MM-DD)
  utId?: number; // UserTraining ID for checking completion
}

interface DayStatus {
  dayNumber: number;
  isCompleted: boolean;
  isLocked: boolean;
  isOverdue: boolean;
  isToday: boolean;
  actualDate: Date | null; // Actual calendar date for this day
  completedChallenges: number;
  totalChallenges: number;
}

export const DayTabs: React.FC<DayTabsProps> = ({ 
  dayChallenges, 
  selectedDay, 
  onSelectDay,
  startDate,
  utId,
}) => {
  
  // ✅ Tính toán status cho từng ngày
  const dayStatuses = useMemo<Map<number, DayStatus>>(() => {
    const statusMap = new Map<number, DayStatus>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse start date
    let planStartDate: Date | null = null;
    if (startDate) {
      planStartDate = new Date(startDate);
      planStartDate.setHours(0, 0, 0, 0);
    }
    
    // Track completed days để lock ngày tiếp theo
    const completedDays = new Set<number>();
    
    dayChallenges.forEach((day) => {
      // Tính actual calendar date cho ngày này
      let actualDate: Date | null = null;
      if (planStartDate) {
        actualDate = new Date(planStartDate);
        actualDate.setDate(actualDate.getDate() + (day.dayNumber - 1));
        actualDate.setHours(0, 0, 0, 0);
      }
      
      // Kiểm tra ngày này có phải hôm nay không
      const isToday = actualDate && actualDate.getTime() === today.getTime();
      
      // Kiểm tra ngày này đã qua chưa (overdue)
      const isOverdue = actualDate && actualDate.getTime() < today.getTime();
      
      // Đếm challenges đã hoàn thành
      const completedChallenges = day.challenges.filter(
        (ch: Challenge) => ch.status === 'COMPLETED'
      ).length;
      const totalChallenges = day.challenges.length;
      const isCompleted = completedChallenges === totalChallenges && totalChallenges > 0;
      
      if (isCompleted) {
        completedDays.add(day.dayNumber);
      }
      
      statusMap.set(day.dayNumber, {
        dayNumber: day.dayNumber,
        isCompleted,
        isLocked: false, // Sẽ tính sau
        isOverdue,
        isToday,
        actualDate,
        completedChallenges,
        totalChallenges,
      });
    });
    
    // ✅ Tính toán lock: Ngày tiếp theo bị lock nếu ngày hiện tại chưa hoàn thành
    dayChallenges.forEach((day) => {
      const status = statusMap.get(day.dayNumber);
      if (!status) return;
      
      // Ngày đầu tiên luôn unlock
      if (day.dayNumber === 1) {
        status.isLocked = false;
        return;
      }
      
      // Kiểm tra ngày trước đó đã hoàn thành chưa
      const previousDay = day.dayNumber - 1;
      const previousStatus = statusMap.get(previousDay);
      
      if (previousStatus && !previousStatus.isCompleted) {
        // Ngày trước chưa hoàn thành → lock ngày này
        status.isLocked = true;
      } else {
        status.isLocked = false;
      }
    });
    
    return statusMap;
  }, [dayChallenges, startDate]);
  
  // Format date để hiển thị
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return `${dayNames[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}`;
  };
  
  return (
    <div className="mb-6">
      {/* Scheduler Header */}
      {startDate && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Lịch tập luyện</p>
              <p className="text-xs text-gray-600">
                Bắt đầu: {new Date(startDate).toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Day Tabs với Status */}
      <div className="flex overflow-x-auto gap-2 pb-2 mb-4 border-b border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {dayChallenges.map((day) => {
          const status = dayStatuses.get(day.dayNumber);
          if (!status) return null;
          
          const isSelected = selectedDay === day.dayNumber;
          const progress = status.totalChallenges > 0 
            ? Math.round((status.completedChallenges / status.totalChallenges) * 100)
            : 0;
          
          return (
            <button
              key={day.dayNumber}
              onClick={() => {
                // ✅ FIX: Không cho click nếu bị lock
                if (status.isLocked) {
                  return;
                }
                onSelectDay(day.dayNumber);
              }}
              disabled={status.isLocked}
              className={`relative px-4 py-3 rounded-lg font-medium text-sm whitespace-nowrap transition-all min-w-[120px] ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : status.isLocked
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                  : status.isCompleted
                  ? 'bg-green-50 text-green-800 border-2 border-green-300 hover:bg-green-100'
                  : status.isOverdue
                  ? 'bg-orange-50 text-orange-800 border-2 border-orange-300 hover:bg-orange-100'
                  : status.isToday
                  ? 'bg-blue-50 text-blue-800 border-2 border-blue-300 hover:bg-blue-100'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-300'
              }`}
              title={
                status.isLocked
                  ? `Ngày ${day.dayNumber} bị khóa. Vui lòng hoàn thành ngày ${day.dayNumber - 1} trước.`
                  : status.isOverdue
                  ? `⚠️ Ngày ${day.dayNumber} đã qua. Vui lòng hoàn thành ngay!`
                  : status.isToday
                  ? `📅 Hôm nay - Ngày ${day.dayNumber}`
                  : status.isCompleted
                  ? `✅ Ngày ${day.dayNumber} đã hoàn thành`
                  : `Ngày ${day.dayNumber}`
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Status Icon */}
                  {status.isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : status.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : status.isOverdue ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : status.isToday ? (
                    <Clock className="w-4 h-4" />
                  ) : null}
                  
                  <span className="font-semibold">Day {day.dayNumber}</span>
                </div>
              </div>
              
              {/* Date Display */}
              {status.actualDate && (
                <div className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatDate(status.actualDate)}
                </div>
              )}
              
              {/* Progress Bar */}
              {!status.isLocked && status.totalChallenges > 0 && (
                <div className={`mt-2 h-1 rounded-full overflow-hidden ${
                  isSelected ? 'bg-blue-400/30' : 'bg-gray-200'
                }`}>
                  <div
                    className={`h-full transition-all ${
                      status.isCompleted
                        ? 'bg-green-500'
                        : status.isOverdue
                        ? 'bg-orange-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              
              {/* Progress Text */}
              {!status.isLocked && status.totalChallenges > 0 && (
                <div className={`text-xs mt-1 ${
                  isSelected ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {status.completedChallenges}/{status.totalChallenges}
                </div>
              )}
              
              {/* Lock Badge */}
              {status.isLocked && (
                <div className="absolute -top-1 -right-1 bg-gray-400 text-white rounded-full p-1">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              
              {/* Overdue Badge */}
              {status.isOverdue && !status.isCompleted && !status.isLocked && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full p-1">
                  <AlertTriangle className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Warning Messages */}
      {(() => {
        const currentStatus = dayStatuses.get(selectedDay);
        if (!currentStatus) return null;
        
        if (currentStatus.isOverdue && !currentStatus.isCompleted) {
          return (
            <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-900 mb-1">
                    ⚠️ Ngày này đã qua!
                  </p>
                  <p className="text-xs text-orange-700">
                    Bạn đã bỏ lỡ ngày {selectedDay}. Vui lòng hoàn thành tất cả challenges của ngày này trước khi tiếp tục.
                  </p>
                </div>
              </div>
            </div>
          );
        }
        
        if (currentStatus.isLocked) {
          return (
            <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    🔒 Ngày này bị khóa
                  </p>
                  <p className="text-xs text-gray-700">
                    Bạn cần hoàn thành tất cả challenges của ngày {selectedDay - 1} trước khi có thể tiếp tục ngày {selectedDay}.
                  </p>
                </div>
              </div>
            </div>
          );
        }
        
        return null;
      })()}
    </div>
  );
};
