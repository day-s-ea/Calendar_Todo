import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEY, CATEGORIES_KEY, TODOS_KEY, TIME_PERIODS_KEY, DEFAULT_CATEGORIES, TIME_PERIODS } from '../utils/constants';
import { formatISODate, generateRecurringDates } from '../utils/dateUtils';

export function useCalendarData() {
  const [data, setData] = useState({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [todos, setTodos] = useState({});
  const [timePeriods, setTimePeriods] = useState(TIME_PERIODS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      const savedCategories = localStorage.getItem(CATEGORIES_KEY);
      const savedTodos = localStorage.getItem(TODOS_KEY);
      const savedTimePeriods = localStorage.getItem(TIME_PERIODS_KEY);
      
      if (savedData) setData(JSON.parse(savedData));
      if (savedCategories) setCategories(JSON.parse(savedCategories));
      if (savedTodos) setTodos(JSON.parse(savedTodos));
      if (savedTimePeriods) setTimePeriods(JSON.parse(savedTimePeriods));
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
        localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
        localStorage.setItem(TIME_PERIODS_KEY, JSON.stringify(timePeriods));
      } catch (error) {
        console.error("Errore nel salvataggio dei dati:", error);
      }
    }
  }, [data, categories, todos, timePeriods, isLoading]);

  const eventsFor = useCallback((dateISO) => data[dateISO] || [], [data]);
  const todosFor = useCallback((dateISO) => todos[dateISO] || [], [todos]);

  const addEvent = useCallback((dateISO, ev) => {
    const recurrence = ev.recurrence;
    const baseId = Date.now() + Math.random();
    
    if (!recurrence || recurrence.type === "none") {
      setData((old) => ({
        ...old,
        [dateISO]: [...(old[dateISO] || []), { ...ev, id: baseId, recurrence: null }]
      }));
    } else {
      const dates = generateRecurringDates(dateISO, recurrence);
      setData((old) => {
        const updated = { ...old };
        dates.forEach((date, index) => {
          const eventForDate = {
            ...ev,
            id: baseId + index * 0.001,
            recurrenceId: baseId,
            recurrence: recurrence,
          };
          updated[date] = [...(updated[date] || []), eventForDate];
        });
        return updated;
      });
    }
  }, []);

  const updateEvent = useCallback((dateISO, eventId, updatedEvent) => {
    setData((old) => {
      const updated = { ...old };
      updated[dateISO] = updated[dateISO].map(ev => 
        ev.id === eventId ? { ...ev, ...updatedEvent } : ev
      );
      return updated;
    });
  }, []);

  const removeEvent = useCallback((dateISO, eventId) => {
    setData((old) => {
      const updated = { ...old };
      const event = updated[dateISO]?.find(ev => ev.id === eventId);
      
      if (event && event.recurrenceId && event.recurrence) {
        Object.keys(updated).forEach(date => {
          updated[date] = updated[date].filter(ev => ev.recurrenceId !== event.recurrenceId);
          if (updated[date].length === 0) delete updated[date];
        });
      } else {
        updated[dateISO] = updated[dateISO].filter(ev => ev.id !== eventId);
        if (updated[dateISO].length === 0) delete updated[dateISO];
      }
      
      return updated;
    });
  }, []);

  const addTodo = useCallback((dateISO, text) => {
    setTodos((old) => ({
      ...old,
      [dateISO]: [...(old[dateISO] || []), { id: Date.now() + Math.random(), text, completed: false }]
    }));
  }, []);

  const toggleTodo = useCallback((dateISO, todoId) => {
    setTodos((old) => {
      const updated = { ...old };
      updated[dateISO] = updated[dateISO].map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      );
      return updated;
    });
  }, []);

  const removeTodo = useCallback((dateISO, todoId) => {
    setTodos((old) => {
      const updated = { ...old };
      updated[dateISO] = updated[dateISO].filter(todo => todo.id !== todoId);
      if (updated[dateISO].length === 0) delete updated[dateISO];
      return updated;
    });
  }, []);

  const addCategory = useCallback((id, label, color) => {
    setCategories(prev => ({ ...prev, [id]: { label, color } }));
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

  const updateTimePeriods = useCallback((newTimePeriods) => {
    setTimePeriods(newTimePeriods);
  }, []);

  const clearOldData = useCallback(() => {
    if (!window.confirm("Eliminare tutti gli eventi e to-do passati (prima di oggi)?")) return;
    
    const today = formatISODate(new Date());
    const updatedData = {};
    const updatedTodos = {};
    
    Object.entries(data).forEach(([dateISO, events]) => {
      if (dateISO >= today) updatedData[dateISO] = events;
    });
    
    Object.entries(todos).forEach(([dateISO, todoList]) => {
      if (dateISO >= today) updatedTodos[dateISO] = todoList;
    });
    
    setData(updatedData);
    setTodos(updatedTodos);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      localStorage.setItem(TODOS_KEY, JSON.stringify(updatedTodos));
    } catch (error) {
      console.error("Errore nella cancellazione dei dati:", error);
    }
  }, [data, todos]);

  return {
    data,
    categories,
    todos,
    timePeriods,
    isLoading,
    eventsFor,
    todosFor,
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
  };
}