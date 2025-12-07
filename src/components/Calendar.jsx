import React from 'react';
import DayCell from './DayCell';

export default function Calendar({ monthDays, eventsFor, categories, onSelectDate, isMobile }) {
  const days = isMobile ? ['L', 'M', 'M', 'G', 'V', 'S', 'D'] : ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-100">
        {days.map((d, i) => (
          <div key={i} className="p-1.5 sm:p-2 text-center font-semibold text-xs sm:text-sm">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {monthDays.map((date, i) => (
          <DayCell
            key={i}
            date={date}
            events={date ? eventsFor(formatISODate(date)) : []}
            categories={categories}
            onClick={() => date && onSelectDate(date)}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}

function formatISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}