import React, { useState } from 'react';
import { COLOR_OPTIONS, DEFAULT_CATEGORIES } from '../utils/constants';

export default function CategoryManager({ categories, onAdd, onRemove, onClose }) {
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