import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { startOfMonth, endOfMonth, formatISODate } from './utils/dateUtils';
import { useCalendarData } from './hooks/useCalendarData';
import Header from './components/Header';
import CategoryManager from './components/CategoryManager';
import TimePeriodsManager from './components/TimePeriodsManager';
import Calendar from './components/Calendar';
import DayView from './components/DayView';

export default function App() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showTimePeriodsManager, setShowTimePeriodsManager] = useState(false);

  const {
    categories,
    todos,
    timePeriods,
    isLoading,
    eventsFor,
    addEvent,
    updateEvent,
    removeEvent,
    addTodo,
    toggleTodo,
    removeTodo,
    addCategory,
    removeCategory,
    updateTimePeriods,
    clearOldData,
  } = useCalendarData();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const monthDays = useMemo(() => {
    const first = startOfMonth(cursor);
    const last = endOfMonth(cursor);
    const startWeekDay = first.getDay();
    const shift = (startWeekDay + 6) % 7;
    const total = last.getDate();
    const cells = [];

    for (let i = 0; i < shift; i++) cells.push(null);
    for (let d = 1; d <= total; d++) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const nextMonth = useCallback(() => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  }, [cursor]);

  const prevMonth = useCallback(() => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  }, [cursor]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <Header 
          cursor={cursor}
          onPrev={prevMonth}
          onNext={nextMonth}
          onClear={clearOldData}
          onManageCategories={() => setShowCategoryManager(true)}
          onManageTimePeriods={() => setShowTimePeriodsManager(true)}
        />
        
        {showCategoryManager && (
          <CategoryManager
            categories={categories}
            onAdd={addCategory}
            onRemove={removeCategory}
            onClose={() => setShowCategoryManager(false)}
          />
        )}

        {showTimePeriodsManager && (
          <TimePeriodsManager
            timePeriods={timePeriods}
            onUpdate={updateTimePeriods}
            onClose={() => setShowTimePeriodsManager(false)}
          />
        )}

        <Calendar
          monthDays={monthDays}
          eventsFor={eventsFor}
          categories={categories}
          onSelectDate={setSelected}
          isMobile={isMobile}
        />

        {selected && (
          <DayView
            date={selected}
            events={eventsFor(formatISODate(selected))}
            todos={todos[formatISODate(selected)] || []}
            categories={categories}
            timePeriods={timePeriods}
            onClose={() => setSelected(null)}
            onAddEvent={addEvent}
            onUpdateEvent={updateEvent}
            onRemoveEvent={removeEvent}
            onAddTodo={addTodo}
            onToggleTodo={toggleTodo}
            onRemoveTodo={removeTodo}
          />
        )}
      </div>
    </div>
  );
}