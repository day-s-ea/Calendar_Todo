import React, { useEffect, useMemo, useState, useCallback } from "react";

const DEFAULT_CATEGORIES = {
  work: { label: "Lavoro", color: "bg-blue-500" },
  personal: { label: "Personale", color: "bg-green-500" },
  health: { label: "Salute", color: "bg-red-500" },
  other: { label: "Altro", color: "bg-gray-500" },
};

const TIME_PERIODS = {
  morning: { label: "Mattina (06:00–08:30)", range: [6, 8.5] },
  day: { label: "Giornata (08:30–18:00)", range: [8.5, 18] },
  evening: { label: "Sera (18:00–24:00)", range: [18, 24] },
};

const COLOR_OPTIONS = [
  { name: "Blu", class: "bg-blue-500" },
  { name: "Verde", class: "bg-green-500" },
  { name: "Rosso", class: "bg-red-500" },
  { name: "Giallo", class: "bg-yellow-500" },
  { name: "Viola", class: "bg-purple-500" },
  { name: "Rosa", class: "bg-pink-500" },
  { name: "Arancione", class: "bg-orange-500" },
  { name: "Teal", class: "bg-teal-500" },
  { name: "Indigo", class: "bg-indigo-500" },
  { name: "Grigio", class: "bg-gray-500" },
];

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function timeToDecimal(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

function sectionOf(timeStr) {
  const decimal = timeToDecimal(timeStr);
  if (decimal < TIME_PERIODS.morning.range[1]) return "morning";
  if (decimal < TIME_PERIODS.day.range[1]) return "day";
  return "evening";
}

function calculateDuration(startTime, endTime) {
  const start = timeToDecimal(startTime);
  const end = timeToDecimal(endTime);
  const duration = end - start;
  if (duration < 1) {
    return `${Math.round(duration * 60)}min`;
  } else {
    const hours = Math.floor(duration);
    const minutes = Math.round((duration - hours) * 60);
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }
}

const STORAGE_KEY = "calendar-data-v5";
const CATEGORIES_KEY = "calendar-categories-v1";

export default function CalendarApp() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [data, setData] = useState({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedCategories = localStorage.getItem(CATEGORIES_KEY);
      
      if (savedData) {
        setData(JSON.parse(savedData));
      }
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      } catch (error) {
        console.error("Errore nel salvataggio dei dati:", error);
      }
    }
  }, [data, categories, isLoading]);

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

  const eventsFor = useCallback((dateISO) => {
    return data[dateISO] || [];
  }, [data]);

  const addEvent = useCallback((dateISO, ev) => {
    setData((old) => ({
      ...old,
      [dateISO]: [...(old[dateISO] || []), { ...ev, id: Date.now() + Math.random() }]
    }));
  }, []);

  const removeEvent = useCallback((dateISO, eventId) => {
    setData((old) => {
      const updated = { ...old };
      updated[dateISO] = updated[dateISO].filter(ev => ev.id !== eventId);
      if (updated[dateISO].length === 0) delete updated[dateISO];
      return updated;
    });
  }, []);

  const addCategory = useCallback((id, label, color) => {
    setCategories(prev => ({
      ...prev,
      [id]: { label, color }
    }));
  }, []);

  const removeCategory = useCallback((id) => {
    if (Object.keys(DEFAULT_CATEGORIES).includes(id)) {
      alert("Non puoi eliminare le categorie predefinite!");
      return;
    }
    
    const hasEvents = Object.values(data).some(events => 
      events.some(event => event.category === id)
    );
    
    if (hasEvents && !window.confirm("Ci sono eventi con questa categoria. Eliminarla comunque?")) {
      return;
    }
    
    setCategories(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, [data]);

  const clearAll = useCallback(() => {
    if (!window.confirm("Cancellare tutti i dati salvati nel browser?")) return;
    setData({});
    setCategories(DEFAULT_CATEGORIES);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CATEGORIES_KEY);
    } catch (error) {
      console.error("Errore nella cancellazione dei dati:", error);
    }
  }, []);

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
          onClear={clearAll}
          onManageCategories={() => setShowCategoryManager(true)}
        />
        
        {showCategoryManager && (
          <CategoryManager
            categories={categories}
            onAdd={addCategory}
            onRemove={removeCategory}
            onClose={() => setShowCategoryManager(false)}
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
            categories={categories}
            onClose={() => setSelected(null)}
            onAddEvent={addEvent}
            onRemoveEvent={removeEvent}
          />
        )}
      </div>
    </div>
  );
}

