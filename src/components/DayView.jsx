import React, { useState, useMemo } from 'react';
import { formatISODate, sectionOf, addMinutesToTime } from '../utils/dateUtils';
import { DURATION_PRESETS, RECURRENCE_TYPES, WEEKDAYS } from '../utils/constants';
import EventSection from './EventSection';

export default function DayView({ 
  date, 
  events, 
  todos, 
  categories, 
  timePeriods,
  onClose, 
  onAddEvent, 
  onUpdateEvent, 
  onRemoveEvent,
  onAddTodo,
  onToggleTodo,
  onRemoveTodo
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(Object.keys(categories)[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [recurrenceType, setRecurrenceType] = useState("none");
  const [recurrenceInterval, setRecurrenceInterval] = useState("1");
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [durationType, setDurationType] = useState("custom");
  const [editingId, setEditingId] = useState(null);
  const [todoText, setTodoText] = useState("");

  const dateISO = formatISODate(date);

  const toggleWeekday = (day) => {
    setSelectedWeekdays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleDurationChange = (type) => {
    setDurationType(type);
    
    switch(type) {
      case "allday":
        setStartTime("00:00");
        setEndTime("23:59");
        break;
      case "30min":
        setEndTime(addMinutesToTime(startTime, 30));
        break;
      case "1h":
        setEndTime(addMinutesToTime(startTime, 60));
        break;
      case "2h":
        setEndTime(addMinutesToTime(startTime, 120));
        break;
      case "3h":
        setEndTime(addMinutesToTime(startTime, 180));
        break;
      case "custom":
        break;
    }
  };

  const handleStartTimeChange = (newStartTime) => {
    setStartTime(newStartTime);
    
    if (durationType !== "custom" && durationType !== "allday") {
      const minutes = {
        "30min": 30,
        "1h": 60,
        "2h": 120,
        "3h": 180,
      }[durationType];
      
      if (minutes) {
        setEndTime(addMinutesToTime(newStartTime, minutes));
      }
    }
  };

  const handleAdd = () => {
    if (!title.trim()) return;
    
    const recurrenceConfig = recurrenceType === "none" ? null : {
      type: recurrenceType,
      interval: recurrenceInterval,
      weekdays: recurrenceType === "weeks" ? selectedWeekdays : null,
    };
    
    if (editingId) {
      onUpdateEvent(dateISO, editingId, {
        title: title.trim(),
        category,
        startTime,
        endTime,
        durationType,
      });
      setEditingId(null);
    } else {
      onAddEvent(dateISO, {
        title: title.trim(),
        category,
        startTime,
        endTime,
        recurrence: recurrenceConfig,
        durationType,
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setCategory(Object.keys(categories)[0]);
    setStartTime("09:00");
    setEndTime("10:00");
    setRecurrenceType("none");
    setRecurrenceInterval("1");
    setSelectedWeekdays([]);
    setDurationType("custom");
  };

  const handleEdit = (ev) => {
    setEditingId(ev.id);
    setTitle(ev.title);
    setCategory(ev.category);
    setStartTime(ev.startTime);
    setEndTime(ev.endTime);
    setDurationType(ev.durationType || "custom");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleAddTodo = () => {
    if (!todoText.trim()) return;
    onAddTodo(dateISO, todoText.trim());
    setTodoText("");
  };

  const groupedEvents = useMemo(() => {
    const groups = { morning: [], day: [], evening: [] };
    events.forEach((ev) => {
      const section = sectionOf(ev.startTime, timePeriods);
      groups[section].push(ev);
    });
    return groups;
  }, [events, timePeriods]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-xl font-bold">
              {date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <button onClick={onClose} className="text-2xl px-2">&times;</button>
          </div>

          {/* Sezione To-Do */}
          <div className="mb-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold mb-3 text-sm sm:text-base">✅ To-Do List</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={todoText}
                  onChange={(e) => setTodoText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                  placeholder="Nuova attività..."
                  className="flex-1 border rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={handleAddTodo}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                >
                  ➕
                </button>
              </div>
              {todos.length > 0 && (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div 
                      key={todo.id}
                      className="flex items-center gap-2 p-2 bg-white rounded border border-green-100"
                    >
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => onToggleTodo(dateISO, todo.id)}
                        className="w-4 h-4 flex-shrink-0"
                      />
                      <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                        {todo.text}
                      </span>
                      <button
                        onClick={() => onRemoveTodo(dateISO, todo.id)}
                        className="text-red-500 hover:text-red-700 px-2 text-sm flex-shrink-0"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sezione Aggiungi/Modifica Evento */}
          <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-3 text-sm sm:text-base">
              {editingId ? "✏️ Modifica Evento" : "➕ Aggiungi Evento"}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titolo evento"
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(categories).map(([id, cat]) => (
                  <option key={id} value={id}>{cat.label}</option>
                ))}
              </select>

              {/* Selezione durata */}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-700">Durata</label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATION_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handleDurationChange(preset.value)}
                      className={`px-3 py-2 text-xs rounded border transition-colors ${
                        durationType === preset.value
                          ? 'bg-blue-500 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orari */}
              {durationType === "custom" && (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Inizio</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full border rounded px-2 sm:px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Fine</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full border rounded px-2 sm:px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {durationType !== "custom" && durationType !== "allday" && (
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Inizio</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full border rounded px-2 sm:px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">Fine</label>
                    <input
                      type="time"
                      value={endTime}
                      disabled
                      className="w-full border rounded px-2 sm:px-3 py-2 text-sm bg-gray-100 text-gray-500"
                    />
                  </div>
                </div>
              )}

              {/* Ricorrenza */}
              {!editingId && (
                <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700">🔁 Ripeti</label>
                    <select
                      value={recurrenceType}
                      onChange={(e) => {
                        setRecurrenceType(e.target.value);
                        setSelectedWeekdays([]);
                      }}
                      className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      {RECURRENCE_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ogni X giorni */}
                  {recurrenceType === "days" && (
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700">Ogni quanti giorni?</label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Es. 7 per ogni settimana, 15 per ogni 15 giorni"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        {recurrenceInterval === "1" ? "Ogni giorno" : `Ogni ${recurrenceInterval} giorni`}
                      </p>
                    </div>
                  )}

                  {/* Giorni della settimana */}
                  {recurrenceType === "weeks" && (
                    <div>
                      <label className="block text-xs font-medium mb-2 text-gray-700">Seleziona i giorni</label>
                      <div className="grid grid-cols-7 gap-1">
                        {WEEKDAYS.map((day) => (
                          <button
                            key={day.value}
                            onClick={() => toggleWeekday(day.value)}
                            className={`px-2 py-2 text-xs rounded border transition-colors ${
                              selectedWeekdays.includes(day.value)
                                ? 'bg-purple-500 text-white border-purple-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                            title={day.fullLabel}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                      {selectedWeekdays.length === 0 && (
                        <p className="text-xs text-red-600 mt-1">Seleziona almeno un giorno</p>
                      )}
                    </div>
                  )}

                  {/* Ogni X mesi */}
                  {recurrenceType === "months" && (
                    <div>
                      <label className="block text-xs font-medium mb-1 text-gray-700">Ogni quanti mesi?</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="Es. 1, 2, 3..."
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        {recurrenceInterval === "1" ? "Ogni mese" : `Ogni ${recurrenceInterval} mesi`}
                      </p>
                    </div>
                  )}

                  {recurrenceType !== "none" && (
                    <p className="text-xs text-orange-600">
                      ⚠️ Verrà creato per i prossimi 365 giorni
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAdd}
                  disabled={recurrenceType === "weeks" && selectedWeekdays.length === 0 && !editingId}
                  className="flex-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 font-medium text-sm shadow-md hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingId ? "💾 Salva" : "➕ Aggiungi"}
                </button>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-sm transition-colors"
                  >
                    Annulla
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Eventi suddivisi per fasce orarie */}
          <div className="space-y-4">
            {Object.entries(timePeriods).map(([key, period]) => (
              <EventSection
                key={key}
                title={period.label}
                events={groupedEvents[key]}
                categories={categories}
                dateISO={dateISO}
                onEdit={handleEdit}
                onRemove={onRemoveEvent}
                editingId={editingId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}