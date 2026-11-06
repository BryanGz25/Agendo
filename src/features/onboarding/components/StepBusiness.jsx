import { Field, inputClass } from '../../../shared/components/ui';

export default function StepBusiness({ data, errors, update }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl font-extrabold leading-tight">
          ¿Cómo se llama tu barbería?
        </h1>
        <p className="mt-2 text-ink-soft">Así la van a ver tus clientes cuando reserven.</p>
      </div>
      <Field id="name" label="Nombre de la barbería" error={errors.name}>
        <input
          id="name"
          className={inputClass}
          autoComplete="organization"
          placeholder="Ej.: La Navaja"
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          autoFocus
        />
      </Field>
      <Field
        id="whatsapp"
        label="Tu WhatsApp"
        hint="Aquí te avisamos cada reserva nueva."
        error={errors.whatsapp}
      >
        <div className="flex">
          <span className="inline-flex items-center rounded-l-xl border border-r-0 border-line bg-paper px-3 text-muted">
            +506
          </span>
          <input
            id="whatsapp"
            className={`${inputClass} rounded-l-none`}
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="8888 1234"
            value={data.whatsapp}
            onChange={(e) => update({ whatsapp: e.target.value })}
          />
        </div>
      </Field>
      <p className="rounded-xl bg-ok-soft p-3 text-sm text-ok">
        No te pedimos datos fiscales ahora. Solo hacen falta para cobrarte cuando termine la prueba
        de 14 días.
      </p>
    </div>
  );
}
