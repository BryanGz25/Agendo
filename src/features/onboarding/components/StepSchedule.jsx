import ScheduleEditor from '../../../shared/components/ScheduleEditor';

/**
 * One schedule for the whole shop, pre-filled Monday to Saturday 9:00-19:00.
 * Today barbers fill one schedule per barber per day (9 minutes, and about 40
 * questions a week to Mariela); per-barber schedules can wait.
 */
export default function StepSchedule({ data, errors, update }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl font-black leading-tight">¿Cuándo atiendes?</h1>
        <p className="mt-2 text-ink-soft">
          Dejamos el horario más común. Toca un día para cerrarlo o cambiar la hora.
        </p>
      </div>
      <ScheduleEditor
        schedule={data.schedule}
        onChange={(schedule) => update({ schedule })}
        error={errors.schedule}
      />
    </div>
  );
}
