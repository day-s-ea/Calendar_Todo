import React from 'react';
import { calculateDuration, getRecurrenceDescription } from '../utils/dateUtils';

export default function EventSection({ title, events, categories, dateISO, onEdit, onRemove, editingId }) {
  if (events.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm sm:text-base">{title}</h3>
      <div className="space-y-2">
        {events.map((ev) => {
          const cat = categories[ev.category] || categories.other;
          const isEditing = editingId === ev.id;
          const isRecurring = ev.recurrence && ev.recurrence.type !== "none";
          const isAllDay = ev.durationType === "allday";
          
          return (
            <div 
              key={ev.id} 
              className={`flex items-center justify-between p-2 sm:p-3 rounded gap-2 ${
                isEditing ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${cat.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base truncate flex items-center gap-1">
                    {ev.title}
                    {isRecurring && <span className="text-xs">🔁</span>}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {isAllDay ? (
                      <span>Tutto il giorno</span>
                    ) : (
                      <span>{ev.startTime} - {ev.endTime} ({calculateDuration(ev.startTime, ev.endTime)})</span>
                    )}
                    {isRecurring && (
                      <span className="text-xs text-purple-600 ml-1">
                        • {getRecurrenceDescription(ev.recurrence)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEdit(ev)}
                  className="text-blue-500 hover:text-blue-700 px-2 py-1 text-sm"
                  title="Modifica"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onRemove(dateISO, ev.id)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 text-sm"
                  title={isRecurring ? "Elimina tutte le ricorrenze" : "Elimina"}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}