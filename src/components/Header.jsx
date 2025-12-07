import React from 'react';

export default function Header({ cursor, onPrev, onNext, onClear, onManageCategories, onManageTimePeriods }) {
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
            onClick={onManageTimePeriods}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 font-medium shadow-md hover:shadow-lg transition-all text-sm"
          >
            🕐 Fasce Orarie
          </button>
          <button 
            onClick={onClear}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow-md hover:shadow-lg transition-all text-sm"
          >
            🗑️ Elimina Passati
          </button>
        </div>
      </div>
    </div>
  );
}