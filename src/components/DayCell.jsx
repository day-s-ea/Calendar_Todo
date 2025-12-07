import React from 'react';
import { formatISODate } from '../utils/dateUtils';

export default function DayCell({ date, events, categories, todos, onClick, isMobile }) {
  if (!date) {
    return <div className="border border-gray-200 bg-gray-50 h-20 sm:h-24 md:h-28" />;
  }

  const isToday = formatISODate(date) === formatISODate(new Date());
  const hasTodos = todos && todos.length > 0;

  return (
    <div
      onClick={onClick}
      className={`border border-gray-200 p-1 sm:p-2 h-20 sm:h-24 md:h-28 cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden relative ${
        isToday ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className={`text-xs sm:text-sm font-semibold ${isToday ? 'text-blue-600' : ''}`}>
          {date.getDate()}
        </div>
        {hasTodos && (
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Ha to-do"></div>
        )}
      </div>
      <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
        {events.slice(0, 3).map((ev) => {
          const cat = categories[ev.category] || categories.other;
          return (
            <div
              key={ev.id}
              className={`text-[10px] sm:text-xs ${cat.color} text-white px-1 py-0.5 rounded truncate leading-tight`}
              title={ev.title}
            >
              {ev.title}
            </div>
          );
        })}
        {events.length > 3 && (
          <div className="text-[10px] sm:text-xs text-gray-500">+{events.length - 3}</div>
        )}
      </div>
    </div>
  );
}