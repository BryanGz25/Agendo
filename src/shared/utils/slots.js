const MINUTE = 60000;

function atTime(day, hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date(day);
  date.setHours(h, m, 0, 0);
  return date;
}

/**
 * Free booking slots for the next days, built from the weekly schedule and the
 * duration of the chosen service.
 * @param {{schedule:{day:number, open:boolean, start:string, end:string}[], minutes:number, taken:string[], from?:Date, days?:number}} input
 */
export function availableSlots({ schedule, minutes, taken, from = new Date(), days = 7 }) {
  const takenSet = new Set(taken);
  const result = [];
  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date(from);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + offset);
    const rule = schedule.find((d) => d.day === day.getDay());
    if (!rule?.open) continue;

    const end = atTime(day, rule.end).getTime();
    const times = [];
    for (
      let t = atTime(day, rule.start).getTime();
      t + minutes * MINUTE <= end;
      t += minutes * MINUTE
    ) {
      if (t <= from.getTime()) continue;
      const slot = new Date(t);
      if (!takenSet.has(slot.toISOString())) times.push(slot);
    }
    if (times.length) result.push({ date: day, times });
  }
  return result;
}
