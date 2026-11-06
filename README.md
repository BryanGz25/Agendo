# Agendo · Nueva puesta en marcha

Prototipo funcional del **Caso B · Agendo (Parte 2)**: lo que ve un barbero desde que toca el anuncio hasta que recibe su primera reserva por el link, en menos de 5 minutos desde el celular.

> «Rediseñen la puesta en marcha para que más barberías lleguen a su primera reserva». Valeria Ortiz, CEO de Agendo

## El problema, con los datos del caso

|                                          | Hoy                                                      |
| ---------------------------------------- | -------------------------------------------------------- |
| Pantallas antes de tener la página lista | 4, y la primera pide datos fiscales                      |
| Tiempo del setup                         | 28 min (12 en servicios)                                 |
| **Comparten su link el primer día**      | **30 de 62 (48,4 %)**: el paso donde más gente se pierde |
| Reciben su primera reserva en la prueba  | 38 de 100                                                |
| Conversión a pago                        | 13,88 % (cuadra con el 14 % de la Parte 1)               |
| CAC paid                                 | ≈ $180                                                   |

## La solución

| Pantalla                        | Qué resuelve                                                                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entrada**                     | Arranca con la promesa del anuncio: «Más clientes para tu barbería»                                                                                      |
| **Setup en 3 pasos**            | Nombre y WhatsApp · plantilla de servicios (corte, barba y corte con barba, de $8 a $15) · horario de lunes a sábado de 9 a 19. Sin datos fiscales       |
| **Compartir**                   | El link y el mensaje listo son la pantalla entera: WhatsApp, Instagram y otras apps                                                                      |
| **Primera reserva**             | Aviso en vivo cuando entra la primera reserva (real o simulada)                                                                                          |
| **Página de reservas**          | El cliente elige servicio, día y hora, y avisa a la barbería por WhatsApp                                                                                |
| **Insignia nueva**              | «¿Tienes una barbería? Recibe más clientes. Prueba 14 días gratis». Lleva al registro con `?ref=` para medir el ciclo                                    |
| **Agenda del barbero**          | Citas, avance hacia las 20 citas del uso habitual, y datos de cobro para después                                                                         |
| **Panel de Valeria** (`/panel`) | Embudo de hoy contra la meta, conversión, CAC paid, ciclo de la insignia, experimento A/B, canales a 90 días y los recorridos reales de este dispositivo |

**Meta (supuesto del equipo):** 85 de 100 terminan el setup y 60 comparten el link. Con eso, 62,6 reciben su primera reserva, la conversión a pago sube a **21,5 %** y el CAC paid baja a **$124**. El detalle está en la [ficha de growth](docs/ficha-growth.md).

## Cómo correrlo

Requiere Node 20 o más reciente.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Comando           | Qué hace                                                  |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo                                    |
| `npm run build`   | Build de producción en `dist/`                            |
| `npm run preview` | Sirve el build localmente                                 |
| `npm test`        | Pruebas (Vitest): fórmulas del caso, horarios y teléfonos |
| `npm run lint`    | ESLint                                                    |

## Despliegue

- **GitHub Pages:** el workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) corre lint, pruebas y build en cada push a `main` y publica en `https://<usuario>.github.io/Agendo/`. Hay que activarlo una vez en **Settings → Pages → Source: GitHub Actions**.
- **Vercel o Netlify:** importar el repositorio. `vercel.json` y `public/_redirects` ya traen las reglas para las rutas de la app.

Variables de entorno (ver [`.env.example`](.env.example)):

| Variable          | Uso                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `VITE_PUBLIC_URL` | URL pública con la que se arman los links que comparte el barbero. Vacía = el dominio actual |
| `BASE_PATH`       | Sub-ruta del build (la usa GitHub Pages: `/Agendo/`)                                         |

## Arquitectura

Vite + React 19 + Tailwind CSS 4 + React Router 7, organizado por funcionalidad:

```
src/
├── app/            # rutas y providers
├── config/         # caseData.js: todos los datos del caso, y los supuestos aparte
├── features/
│   ├── landing/    # promesa del anuncio
│   ├── onboarding/ # setup de 3 pasos
│   ├── share/      # compartir el link y primera reserva
│   ├── booking/    # página pública de reservas e insignia
│   ├── agenda/     # inicio del barbero y datos de cobro
│   └── panel/      # panel de Valeria y modelo de growth
├── services/       # almacenamiento, eventos y analítica del embudo
├── shared/         # componentes, hooks y utilidades
└── styles/         # tokens de diseño
```

### Decisiones técnicas

- **Sin backend, pero funciona entre celulares.** El link de reservas lleva los datos públicos de la barbería (nombre, WhatsApp, servicios y horario) en el fragmento `#d=`. El fragmento nunca llega a un servidor y no incluye datos fiscales ni de cobro. Así, el link abre en el celular de cualquier cliente, y la reserva le llega al barbero por WhatsApp.
- **Persistencia detrás de un contrato.** `services/businessRepository.js` y `services/analytics.js` usan `localStorage` con respaldo en memoria. Sus funciones son el contrato que implementaría una API real (REST o un webhook de n8n), sin tocar las pantallas.
- **Fórmulas probadas.** `features/panel/utils/growthModel.js` reproduce los números del caso y tiene pruebas: 74 %, 94,6 %, 92,9 %, 95,4 % y 48,4 % por pantalla, 13,88 % de pago, CAC paid de $180 con el 14 % y LTV de $251,39.
- **Lo simulado se marca.** Todo lo inventado para la demostración lleva la etiqueta «Simulado» y las metas llevan «Supuesto», como pide el reglamento.

### Límites conocidos (próximos pasos para producción real)

| Límite                                                                                                                                            | Siguiente paso                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Las reservas y la agenda se guardan en el navegador de cada dispositivo; dos clientes en celulares distintos no ven los horarios que tomó el otro | Backend con base de datos (por ejemplo Supabase, o n8n con una base) que implemente el contrato del repositorio |
| El pago por adelantado y el recordatorio están simulados                                                                                          | Pasarela de pago (Tilopay, ONVO o SINPE Móvil) y la API de WhatsApp Business                                    |
| El link es largo porque lleva los datos de la barbería                                                                                            | Links cortos `/b/<barbería>` cuando haya backend                                                                |
| La analítica cuenta solo los recorridos de este dispositivo                                                                                       | Enviar los mismos eventos a un endpoint de analítica                                                            |

## Licencia

Proyecto educativo del Caso B · Agendo (FC Studio). Caso ficticio con fines educativos.
