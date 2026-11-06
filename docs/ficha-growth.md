# Ficha de growth · Agendo · Caso B, Parte 2

> Todas las cifras son por cada 100 trials y salen del caso, salvo las marcadas como **SUPUESTO**. Las cuentas están programadas y probadas en [`src/features/admin/utils/growthModel.js`](../src/features/admin/utils/growthModel.js).

## 1. Dónde se pierde más gente hoy

| Pantalla                 | Llegan → terminan | Pasa       | Se pierden | Tiempo     |
| ------------------------ | ----------------- | ---------- | ---------- | ---------- |
| 1. Datos fiscales        | 100 → 74          | 74,0 %     | 26         | 4 min      |
| 2. Datos del negocio     | 74 → 70           | 94,6 %     | 4          | 3 min      |
| 3. Servicios             | 70 → 65           | 92,9 %     | 5          | **12 min** |
| 4. Horarios              | 65 → 62           | 95,4 %     | 3          | 9 min      |
| 6. **Compartir el link** | 62 → 30           | **48,4 %** | **32**     | —          |

- **Donde más gente se pierde es al compartir el link: 32 de 62 no lo comparten el primer día.** Pierde más que los datos fiscales (26), que es donde apuntaba la llamada de Mariela.
- La pantalla más lenta es **Servicios**, con 12 de los 28 minutos.
- **Cómo lo arregla el diseño:** el link y el mensaje listo son la pantalla siguiente al setup, con botones para WhatsApp e Instagram. Los datos fiscales pasan al final de la prueba, y los servicios y el horario vienen como plantillas.

**Comprobación con la Parte 1:** 38 sin configurar × 1 % + 24 configurados sin reserva × 5 % + 16 con reserva × 15 % + 22 en uso habitual × 45 % = **13,88 % paga**. Cuadra con el 14 % de la Parte 1.

## 2. Hábito, aha y setup (de atrás para adelante)

|                  | Definición                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Hábito**       | 20 o más citas en los 14 días de prueba (uso habitual). El 45 % de estos paga y el 80 % sigue activo a los 6 meses |
| **Aha**          | La primera reserva que entra por el link. Sin compartir, solo 11 de 32 la reciben; compartiendo, 27 de 30          |
| **Setup mínimo** | Nombre, WhatsApp, servicios de plantilla y horario de plantilla. Nada más hace falta para recibir una reserva      |

## 3. El ciclo

```
Barbería activa ──comparte su link──▶ sus clientes reservan (≈250 visitas/mes)
       ▲                                         │
       │                              ven la insignia nueva
       │                     "¿Tienes una barbería? Prueba 14 días gratis"
       │                                         │
       └──── comparte su propio link ◀── otro barbero empieza su prueba (?ref=)
```

- Hoy la insignia solo dice el nombre y no lleva a ningún lado: trae **8 barberías al mes** de unas 287.500 visitas (1.150 × 250), un 0,0028 %.
- Con un link y la misma promesa del anuncio, la meta es un **0,02 % de las visitas** (**SUPUESTO**): unos **57 trials al mes**.
- Un cliente que llega por el ciclo cuesta casi **$0**: no paga anuncios ni la comisión de $20.

## 4. La meta y lo que cambia en el negocio

| Métrica                                                                         | Hoy    | Meta (SUPUESTO) |
| ------------------------------------------------------------------------------- | ------ | --------------- |
| Terminan el setup                                                               | 62     | **85**          |
| Comparten el link el primer día                                                 | 30     | **60**          |
| Reciben su primera reserva                                                      | 38     | **62,6**        |
| Llegan a uso habitual (se mantiene la proporción de 22 por cada 38 con reserva) | 22     | **36,2**        |
| Conversión a pago                                                               | 13,9 % | **21,5 %**      |
| CAC paid con $10.000 en anuncios y 500 trials                                   | $181   | **$124**        |
| LTV:CAC paid (LTV a 24 meses: $251,39)                                          | 1,4    | **2,0**         |

CAC paid = (10.000 + 1 vendedora × 1.200 + clientes × 20) / clientes. Con el 14 % exacto de la Parte 1 da $180.

## 5. El número de la semana

**% de trials que reciben su primera reserva en los primeros 7 días.** Es el aha, se mide antes de que termine la prueba y adelanta la conversión a pago.

## 6. Matriz de canales a 90 días

|            | **Escalable**                                                                                                                                                      | **No escalable**                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| **Barato** | Insignia en cada página de reservas · el barbero comparte su link → **foco de los 90 días**                                                                        | Mariela atiende solo a los que no compartieron en 24 h   |
| **Caro**   | **Anuncios Meta y Google**: se quedan en $10.000 hasta ver el experimento. Si el CAC paid baja a ~$124, se vuelve a evaluar escalar con el simulador de la Parte 1 | Llamar a cada trial (hoy, con tope de 500 por vendedora) |

## 7. El experimento

> **Si** la mitad de los trials del mes que viene ve la puesta en marcha nueva (plantillas, datos fiscales al final y compartir dentro del flujo), **entonces** los que reciben su primera reserva en la prueba pasan de **38 a 63 de cada 100**, **y vigilamos que** la conversión a pago entre los que llegan al día 14 no baje cuando les pedimos los datos fiscales.

- Prueba A/B: se asigna al azar al registrarse.
- Tamaño: unos 500 trials al mes, 250 por grupo.
- Si sale mal (la contramétrica empeora), se piden los datos fiscales el día 7 en lugar del 14 y se repite la prueba.

## 8. Recompensas

El prototipo **no usa recompensas** (como un mes gratis por referido): el ciclo funciona con la insignia y el link. Si se agregan, cada recompensa tiene que costar menos que lo que se ahorra frente a un cliente de anuncios (~$124 con la meta).

## 9. En qué se equivocó o nos confundió la IA

| Qué dijo la IA                                                                                            | Por qué estaba mal                                                                    | Cómo se corrigió                                                      |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Sugirió cambiar la promesa «Más clientes para tu barbería» por «Deja de perder citas»                     | Opinó sin tener el enunciado: la Parte 2 exige arrancar por lo que promete el anuncio | Se contrastó con el PDF de la Parte 2 y se dejó la promesa original   |
| Propuso agregar una pantalla para ofrecer el plan anual                                                   | La Parte 2 no la pide, y el reglamento advierte contra «pantallas que nadie pidió»    | Se dejó fuera del flujo                                               |
| Al construir, el mensaje para compartir mostraba un link muy largo que desbordaba la pantalla del celular | El link lleva los datos de la barbería                                                | Se muestra una versión corta del link y el mensaje se ajusta al ancho |
| _(Llenar con lo que le pase al equipo)_                                                                   |                                                                                       |                                                                       |
