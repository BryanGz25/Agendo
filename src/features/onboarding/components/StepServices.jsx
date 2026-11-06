import ServicesEditor from '../../../shared/components/ServicesEditor';

/**
 * Template instead of a blank form: 90 % of barbershops offer these three
 * services and the most common prices are $8 to $15 (Parte 2). Durations are
 * a team assumption and editable.
 */
export default function StepServices({ data, errors, update }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl font-black leading-tight">
          Tus servicios ya están listos
        </h1>
        <p className="mt-2 text-ink-soft">
          Son los que ofrece casi toda barbería. Ajusta el precio si quieres y sigue.
        </p>
      </div>
      <ServicesEditor
        services={data.services}
        onChange={(services) => update({ services })}
        error={errors.services}
      />
    </div>
  );
}
