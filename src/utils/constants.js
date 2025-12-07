export const DEFAULT_CATEGORIES = {
  work: { label: "Lavoro", color: "bg-blue-500" },
  personal: { label: "Personale", color: "bg-green-500" },
  health: { label: "Salute", color: "bg-red-500" },
  other: { label: "Altro", color: "bg-gray-500" },
};

export const TIME_PERIODS = {
  morning: { label: "Mattina (06:00–08:30)", range: [6, 8.5] },
  day: { label: "Giornata (08:30–18:00)", range: [8.5, 18] },
  evening: { label: "Sera (18:00–24:00)", range: [18, 24] },
};

export const COLOR_OPTIONS = [
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

export const RECURRENCE_TYPES = [
  { value: "none", label: "Non ripetere" },
  { value: "days", label: "Ogni X giorni" },
  { value: "weeks", label: "Giorni della settimana" },
  { value: "months", label: "Ogni X mesi" },
];

export const WEEKDAYS = [
  { value: 1, label: "Lun", fullLabel: "Lunedì" },
  { value: 2, label: "Mar", fullLabel: "Martedì" },
  { value: 3, label: "Mer", fullLabel: "Mercoledì" },
  { value: 4, label: "Gio", fullLabel: "Giovedì" },
  { value: 5, label: "Ven", fullLabel: "Venerdì" },
  { value: 6, label: "Sab", fullLabel: "Sabato" },
  { value: 0, label: "Dom", fullLabel: "Domenica" },
];

export const DURATION_PRESETS = [
  { label: "Personalizza", value: "custom" },
  { label: "Tutto il giorno", value: "allday" },
  { label: "30 min", value: "30min" },
  { label: "1 ora", value: "1h" },
  { label: "2 ore", value: "2h" },
  { label: "3 ore", value: "3h" },
];

export const STORAGE_KEY = "calendar-data-v6";
export const CATEGORIES_KEY = "calendar-categories-v1";
export const TODOS_KEY = "calendar-todos-v1";
export const TIME_PERIODS_KEY = "calendar-time-periods-v1";