# HIMNAE

App web para registrar el gimnasio, el deporte y la alimentación, con niveles, récords y gráficas de progreso. Sin frameworks ni dependencias: HTML, CSS y JavaScript con módulos.

## Pantallas

| Pestaña | Qué hace |
|---|---|
| **Hoy** | El día como una barra olímpica: cada objetivo cumplido carga un disco (energía o comidas, proteína, agua, suplementos, entreno). También muestra el nivel, la XP, la racha, las metas del día, la suplementación y el peso. |
| **Entreno** | **Entreno guiado**: eliges tipo (cardio, HIIT, piernas, core, tren superior, full body, movilidad), duración, nivel y material, y la app crea un circuito que sigues paso a paso con animaciones de cada ejercicio, temporizador y descansos. También registro manual de sesiones de fuerza, solo cardio, mixto, deporte o movilidad. Cada ejercicio lleva su grupo muscular, sus series (kg × reps, o nombre / tiempo / reps / descanso para cardio y abdominales), el equipo, el agarre, la mano y cómo te ha ido (bien / regular / mal). |
| **Comida** | Comidas por franjas, con calorías y macros opcionales o en modo "sin calorías". Las comidas frecuentes se añaden con un toque. |
| **Cuerpo** | Muñeco con 8 puntos de medida, una fecha por medición, gráficas que comparan derecha e izquierda y un historial. |
| **Metas** | Metas propias diarias, semanales, mensuales y anuales: se marcan como hechas o se van sumando hasta una cifra. Incluye los objetivos automáticos y la copia de seguridad. |
| **Progreso** | Evolución de los pesos por ejercicio (peso máximo, 1RM estimado o volumen), músculos trabajados, constancia, volumen semanal, marcas y medallas. |

## Estructura

```
index.html        Esqueleto de la página
site.webmanifest  Nombre e iconos para instalar la app en el móvil
assets/icons/     Icono de la app en todos los tamaños
css/              Estilos: tokens, base, componentes y pantallas
js/
  main.js         Arranque y render
  events.js       Reparte los eventos a las acciones
  config/         Catálogos (ejercicios, medidas...) y ajustes por defecto
  core/           Estado, modelo de día, guardado, utilidades
  domain/         Lógica: entrenos, comida, suplementos, metas, medidas, XP
  ui/             Gráficas, muñeco y piezas comunes
  views/          Una pantalla por archivo
  player/         Reproductor del entreno guiado
  sheets/         Formularios (sesión, comida, suplementos)
  actions/        Qué hace cada botón, por área
scripts/          Build a un único archivo
docs/             Documentación de arquitectura
```

La explicación completa de capas, flujo de datos y modelo de datos está en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Cómo usarla

**En GitHub Pages:** Settings → Pages → rama `main`, carpeta `/ (root)`. La app quedará en `https://sandrarive.github.io/HIMNAE/`.

**En local:** como usa módulos de JavaScript, hay que abrirla con un servidor (no con doble clic):

```bash
npm run dev          # http://localhost:8080
```

También vale la extensión **Live Server** de VS Code (clic derecho en `index.html` → *Open with Live Server*).

**Versión de un solo archivo:** para tenerla en un único HTML que se abre con doble clic:

```bash
npm install
npm run build        # genera dist/himnae.html
```

## Instalarla en el móvil

Abre la web en el navegador del móvil y elige **Añadir a pantalla de inicio**: aparecerá con el icono de HIMNAE como una app más.

## Datos

Los datos se guardan en el navegador donde uses la app. Para pasarlos a otro dispositivo: **Metas → Tus datos → Copiar copia de seguridad**, y en el otro, pega el texto en **Restaurar**.
