# AgroGuía Perú | Asistente de Sanidad Vegetal y Dosificación

**Carrera:** Escuela Profesional de Ingeniería de Sistemas  
**Universidad:** Universidad Nacional José Faustino Sánchez Carrión (UNJFSC - Huacho)  
**Curso:** Sistemas de Expertos  
**Docente:** Ing. Juan C. Meyhuay Fidel  

---

## 🌾 Sobre el Proyecto

**AgroGuía Perú** es una aplicación web responsiva (móvil y PC) diseñada como un **Sistema Basado en el Conocimiento (SBC)** y **Sistema de Producción** de alta usabilidad, enfocado en resolver las necesidades prácticas de los agricultores y técnicos de campo de la costa y valles interandinos peruanos.

A diferencia de interfaces saturadas con emojis o jerga técnica de laboratorio, **AgroGuía Perú** prioriza una experiencia humana, directa y accesible:
- **Tipografía accesible:** Fuente *Atkinson Hyperlegible Next* almacenada localmente para lectura nítida bajo el sol del campo.
- **Sin saturación de emojis:** Iconografía limpia vectorial (SVG) e insignias técnicas sobrias.
- **Fotografías 100% reales:** 21 imágenes botánicas y entomológicas verificadas (daño real en hojas por oruga, rancha en hoja de papa, gorgojo de los Andes, mosca blanca, ácaros).
- **Modo Docente integrado:** Un panel lateral deslizable (*Slide-over Drawer*) para que el estudiante pueda sustentar ante el docente la base de reglas, la traza de encadenamiento hacia adelante (*Forward Chaining*), la justificación *Why/How* y descargar el código fuente en **CLIPS 6.30**.

---

## 📐 El Flujo Fitosanitario en 5 Pasos

```text
[ PASO 1: CULTIVO ]
  -> Maíz, Papa, Palto, Tomate (acota el espacio de búsqueda del SE)

[ PASO 2: SÍNTOMAS ]
  -> Detección por órgano: Hojas, Cogollo/Tallo, Fruto/Tubérculo, Raíz/General

[ PASO 3: DIAGNÓSTICO ]
  -> Identificación de plaga/patógeno + Factor de Certeza (CF) + Estatus SENASA

[ PASO 4: TRATAMIENTO ]
  -> Control Químico (carencia/reingreso) + Control Biológico + Manejo de Chacra

[ PASO 5: CALCULADORA AGRÍCOLA ]
  -> Conversión según Hectáreas / Topos / m² a dosis por mochila de 20L o cilindro de 200L
```

---

## 📁 Estructura del Proyecto

```text
agroguia-peru/
├── index.html                   # Aplicación principal humana y responsive
├── README.md                    # Documentación técnica y agronómica
├── clips/
│   └── sistema_experto_agricola.clp # Código fuente ejecutable en CLIPS 6.30
├── docs/                        # Capturas de pantalla para informe y sustentación
│   └── capturas/
└── assets/
    ├── css/
    │   └── app.css              # Sistema de diseño, Atkinson Hyperlegible Next y bandas SENASA
    ├── fonts/                   # Tipografías WOFF2 locales para uso offline
    │   ├── atkinson-next-latin.woff2
    │   └── atkinson-next-latin-ext.woff2
    ├── img/                     # 33 fotografías botánicas y entomológicas reales
    └── js/
        ├── knowledge_base.js    # Base de conocimiento (Cultivos, Síntomas, Reglas)
        ├── inference_engine.js  # Motor de inferencia (Matching, Conjunto de Conflicto, Modus Ponens)
        ├── explanation.js       # Subsistema de explicación (¿Por qué? y ¿Cómo?)
        ├── calculator.js        # Calculadora de dosificación por mochila y cilindro
        ├── clips_code.js        # Código CLIPS embebido para visualización offline
        └── app.js               # Controlador interactivo de interfaz y modal docente
```

---

## 🚀 Cómo Abrir la Aplicación

Abra directamente el archivo en su navegador web:
https://deluxe-dango-fe8e64.netlify.app
