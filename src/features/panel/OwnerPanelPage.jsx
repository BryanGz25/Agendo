import { Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Repeat, Target, TrendingDown } from 'lucide-react';
import { AssumptionTag, Card, SimTag } from '../../shared/components/ui';
import {
  formatMoney,
  formatMoney0,
  formatNumber,
  formatPercent,
  formatPercentFine,
} from '../../shared/utils/format';
import { UNIT_ECONOMICS } from '../../config/caseData';
import { usePanelModel } from './hooks/usePanelModel';
import FunnelChart from './components/FunnelChart';
import TargetControls from './components/TargetControls';
import LiveFunnel from './components/LiveFunnel';

function Metric({ label, today, next, better }) {
  return (
    <Card className="p-4">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">{next}</p>
      <p className={`text-sm font-semibold ${better ? 'text-ok' : 'text-accent-strong'}`}>
        Hoy: {today}
      </p>
    </Card>
  );
}

const CHANNELS = [
  {
    name: 'Insignia en cada página de reservas',
    cost: 'Casi $0',
    scale: 'Crece con cada barbería activa',
    when: 'Días 1-90: es el ciclo principal',
    quadrant: 'Barato y escalable',
  },
  {
    name: 'Barbero comparte su link con sus clientes',
    cost: '$0',
    scale: 'Lo mueve la puesta en marcha',
    when: 'Días 1-90: arreglarlo es la apuesta',
    quadrant: 'Barato y escalable',
  },
  {
    name: 'Anuncios Meta y Google',
    cost: `CAC paid ${formatMoney0(UNIT_ECONOMICS.part1CacPaid)} hoy`,
    scale: 'Escala, pero cada cliente extra cuesta más',
    when: 'Se quedan en $10.000 hasta ver el experimento',
    quadrant: 'Caro y escalable',
  },
  {
    name: 'Llamadas de Mariela',
    cost: '$1.200/mes, tope de 500 trials',
    scale: 'No escala: sube a saltos',
    when: 'Solo a los que no comparten en 24 h',
    quadrant: 'Caro y no escalable',
  },
];