function Header({ cursor, onPrev, onNext, onClear, onManageCategories }) {
  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4">
      <div className="flex flex-col gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">Calendario</h1>
        
        <div className="flex items-center justify-center gap-2">
          <button onClick={onPrev} className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300 flex-shrink-0 text-lg">
            ←
          </button>
          <span className="font-semibold text-center text-sm sm:text-base px-2">
            {cursor.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={onNext} className="px-3 py-1.5 bg-gray-200 rounded hover:bg-gray-300 flex-shrink-0 text-lg">
            →
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={onManageCategories}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-medium shadow-md hover:shadow-lg transition-all text-sm"
          >
            🏷️ Categorie
          </button>
          <button 
            onClick={onClear}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow-md hover:shadow-lg transition-all text-sm"
          >
            🗑️ Cancella
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryManager({ categories, onAdd, onRemove, onClose }) {
  const [newLabel, setNewLabel] = useState("");
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].class);

  const handleAdd = () => {
    if (!newLabel.trim()) {
      alert("Inserisci un nome per la categoria!");
      return;
    }
    
    const id = newLabel.toLowerCase().replace(/\s+/g, '_');
    if (categories[id]) {
      alert("Esiste già una categoria con questo nome!");
      return;
    }
    
    onAdd(id, newLabel.trim(), newColor);
    setNewLabel("");
    setNewColor(COLOR_OPTIONS[0].class);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-2xl font-bold">Gestione Categorie</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none px-2"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold mb-4 text-base sm:text-lg">✨ Crea Nuova Categoria</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Nome categoria</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Es. Sport, Studio..."
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Scegli un colore</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.class}
                      onClick={() => setNewColor(color.class)}
                      className={`${color.class} h-10 sm:h-12 rounded-lg transition-all transform hover:scale-105 ${
                        newColor === color.class 
                          ? 'ring-2 ring-gray-800 ring-offset-2' 
                          : 'ring-1 ring-gray-200'
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 font-medium shadow-md hover:shadow-lg transition-all text-sm"
              >
                ➕ Aggiungi Categoria
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-base sm:text-lg">📋 Categorie Esistenti</h3>
            <div className="space-y-2">
              {Object.entries(categories).map(([id, cat]) => (
                <div 
                  key={id} 
                  className="flex items-center justify-between p-3 sm:p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${cat.color} shadow-sm flex-shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-gray-800 text-sm sm:text-base block truncate">{cat.label}</span>
                      {Object.keys(DEFAULT_CATEGORIES).includes(id) && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded inline-block mt-1">
                          Predefinita
                        </span>
                      )}
                    </div>
                  </div>
                  {!Object.keys(DEFAULT_CATEGORIES).includes(id) && (
                    <button
                      onClick={() => onRemove(id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3 py-1.5 rounded-lg transition-colors font-medium text-sm flex-shrink-0 ml-2"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calendar({ monthDays, eventsFor, categories, onSelectDate, isMobile }) {
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

function DayCell({ date, events, categories, onClick, isMobile }) {
  if (!date) {
    return <div className="border border-gray-200 bg-gray-50 h-16 sm:h-20 md:h-24" />;
  }

  const isToday = formatISODate(date) === formatISODate(new Date());

  return (
    <div
      onClick={onClick}
      className={`border border-gray-200 p-1 sm:p-2 h-16 sm:h-20 md:h-24 cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden ${
        isToday ? 'bg-blue-50' : ''
      }`}
    >
      <div className={`text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 ${isToday ? 'text-blue-600' : ''}`}>
        {date.getDate()}
      </div>
      <div className="space-y-0.5 sm:space-y-1 overflow-hidden">
        {events.slice(0, isMobile ? 2 : 3).map((ev) => {
          const cat = categories[ev.category] || categories.other;
          return (
            <div
              key={ev.id}
              className={`text-xs ${cat.color} text-white px-1 py-0.5 rounded truncate`}
              title={ev.title}
            >
              {isMobile ? '•' : ev.title}
            </div>
          );
        })}
        {events.length > (isMobile ? 2 : 3) && (
          <div className="text-xs text-gray-500">+{events.length - (isMobile ? 2 : 3)}</div>
        )}
      </div>
    </div>
  );
}

function DayView({ date, events, categories, onClose, onAddEvent, onRemoveEvent }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(Object.keys(categories)[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const dateISO = formatISODate(date);

  const handleAdd = () => {
    if (!title.trim()) return;
    onAddEvent(dateISO, {
      title: title.trim(),
      category,
      startTime,
      endTime,
    });
    setTitle("");
    setStartTime("09:00");
    setEndTime("10:00");
  };

  const groupedEvents = useMemo(() => {
    const groups = { morning: [], day: [], evening: [] };
    events.forEach((ev) => {
      const section = sectionOf(ev.startTime);
      groups[section].push(ev);
    });
    return groups;
  }, [events]);

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

          <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-3 text-sm sm:text-base">Aggiungi Evento</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titolo evento"
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {Object.entries(categories).map(([id, cat]) => (
                  <option key={id} value={id}>{cat.label}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border rounded px-2 sm:px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border rounded px-2 sm:px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={handleAdd}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              >
                Aggiungi
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(TIME_PERIODS).map(([key, period]) => (
              <EventSection
                key={key}
                title={period.label}
                events={groupedEvents[key]}
                categories={categories}
                dateISO={dateISO}
                onRemove={onRemoveEvent}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventSection({ title, events, categories, dateISO, onRemove }) {
  if (events.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm sm:text-base">{title}</h3>
      <div className="space-y-2">
        {events.map((ev) => {
          const cat = categories[ev.category] || categories.other;
          return (
            <div key={ev.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded gap-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded ${cat.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base truncate">{ev.title}</div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {ev.startTime} - {ev.endTime} ({calculateDuration(ev.startTime, ev.endTime)})
                  </div>
                </div>
              </div>
              <button
                onClick={() => onRemove(dateISO, ev.id)}
                className="text-red-500 hover:text-red-700 flex-shrink-0 px-2"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}