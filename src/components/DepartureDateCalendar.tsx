import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { DepartureDate } from '../types';

interface DepartureDateCalendarProps {
  departureDates: DepartureDate[];
  selectedDate?: string;
  onSelectDate: (date: string) => void;
  className?: string;
}

export function DepartureDateCalendar({ departureDates, selectedDate, onSelectDate, className = '' }: DepartureDateCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Convert departure dates to a map for quick lookup
  const departureDateMap = useMemo(() => {
    const map = new Map<string, DepartureDate>();
    departureDates.forEach(dep => {
      if (dep.start) {
        map.set(dep.start, dep);
      }
    });
    return map;
  }, [departureDates]);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getDepartureDateForDay = (date: Date): DepartureDate | undefined => {
    const dateStr = formatDate(date);
    return departureDateMap.get(dateStr);
  };

  const getAvailabilityStatus = (dep: DepartureDate | undefined): 'available' | 'limited' | 'full' | 'unavailable' => {
    if (!dep) return 'unavailable';
    if (dep.isAvailable === false) return 'unavailable';
    
    if (dep.maxCapacity && dep.currentBookings !== undefined) {
      const remaining = dep.maxCapacity - dep.currentBookings;
      if (remaining === 0) return 'full';
      if (remaining <= dep.maxCapacity * 0.2) return 'limited'; // 20% or less remaining
      return 'available';
    }
    
    return 'available';
  };

  const getStatusColor = (status: 'available' | 'limited' | 'full' | 'unavailable'): string => {
    switch (status) {
      case 'available':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'limited':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'full':
        return 'bg-red-500 text-white cursor-not-allowed';
      case 'unavailable':
      default:
        return 'bg-gray-100 text-gray-400';
    }
  };

  const getStatusIcon = (status: 'available' | 'limited' | 'full' | 'unavailable') => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'limited':
        return <AlertCircle className="w-4 h-4" />;
      case 'full':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Select Departure Date
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center">
            {monthYear}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
        {calendarDays.map((date, index) => {
          const dateStr = formatDate(date);
          const departure = getDepartureDateForDay(date);
          const status = getAvailabilityStatus(departure);
          const isSelected = selectedDate === dateStr;
          const dayIsToday = isToday(date);
          const inCurrentMonth = isCurrentMonth(date);

          return (
            <button
              key={index}
              onClick={() => {
                if (departure && status !== 'full' && status !== 'unavailable') {
                  onSelectDate(dateStr);
                }
              }}
              disabled={!departure || status === 'full' || status === 'unavailable'}
              className={`
                relative aspect-square rounded-lg text-sm font-medium transition-all
                ${!inCurrentMonth ? 'opacity-30' : ''}
                ${isSelected ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
                ${dayIsToday && !isSelected ? 'ring-1 ring-blue-300' : ''}
                ${departure ? getStatusColor(status) : 'text-gray-400'}
              `}
              title={departure ? `${status.charAt(0).toUpperCase() + status.slice(1)} - ${departure.currentBookings || 0}/${departure.maxCapacity || '∞'} booked` : 'No departure'}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{date.getDate()}</span>
                {departure && (
                  <span className="absolute bottom-1 right-1">
                    {getStatusIcon(status)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t pt-4 space-y-2">
        <h4 className="text-xs font-semibold text-gray-700 mb-3">Availability Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Limited Spots</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">Fully Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 rounded border"></div>
            <span className="text-gray-600">Not Available</span>
          </div>
        </div>
      </div>

      {/* Selected Date Info */}
      {selectedDate && departureDateMap.get(selectedDate) && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
              {(() => {
                const dep = departureDateMap.get(selectedDate);
                if (dep?.maxCapacity && dep.currentBookings !== undefined) {
                  const remaining = dep.maxCapacity - dep.currentBookings;
                  return (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{remaining}</span> spot{remaining !== 1 ? 's' : ''} remaining out of {dep.maxCapacity}
                      {dep.price && (
                        <span className="ml-2 text-blue-700 font-semibold">
                          Special Price: ${dep.price.toFixed(2)}
                        </span>
                      )}
                    </p>
                  );
                }
                return <p className="text-sm text-gray-600">Unlimited availability</p>;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