/** Panel for Valeria: where the funnel breaks and what the new setup changes. */
export default function OwnerPanelPage() {
  const m = usePanelModel();
  const { today, next } = m.scenarios;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-12 pt-6">
      <header className="flex flex-col gap-2">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-muted">
          <ArrowLeft size={16} aria-hidden /> Volver al prototipo
        </Link>
        <h1 className="font-display text-3xl font-extrabold md:text-4xl">
          Panel de la puesta en marcha
        </h1>
        <p className="max-w-2xl text-ink-soft">
          Datos de hoy tomados del caso, por cada 100 trials. La meta del flujo nuevo es un{' '}
          <AssumptionTag /> del equipo que se prueba con el experimento de abajo.
        </p>
      </header>

      <Card className="border-accent/30 bg-accent-soft p-4">
        <p className="flex items-center gap-2 font-semibold text-accent-strong">
          <TrendingDown size={18} aria-hidden /> Dónde se pierde más gente hoy
        </p>
        <p className="mt-1">
          <strong>{m.bottlenecks.mostLost.label}:</strong> solo {m.bottlenecks.mostLost.completed}{' '}
          de {m.bottlenecks.mostLost.reached} lo hacen (
          {formatPercent(m.bottlenecks.mostLost.passRate)}). Se pierden{' '}
          {m.bottlenecks.mostLost.lost}, más que en los datos fiscales (26). La pantalla más lenta
          es <strong>{m.bottlenecks.slowest.label}</strong> ({m.bottlenecks.slowest.minutes} min de{' '}
          {m.totalMinutesToday}).
        </p>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <FunnelChart
            title="Hoy (datos del caso)"
            steps={m.today}
            tone="today"
            highlightId={m.bottlenecks.mostLost.id}
          />
        </Card>
        <Card className="p-4">
          <FunnelChart title="Flujo nuevo (meta)" steps={m.next} tone="next" />
        </Card>
      </section>

      <section aria-labelledby="metrics" className="flex flex-col gap-3">
        <h2 id="metrics" className="flex items-center gap-2 font-display text-2xl font-extrabold">
          <Target size={22} aria-hidden /> Qué le cambia al negocio
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric
            label="Reciben su primera reserva"
            today={formatNumber(today.booked)}
            next={formatNumber(next.booked)}
            better={next.booked >= today.booked}
          />
          <Metric
            label="Llegan a uso habitual"
            today={formatNumber(today.habitual)}
            next={formatNumber(next.habitual)}
            better={next.habitual >= today.habitual}
          />
          <Metric
            label="Conversión a pago"
            today={formatPercent(today.payRate)}
            next={formatPercent(next.payRate)}
            better={next.payRate >= today.payRate}
          />
          <Metric
            label="CAC paid ($10.000 en anuncios)"
            today={formatMoney(today.cac)}
            next={formatMoney(next.cac)}
            better={next.cac <= today.cac}
          />
        </div>
        <p className="text-sm text-ink-soft">
          Con 500 trials de anuncios: hoy {formatNumber(today.clients)} clientes y con la meta{' '}
          {formatNumber(next.clients)}. LTV a 24 meses {formatMoney(m.ltv)}: el LTV:CAC paid pasa de{' '}
          {formatNumber(m.ltv / today.cac)} a {formatNumber(m.ltv / next.cac)}. Activos a 6 meses:{' '}
          {formatPercent(today.retention6m)} hoy y {formatPercent(next.retention6m)} con la meta. El
          CAC de hoy sale {formatMoney(today.cac)} y no $180 porque el embudo da 13,88 % y no 14 %
          exacto.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <Card className="p-4">
          <TargetControls target={m.target} setTarget={m.setTarget} reset={m.reset} />
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Repeat size={18} aria-hidden /> El ciclo de la insignia
            </h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              <li>El barbero comparte su link con sus clientes.</li>
              <li>Sus clientes reservan: unas 250 visitas al mes por barbería.</li>
              <li>Un cliente que también es barbero toca la insignia.</li>
              <li>Empieza su prueba con la misma promesa y comparte su propio link.</li>
            </ol>
            <p className="mt-3 text-sm text-ink-soft">
              Hoy: {formatNumber(m.badge.todayTrials)} barberías al mes de{' '}
              {formatNumber(m.badge.visits)} visitas ({formatPercentFine(m.badge.todayConversion)}),
              porque la insignia no lleva a ningún lado. Con la meta:{' '}
              <strong>{formatNumber(m.badge.newTrials)} trials al mes</strong>, unos{' '}
              <strong>{formatNumber(m.badge.newTrials * next.payRate)} clientes</strong> con la
              conversión de la meta. Cada uno cuesta casi $0: no paga anuncios ni comisión, frente a{' '}
              {formatMoney(next.cac)} de un cliente de anuncios.
            </p>
          </Card>
          <LiveFunnel />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <FlaskConical size={18} aria-hidden /> Experimento A/B (los trials del mes que viene)
          </h3>
          <p className="mt-2 text-sm">
            <strong>Si</strong> la mitad de los trials ve la puesta en marcha nueva (plantillas,
            datos fiscales al final y compartir dentro del flujo), <strong>entonces</strong> los que
            reciben su primera reserva en la prueba pasan de{' '}
            <strong>{formatNumber(today.booked)}</strong> a{' '}
            <strong>{formatNumber(next.booked)}</strong> de cada 100,{' '}
            <strong>y vigilamos que</strong> la conversión a pago entre los que llegan al día 14 no
            baje cuando les pedimos los datos fiscales.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Número de la semana para Valeria:{' '}
            <strong>% de trials con su primera reserva en 7 días</strong>.
          </p>
        </Card>
        <Card className="overflow-x-auto p-4">
          <h3 className="font-semibold">Canales a 90 días</h3>
          <table className="mt-2 w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 pr-2 font-semibold">Canal</th>
                <th className="py-2 pr-2 font-semibold">Costo</th>
                <th className="py-2 pr-2 font-semibold">Cuadrante</th>
                <th className="py-2 font-semibold">Plan</th>
              </tr>
            </thead>
            <tbody>
              {CHANNELS.map((c) => (
                <tr key={c.name} className="border-b border-line last:border-0 align-top">
                  <td className="py-2 pr-2 font-medium">{c.name}</td>
                  <td className="py-2 pr-2">{c.cost}</td>
                  <td className="py-2 pr-2">{c.quadrant}</td>
                  <td className="py-2">{c.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <p className="flex items-center gap-2 text-xs text-muted">
        <SimTag /> Las metas del flujo nuevo y la conversión de la insignia son supuestos. Los datos
        de hoy salen del Caso B · Agendo, Parte 1 y Parte 2.
      </p>
    </main>
  );
}
