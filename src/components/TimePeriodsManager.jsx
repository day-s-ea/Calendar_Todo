import React, { useState } from 'react';

export default function TimePeriodsManager({ timePeriods, onUpdate, onClose }) {
  const [morningStart, setMorningStart] = useState(String(timePeriods.morning.range[0]));
  const [morningEnd, setMorningEnd] = useState(String(timePeriods.morning.range[1]));
  const [dayEnd, setDayEnd] = useState(String(timePeriods.day.range[1]));
  const [eveningEnd, setEveningEnd] = useState(String(timePeriods.evening.range[1]));

  const handleSave = () => {
    const morning = parseFloat(morningStart);
    const morningEndVal = parseFloat(morningEnd);
    const day = parseFloat(dayEnd);
    const evening = parseFloat(eveningEnd);

    if (morning >= morningEndVal || morningEndVal >= day || day >= evening) {
      alert("Gli orari devono essere in ordine crescente!");
      return;
    }

    const newTimePeriods = {
      morning: { 
        label: `Mattina (${formatTime(morning)}–${formatTime(morningEndVal)})`, 
        range: [morning, morningEndVal] 
      },
      day: { 
        label: `Giornata (${formatTime(morningEndVal)}–${formatTime(day)})`, 
        range: [morningEndVal, day] 
      },
      evening: { 
        label: `Sera (${formatTime(day)}–${formatTime(evening)})`, 
        range: [day, evening] 
      },
    };

    onUpdate(newTimePeriods);
    onClose();
  };

  const formatTime = (decimal) => {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">🕐 Gestione Fasce Orarie</h2>
            <button onClick={onClose} className="text-2xl px-2">&times;</button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3">Mattina</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1">Inizio</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="23.5"
                    value={morningStart}
                    onChange={(e) => setMorningStart(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-1">{formatTime(parseFloat(morningStart))}</p>
                </div>
                <div>
                  <label className="block text-xs mb-1">Fine</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="23.5"
                    value={morningEnd}
                    onChange={(e) => setMorningEnd(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-1">{formatTime(parseFloat(morningEnd))}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold mb-3">Giornata</h3>
              <div>
                <label className="block text-xs mb-1">Inizio: Fine mattina</label>
                <label className="block text-xs mb-1">Fine</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="23.5"
                  value={dayEnd}
                  onChange={(e) => setDayEnd(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-600 mt-1">{formatTime(parseFloat(dayEnd))}</p>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold mb-3">Sera</h3>
              <div>
                <label className="block text-xs mb-1">Inizio: Fine giornata</label>
                <label className="block text-xs mb-1">Fine</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={eveningEnd}
                  onChange={(e) => setEveningEnd(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-600 mt-1">{formatTime(parseFloat(eveningEnd))}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-600 font-medium"
            >
              💾 Salva
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}