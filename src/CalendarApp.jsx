import React, { useEffect, useMemo, useState, useCallback } from "react";

const CATEGORIES = {
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

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatISODate(d) {
  // Usa il fuso orario locale invece di UTC
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

const STORAGE_KEY = "calendar-data-v4";

export default function CalendarApp() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [data, setData] = useState({});
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize data from localStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Errore nel caricamento dei dati da localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Errore nel salvataggio dei dati in localStorage:", error);
      }
    }
  }, [data, isLoading]);

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

  const clearAll = useCallback(() => {
    if (!window.confirm("Cancellare tutti i dati salvati nel browser?")) return;
    setData({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Errore nella cancellazione dei dati:", error);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-600">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-semibold">Calendario</h1>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={prevMonth}
              className="px-3 py-2 rounded-lg shadow-sm bg-white hover:bg-neutral-50 transition-colors"
              aria-label="Mese precedente"
            >
              ◀
            </button>
            
            <div className="px-4 py-2 rounded-lg bg-white shadow-sm min-w-[140px] text-center">
              <div className="text-sm font-medium capitalize">
                {cursor.toLocaleString("it-IT", { month: "long", year: "numeric" })}
              </div>
            </div>
            
            <button 
              onClick={nextMonth}
              className="px-3 py-2 rounded-lg shadow-sm bg-white hover:bg-neutral-50 transition-colors"
              aria-label="Mese successivo"
            >
              ▶
            </button>
            
            <button 
              onClick={clearAll}
              className="px-3 py-2 rounded-lg shadow-sm bg-red-50 text-red-700 hover:bg-red-100 transition-colors ml-2"
            >
              Reset
            </button>
          </div>
        </header>

        <main className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-4'}`}>
          {/* Calendar Grid */}
          <section className={`bg-white rounded-xl shadow-sm overflow-hidden ${isMobile ? 'order-2' : 'lg:col-span-3'}`}>
            <div className="p-4 md:p-6">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3">
                {['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(d => (
                  <div key={d} className="text-center font-medium text-xs md:text-sm text-neutral-600 p-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {monthDays.map((dt, idx) => {
                  if (!dt) {
                    return <div key={idx} className="h-16 md:h-24 lg:h-28"></div>;
                  }
                  
                  const iso = formatISODate(dt);
                  const evs = eventsFor(iso);
                  const isSelected = selected === iso;
                  const isToday = iso === formatISODate(new Date());
                  
                  const uniqueCategories = [...new Set(evs.map(e => e.category))].slice(0, 3);
                  
                  return (
                    <button
                      key={iso}
                      onClick={() => setSelected(isSelected ? null : iso)}
                      className={`
                        h-16 md:h-24 lg:h-28 p-1 md:p-2 text-left border rounded-lg 
                        transition-all duration-200 flex flex-col justify-between
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-neutral-200 bg-white hover:shadow-sm hover:border-neutral-300'
                        }
                        ${isToday ? 'ring-2 ring-blue-200' : ''}
                      `}
                      aria-label={`${dt.getDate()} ${cursor.toLocaleString("it-IT", { month: "long" })}, ${evs.length} impegni`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`text-sm md:text-base font-medium ${isToday ? 'text-blue-600' : ''}`}>
                          {dt.getDate()}
                        </div>
                        {evs.length > 0 && (
                          <div className="text-xs text-neutral-500 bg-neutral-100 px-1 rounded">
                            {evs.length}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-end justify-between">
                        <div className="flex gap-1 flex-wrap">
                          {uniqueCategories.map((cat) => (
                            <span 
                              key={cat}
                              className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${CATEGORIES[cat]?.color || 'bg-gray-400'}`}
                              title={CATEGORIES[cat]?.label}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="p-4 md:p-6 bg-neutral-50 border-t">
              <div className="text-sm font-medium mb-3">Legenda</div>
              <div className="flex gap-4 flex-wrap">
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 text-sm">
                    <span className={`w-3 h-3 rounded-full ${v.color}`}></span>
                    <span>{v.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Day Panel */}
          <aside className={`bg-white rounded-xl shadow-sm ${isMobile ? 'order-1' : ''}`}>
            {selected ? (
              <DayPanel
                dateISO={selected}
                events={eventsFor(selected)}
                onAdd={(ev) => addEvent(selected, ev)}
                onRemove={(eventId) => removeEvent(selected, eventId)}
                onClose={() => setSelected(null)}
                isMobile={isMobile}
              />
            ) : (
              <div className="p-6 text-center text-neutral-500">
                <div className="text-lg mb-2">📅</div>
                <div>Seleziona un giorno per vedere gli impegni</div>
              </div>
            )}
          </aside>
        </main>

        {/* Footer with storage info */}
        <footer className="text-xs text-neutral-500 mt-6 text-center">
          Salvataggio automatico in localStorage del browser
        </footer>
      </div>
    </div>
  );
}

function DayPanel({ dateISO, events, onAdd, onRemove, onClose, isMobile }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("personal");
  const [time, setTime] = useState("08:00");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleAdd = (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;
    
    const newEvent = { 
      title: title.trim(), 
      category, 
      time, 
      createdAt: new Date().toISOString()
    };
    
    onAdd(newEvent);
    setTitle("");
    setIsFormVisible(false);
  };

  const resetForm = () => {
    setTitle("");
    setCategory('personal');
    setTime('08:00');
    setIsFormVisible(false);
  };

  // Group events by time period
  const grouped = { morning: [], day: [], evening: [] };
  events.forEach((ev) => {
    const section = sectionOf(ev.time);
    grouped[section].push(ev);
  });

  // Sort events within each period by time
  Object.values(grouped).forEach(arr => 
    arr.sort((a, b) => a.time.localeCompare(b.time))
  );

  const selectedDate = new Date(dateISO);
  const totalEvents = events.length;

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="font-semibold text-lg md:text-xl mb-1">
            {selectedDate.toLocaleDateString('it-IT', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long'
            })}
          </div>
          <div className="text-sm text-neutral-500">
            {totalEvents} {totalEvents === 1 ? 'impegno' : 'impegni'}
          </div>
        </div>
        
        {isMobile && (
          <button 
            className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        )}
      </div>

      {/* Time periods */}
      <div className="space-y-6">
        {Object.entries(TIME_PERIODS).map(([key, period]) => (
          <div key={key}>
            <div className="font-medium text-sm mb-3 text-neutral-700">
              {period.label}
            </div>
            
            {grouped[key].length === 0 ? (
              <div className="text-xs text-neutral-400 italic p-3 bg-neutral-50 rounded-lg">
                Nessun impegno
              </div>
            ) : (
              <div className="space-y-2">
                {grouped[key].map((ev) => (
                  <div 
                    key={ev.id} 
                    className="flex items-start gap-3 bg-neutral-50 p-3 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <span 
                      className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${CATEGORIES[ev.category]?.color || 'bg-gray-400'}`}
                      title={CATEGORIES[ev.category]?.label}
                    />
                    
                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-medium text-neutral-900 mb-1">
                        {ev.title}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {ev.time} • {CATEGORIES[ev.category]?.label}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onRemove(ev.id)}
                      className="text-red-600 hover:text-red-700 text-sm px-2 py-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      aria-label={`Elimina ${ev.title}`}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add event section */}
      <div className="mt-8 border-t pt-6">
        {!isFormVisible ? (
          <button
            onClick={() => setIsFormVisible(true)}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            + Aggiungi impegno
          </button>
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-medium mb-3">Nuovo impegno</div>
            
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titolo impegno"
              className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  e.preventDefault();
                  handleAdd(e);
                }
              }}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              
              <input 
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleAdd}
                disabled={!title.trim()}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                Aggiungi
              </button>
              <button 
                onClick={resetForm}
                className="flex-1 py-2 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}