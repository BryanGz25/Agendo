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

## La web

Sitio completo con identidad de barbería (espresso, latón y los rojos y azules del poste; Playfair Display, Oswald e Inter) y tres espacios:

### 1. Sitio público y registro

| Ruta               | Qué es                                                                                                                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | Landing con una **escena 3D ligada al scroll** (Three.js): un poste de barbería que gira, tijeras que se abren, navaja, peine y polvo dorado. La cámara y los objetos se mueven por cada sección. Arranca con la promesa del anuncio: «Más clientes para tu barbería» |
| `/empezar`         | Setup en 3 pasos: nombre y WhatsApp, plantilla de servicios (corte, barba y corte con barba, de $8 a $15) y horario de lunes a sábado de 9 a 19. Sin datos fiscales                                                                                                   |
| `/listo/:barbería` | Compartir el link por WhatsApp o Instagram con el mensaje listo, y aviso en vivo de la primera reserva                                                                                                                                                                |
| `/b/:barbería`     | Página pública de reservas, con la insignia nueva que cierra el ciclo (`?ref=`)                                                                                                                                                                                       |
| `/mis-citas`       | **Panel del cliente final**: sus citas por WhatsApp, cancelar, escribir a la barbería y reservar de nuevo                                                                                                                                                             |

### 2. Panel de la barbería (`/ingresar` → `/app/:barbería`)

Inicio con citas de hoy, reservas y cobros de 7 días y avance hacia las 20 citas del uso habitual · Agenda (próximas y pasadas; marcar atendida, no llegó o cancelada; agregar citas) · Clientes · Mi página · Servicios · Horario · Plan y cobro (mensual $25 o anual $240, y los datos fiscales que se piden al final de la prueba).

### 3. Panel administrativo de Valeria (`/admin`)

Resumen de la plataforma (barberías, MRR, % con primera reserva en 7 días, conversión a pago, origen por anuncios o insignia, registros por semana) · Barberías (filtros por estado y acceso a su panel) · Reservas (cobrado y % de ausencias) · Embudo y meta (el modelo de la Parte 2 con los datos del caso, la meta editable, el experimento A/B y los canales a 90 días).

**Acceso de demostración:** el PIN es `agendo` (se cambia con `VITE_ADMIN_PIN`). Desde el resumen se cargan **100 barberías simuladas** con las proporciones del caso, todas marcadas como «Simulado». En `/ingresar` está el botón para entrar a una barbería de demostración.

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
| `VITE_ADMIN_PIN`  | PIN de demostración del panel de Valeria (por defecto `agendo`)                              |
| `VITE_PUBLIC_URL` | URL pública con la que se arman los links que comparte el barbero. Vacía = el dominio actual |
| `BASE_PATH`       | Sub-ruta del build (la usa GitHub Pages: `/Agendo/`)                                         |

## Arquitectura

Vite + React 19 + Tailwind CSS 4 + React Router 7 + Three.js + GSAP, organizado por funcionalidad:

```
src/
├── app/            # rutas y providers
├── config/         # caseData.js: todos los datos del caso, y los supuestos aparte
├── features/
│   ├── landing/    # sitio público y escena 3D (three/BarberScene.js)
│   ├── onboarding/ # setup de 3 pasos
│   ├── share/      # compartir el link y primera reserva
│   ├── booking/    # página pública de reservas, insignia y «Mis citas»
│   ├── studio/     # panel de la barbería
│   └── admin/      # panel de Valeria y modelo de growth
├── services/       # almacenamiento, eventos y analítica del embudo
├── shared/         # componentes, hooks y utilidades
└── styles/         # tokens de diseño
```

### Decisiones técnicas

- **Sin backend, pero funciona entre celulares.** El link de reservas lleva los datos públicos de la barbería (nombre, WhatsApp, servicios y horario) en el fragmento `#d=`. El fragmento nunca llega a un servidor y no incluye datos fiscales ni de cobro. Así, el link abre en el celular de cualquier cliente, y la reserva le llega al barbero por WhatsApp.
- **Persistencia detrás de un contrato.** `services/businessRepository.js` y `services/analytics.js` usan `localStorage` con respaldo en memoria. Sus funciones son el contrato que implementaría una API real (REST o un webhook de n8n), sin tocar las pantallas.
- **Fórmulas probadas.** `features/admin/utils/growthModel.js` reproduce los números del caso y tiene pruebas: 74 %, 94,6 %, 92,9 %, 95,4 % y 48,4 % por pantalla, 13,88 % de pago, CAC paid de $180 con el 14 % y LTV de $251,39.
- **3D sin bloquear la carga.** Three.js se descarga después de pintar la página, el render se limita a 1,75× de densidad, hay menos partículas en el celular y, con «reducir movimiento» activado, la escena queda quieta. Sin WebGL se ve un fondo estático.
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
