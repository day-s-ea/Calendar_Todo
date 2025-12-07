export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function formatISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function timeToDecimal(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

export function sectionOf(timeStr, timePeriods) {
  const decimal = timeToDecimal(timeStr);
  if (decimal < timePeriods.morning.range[1]) return "morning";
  if (decimal < timePeriods.day.range[1]) return "day";
  return "evening";
}

export function calculateDuration(startTime, endTime) {
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

export function addMinutesToTime(timeStr, minutes) {
  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

export function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateStr, days) {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function addMonths(dateStr, months) {
  const date = parseDate(dateStr);
  date.setMonth(date.getMonth() + months);
  return formatISODate(date);
}

export function getDayOfWeek(dateStr) {
  const date = parseDate(dateStr);
  return date.getDay();
}

export function generateRecurringDates(startDateStr, recurrenceConfig, maxDays = 365) {
  const dates = [startDateStr];
  
  if (!recurrenceConfig || recurrenceConfig.type === "none") {
    return dates;
  }
  
  const { type, interval, weekdays } = recurrenceConfig;
  let currentDateStr = startDateStr;
  let attempts = 0;
  const maxAttempts = 2000;
  
  while (attempts < maxAttempts) {
    attempts++;
    let nextDateStr = null;
    
    if (type === "days") {
      const days = parseInt(interval) || 1;
      nextDateStr = addDays(currentDateStr, days);
    } 
    else if (type === "weeks") {
      if (!weekdays || weekdays.length === 0) break;
      
      let daysToAdd = 1;
      let found = false;
      
      while (!found && daysToAdd <= 7) {
        const testDate = addDays(currentDateStr, daysToAdd);
        const dayOfWeek = getDayOfWeek(testDate);
        
        if (weekdays.includes(dayOfWeek)) {
          nextDateStr = testDate;
          found = true;
        } else {
          daysToAdd++;
        }
      }
      
      if (!found) break;
    }
    else if (type === "months") {
      const months = parseInt(interval) || 1;
      nextDateStr = addMonths(currentDateStr, months);
    }
    
    if (!nextDateStr) break;
    
    const daysDiff = Math.floor((parseDate(nextDateStr) - parseDate(startDateStr)) / (1000 * 60 * 60 * 24));
    if (daysDiff > maxDays) break;
    
    dates.push(nextDateStr);
    currentDateStr = nextDateStr;
  }
  
  return dates;
}

export function getRecurrenceDescription(recurrenceConfig) {
  if (!recurrenceConfig || recurrenceConfig.type === "none") {
    return "";
  }
  
  const { type, interval, weekdays } = recurrenceConfig;
  
  if (type === "days") {
    const days = parseInt(interval) || 1;
    return days === 1 ? "Ogni giorno" : `Ogni ${days} giorni`;
  }
  
  if (type === "weeks" && weekdays && weekdays.length > 0) {
    const dayNames = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
    const selectedDays = weekdays.map(d => dayNames[d]).join(", ");
    return `Ogni ${selectedDays}`;
  }
  
  if (type === "months") {
    const months = parseInt(interval) || 1;
    return months === 1 ? "Ogni mese" : `Ogni ${months} mesi`;
  }
  
  return "";
}