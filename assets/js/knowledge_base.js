/**
 * AGROGUÍA PERÚ - BASE DE CONOCIMIENTO FITOSANITARIA
 * Asignatura: Sistemas de Expertos (FIISI - UNJFSC)
 * Basado en la metodología del Ing. Juan C. Meyhuay Fidel
 * 
 * Contiene:
 * - Ontología de Cultivos (Maíz, Papa, Palto, Tomate)
 * - Base de Hechos observables (Síntomas por órgano) con fotos reales verificadas
 * - Reglas de Producción con diagnósticos, tratamientos y dosis base por hectárea
 */

const KNOWLEDGE_BASE = {
  // =========================================================================
  // 1. CULTIVOS (NIVEL 0: CONTEXTO DE BÚSQUEDA)
  // =========================================================================
  crops: [
    {
      id: "maiz",
      name: "Maíz",
      scientificName: "Zea mays",
      varieties: "Choclo y Amarillo Duro",
      zone: "Costa (Barranca, Huacho, Cañete) y Valles Interandinos",
      image: "assets/img/cultivo_maiz.jpg",
      summary: "Cereal de gran importancia económica. Vulnerable en etapa temprana a orugas de cogollo y en floración a manchas foliares."
    },
    {
      id: "papa",
      name: "Papa",
      scientificName: "Solanum tuberosum",
      varieties: "Canchán, Amarilla, Peruanita y Blanca",
      zone: "Sierra Central y Valles Costeros",
      image: "assets/img/cultivo_papa.jpg",
      summary: "Cultivo andino milenario. Muy vulnerable a pudriciones foliares por alta humedad (rancha) y a insectos perforadores del tubérculo."
    },
    {
      id: "palto",
      name: "Palto",
      scientificName: "Persea americana",
      varieties: "Hass y Fuerte",
      zone: "Valles Costeros (Huaral, Huacho, Chao, Olmos) y Quebradas",
      image: "assets/img/cultivo_palto.jpg",
      summary: "Frutal de exportación. Sensible al encharcamiento en raíz y al ataque de ácaros en climas secos y caminos con polvo."
    },
    {
      id: "tomate",
      name: "Tomate",
      scientificName: "Solanum lycopersicum",
      varieties: "Riñón, Río Grande y Santa Clara",
      zone: "Valles de Costa (Chimbote, Casma, Ica)",
      image: "assets/img/cultivo_tomate.jpg",
      summary: "Hortaliza intensiva de ciclo corto. Muy propensa a insectos chupadores transmisores de virus y a polillas que barrenan la fruta."
    }
  ],

  // =========================================================================
  // 2. CATÁLOGO DE SÍNTOMAS OBSERVABLES (NIVEL 1: BASE DE HECHOS)
  // =========================================================================
  symptoms: [
    // --- MAÍZ ---
    {
      id: "s_mz_hojas_mordidas",
      cropId: "maiz",
      organ: "Hojas",
      name: "Hojas comidas con agujeros irregulares o partes transparentes",
      description: "Las hojas jóvenes muestran mordeduras evidentes o áreas rasgadas con ventanas transparentes.",
      image: "assets/img/sintoma_maiz_cogollero.jpg"
    },
    {
      id: "s_mz_aserrin_cogollo",
      cropId: "maiz",
      organ: "Cogollo",
      name: "Residuo marrón húmedo (tipo aserrín) dentro del cogollo",
      description: "Acumulación de excremento de oruga en el centro donde nacen las hojas tiernas de la mata.",
      image: "assets/img/sintoma_maiz_cogollo.jpg"
    },
    {
      id: "s_mz_retraso_crecimiento",
      cropId: "maiz",
      organ: "Planta",
      name: "Plantas enanas con punto central marchito o quebrado",
      description: "La mata no desarrolla su tamaño habitual y el ápice central se seca prematuramente.",
      image: "assets/img/sintoma_maiz_retraso.jpg"
    },
    {
      id: "s_mz_puntos_negros_hojas",
      cropId: "maiz",
      organ: "Hojas",
      name: "Puntos o costras negras con relieve (aspecto de gotas de brea)",
      description: "Manchitas circulares oscuras y brillantes que cubren las hojas restando área verde.",
      image: "assets/img/sintoma_maiz_asfalto.jpg"
    },
    {
      id: "s_mz_secado_follaje",
      cropId: "maiz",
      organ: "Hojas",
      name: "Secado prematuro de las hojas con bordes amarillentos",
      description: "El follaje se seca con rapidez desde la punta hacia adentro reduciendo el llenado de mazorca.",
      image: "assets/img/sintoma_maiz_tizon.jpg"
    },
    {
      id: "s_mz_amarilleo_v",
      cropId: "maiz",
      organ: "Hojas",
      name: "Amarillamiento en forma de 'V' en hojas de abajo",
      description: "El color amarillo inicia en la punta de las hojas basales y avanza por la nervadura central.",
      image: "assets/img/sintoma_maiz_clorosis.jpg"
    },

    // --- PAPA ---
    {
      id: "s_pp_manchas_acuosas",
      cropId: "papa",
      organ: "Hojas",
      name: "Manchas oscuras húmedas en hojas (aspecto de quemado por frío)",
      description: "Lesiones marrones o negras que avanzan velozmente en días de neblina o garúa continua.",
      image: "assets/img/sintoma_papa_rancha.jpg"
    },
    {
      id: "s_pp_pelusa_enves",
      cropId: "papa",
      organ: "Hojas",
      name: "Pelusa blanquecina o moho fino debajo de la hoja",
      description: "Vellosidad de hongo visible en el envés de la hoja durante las mañanas húmedas.",
      image: "assets/img/sintoma_papa_pelusa.jpg"
    },
    {
      id: "s_pp_tallos_necrosados",
      cropId: "papa",
      organ: "Tallo",
      name: "Tallos negros y quebradizos que estrangulan la mata",
      description: "La pudrición desciende por las ramas debilitando la planta hasta tumbarla.",
      image: "assets/img/sintoma_papa_tallo_negro.jpg"
    },
    {
      id: "s_pp_mordedura_semilunar",
      cropId: "papa",
      organ: "Hojas",
      name: "Cortes limpios en forma de media luna en el borde de las hojas",
      description: "Comeduras redondeadas en los filos de las hojas provocadas durante la noche.",
      image: "assets/img/sintoma_papa_gorgojo.jpg"
    },
    {
      id: "s_pp_galerias_tuberculo",
      cropId: "papa",
      organ: "Tubérculo",
      name: "Gusanos blancos curvos o túneles de tierra dentro de la papa",
      description: "Papas con perforaciones y galerías internas que inutilizan el tubérculo comercial.",
      image: "assets/img/sintoma_papa_galerias.jpg"
    },

    // --- PALTO ---
    {
      id: "s_pt_follaje_bronceado",
      cropId: "palto",
      organ: "Hojas",
      name: "Hojas con tonalidad bronceada, cobriza o plomiza",
      description: "Pérdida del brillo verde por succión continua de savia en meses de calor y sequedad.",
      image: "assets/img/sintoma_palto_bronceado.jpg"
    },
    {
      id: "s_pt_telaranas_enves",
      cropId: "palto",
      organ: "Hojas",
      name: "Telarañas finas con diminutos puntos rojizos en movimiento",
      description: "Seda densa detrás de la hoja donde habitan colonias de ácaros visibles de cerca.",
      image: "assets/img/sintoma_palto_telaranas.jpg"
    },
    {
      id: "s_pt_defoliacion_severa",
      cropId: "palto",
      organ: "Planta",
      name: "Caída abundante de hojas dejando ramas y frutos expuestos al sol",
      description: "El árbol pierde copa foliar y la fruta se quema por radiación solar directa.",
      image: "assets/img/sintoma_palto_defoliacion.jpg"
    },
    {
      id: "s_pt_marchitez_progresiva",
      cropId: "palto",
      organ: "Planta",
      name: "Ramas tristes y marchitas con hojas secas que no se desprenden",
      description: "El follaje queda pegado al árbol como tabaco seco sin llegar a caer al suelo.",
      image: "assets/img/sintoma_palto_marchitez.jpg"
    },
    {
      id: "s_pt_raices_negras",
      cropId: "palto",
      organ: "Raíz",
      name: "Raíces absorbentes negras, blandas y podridas",
      description: "Raicillas de alimentación necrosadas por exceso de humedad o suelo mal drenado.",
      image: "assets/img/sintoma_palto_raices_negras.jpg"
    },

    // --- TOMATE ---
    {
      id: "s_tm_nubes_mosquitas",
      cropId: "tomate",
      organ: "Hojas",
      name: "Nubes de pequeñas mosquitas blancas al mover las ramas",
      description: "Insectos alados diminutos de 1 mm que se refugian debajo de las hojas jóvenes.",
      image: "assets/img/sintoma_tomate_mosca_blanca.jpg"
    },
    {
      id: "s_tm_melaza_fumagina",
      cropId: "tomate",
      organ: "Hojas",
      name: "Hojas pegajosas cubiertas de polvo negro (moho de hollín)",
      description: "Líquido dulce excretado por la plaga sobre el que crece un hongo negro saprófito.",
      image: "assets/img/sintoma_tomate_fumagina.jpg"
    },
    {
      id: "s_tm_frutos_perforados",
      cropId: "tomate",
      organ: "Fruto",
      name: "Frutos perforados cerca del cáliz con pudrición interior",
      description: "Huecos de entrada hechos por orugas que pudren la pulpa del tomate en verde o maduro.",
      image: "assets/img/sintoma_tomate_fruto_perforado.jpg"
    },
    {
      id: "s_tm_polvillo_blanco",
      cropId: "tomate",
      organ: "Hojas",
      name: "Polvillo blanquecino harinoso sobre la superficie de la hoja",
      description: "Capa blanca parecida a ceniza que termina secando las hojas más adultas.",
      image: "assets/img/sintoma_tomate_polvillo.jpg"
    }
  ],

  // =========================================================================
  // 3. REGLAS DE PRODUCCIÓN (NIVELES 2 Y 3: DIAGNÓSTICO + PRESCRIPCIÓN)
  // =========================================================================
  rules: [
    // --- MAÍZ ---
    {
      id: "R_MZ_01",
      code: "R-MZ-01",
      cropId: "maiz",
      name: "Gusano Cogollero del Maíz",
      requiredSymptoms: ["s_mz_hojas_mordidas", "s_mz_aserrin_cogollo"],
      optionalSymptoms: ["s_mz_retraso_crecimiento"],
      diagnosis: {
        id: "diag_mz_cogollero",
        name: "Gusano Cogollero del Maíz",
        scientificName: "Spodoptera frugiperda",
        category: "Plaga insectil de cogollo",
        dangerLevel: "Alta en plántulas y crecimiento",
        image: "assets/img/diag_cogollero.jpg",
        description: "Es la plaga más común y destructiva del maíz en el Perú. La larva vive en el embudo central devorando los brotes y defecando un aserrín húmedo que pudre el centro de la planta.",
        senasaStatus: "Vigilancia fitosanitaria continua a nivel nacional"
      },
      treatment: {
        title: "Tratamiento contra Gusano Cogollero",
        chemical: {
          productName: "Emamectina Benzoato 5% SG (Proclaim u homólogo)",
          activeIngredient: "Emamectina benzoato 50 g/kg",
          actionType: "Insecticida de ingestión con penetración translaminar",
          dosageBasePerHa: 150,
          dosageUnit: "gramos / hectárea",
          waterVolumePerHa: 200,
          safetyIntervalDays: 7,
          reentryHours: 24,
          toxicologicalBand: "Banda Azul (Ligeramente Peligroso)"
        },
        biological: {
          name: "Bacillus thuringiensis var. kurstaki (Dipel / Bactospeine)",
          dosageBasePerHa: 500,
          dosageUnit: "gramos / hectárea",
          details: "Insecticida biológico selective. Aplicar al caer la tarde cuando las orugas salen a alimentarse."
        },
        cultural: [
          "Monitorear semanalmente el campo: aplicar si más del 20% de plantas muestran daño inicial.",
          "Dirigir la boquilla de la mochila directamente hacia el cogollo de la planta.",
          "Eliminar malezas de los bordes y acequias para no dar refugio a las polillas."
        ],
        image: "assets/img/aplicacion_campo.jpg"
      }
    },
    {
      id: "R_MZ_02",
      code: "R-MZ-02",
      cropId: "maiz",
      name: "Complejo Mancha de Asfalto",
      requiredSymptoms: ["s_mz_puntos_negros_hojas", "s_mz_secado_follaje"],
      optionalSymptoms: ["s_mz_retraso_crecimiento"],
      diagnosis: {
        id: "diag_mz_mancha_asfalto",
        name: "Mancha de Asfalto del Maíz",
        scientificName: "Phyllachora maydis + Monographella maydis",
        category: "Enfermedad fungosa foliar",
        dangerLevel: "Severa en valles costeros con alta humedad y neblina",
        image: "assets/img/sintoma_maiz_asfalto.jpg",
        description: "Hongo común en valles de Barranca y Huacho. Produce costras negras brillantes que necrosan el follaje prematuramente, impidiendo el llenado del grano.",
        senasaStatus: "Enfermedad de alto impacto en rendimiento"
      },
      treatment: {
        title: "Tratamiento contra Mancha de Asfalto",
        chemical: {
          productName: "Azoxistrobina + Ciproconazol (Amistar Xtra u homólogo)",
          activeIngredient: "Azoxystrobin 200 g/L + Cyproconazole 80 g/L",
          actionType: "Fungicida sistémico preventivo y curativo",
          dosageBasePerHa: 350,
          dosageUnit: "mililitros / hectárea",
          waterVolumePerHa: 250,
          safetyIntervalDays: 14,
          reentryHours: 24,
          toxicologicalBand: "Banda Azul (Ligeramente Peligroso)"
        },
        biological: {
          name: "Trichoderma harzianum preventivo foliar",
          dosageBasePerHa: 1000,
          dosageUnit: "gramos / hectárea",
          details: "Hongo benéfico protector aplicado antes del espigamiento para frenar la proliferación patógena."
        },
        cultural: [
          "Sembrar con densidad adecuada para permitir ventilación entre hileras.",
          "Evitar riegos por aspersión que dejen agua en las hojas al anochecer.",
          "Elegir variedades e híbridos con comprobada tolerancia en el valle."
        ],
        image: "assets/img/aplicacion_campo.jpg"
      }
    },
    {
      id: "R_MZ_03",
      code: "R-MZ-03",
      cropId: "maiz",
      name: "Falta Severa de Nitrógeno",
      requiredSymptoms: ["s_mz_amarilleo_v", "s_mz_retraso_crecimiento"],
      optionalSymptoms: [],
      diagnosis: {
        id: "diag_mz_def_nitrogeno",
        name: "Deficiencia Nutricional de Nitrógeno (N)",
        scientificName: "Trastorno nutricional abiótico",
        category: "Carencia de fertilidad en suelo",
        dangerLevel: "Riesgo alto de baja cosecha",
        image: "assets/img/sintoma_maiz_clorosis.jpg",
        description: "Falta de abono nitrogenado en el terreno. La planta traslada el nitrógeno de las hojas viejas a los brotes nuevos, generando la clásica clorosis en 'V' en la base.",
        senasaStatus: "Manejo nutricional y fertilidad de suelos"
      },
      treatment: {
        title: "Plan de Corrección de Nitrógeno",
        chemical: {
          productName: "Urea Agrícola 46% N + Bioestimulante Foliar",
          activeIngredient: "Nitrógeno concentrado + Aminoácidos",
          actionType: "Abono al suelo con apoyo foliar de respuesta rápida",
          dosageBasePerHa: 100,
          dosageUnit: "kilogramos / hectárea al aporque",
          waterVolumePerHa: 200,
          safetyIntervalDays: 0,
          reentryHours: 0,
          toxicologicalBand: "Banda Verde (Fertilizante inocuo)"
        },
        biological: {
          name: "Incorporación de compost maduro o estiércol descompuesto",
          dosageBasePerHa: 3000,
          dosageUnit: "kilos / hectárea",
          details: "Aumenta la materia orgánica del suelo y la retención biológica de nitrógeno."
        },
        cultural: [
          "Fraccionar la dosis: 30% al inicio y 70% en el aporque (etapa V6).",
          "Regar inmediatamente después de aplicar la urea para evitar pérdidas por evaporación solar."
        ],
        image: "assets/img/aplicacion_campo.jpg"
      }
    },

    // --- PAPA ---
    {
      id: "R_PP_01",
      code: "R-PP-01",
      cropId: "papa",
      name: "Rancha o Tizón Tardío de la Papa",
      requiredSymptoms: ["s_pp_manchas_acuosas", "s_pp_pelusa_enves"],
      optionalSymptoms: ["s_pp_tallos_necrosados"],
      diagnosis: {
        id: "diag_rancha",
        name: "Rancha o Tizón Tardío de la Papa",
        scientificName: "Phytophthora infestans",
        category: "Oomyceto fitopatológico crítico",
        dangerLevel: "Emergencia (capaz de quemar una parcela entera en 72 horas)",
        image: "assets/img/diag_rancha.jpg",
        description: "La enfermedad más destructiva de la papa en el Perú. Favorecida por humedad mayor al 90% y temperaturas frescas. Quema el follaje y desciende pudriendo los tubérculos bajo tierra.",
        senasaStatus: "Alerta fitosanitaria prioritaria permanente"
      },
      treatment: {
        title: "Tratamiento de Choque contra Rancha en Papa",
        chemical: {
          productName: "Mancozeb 64% + Metalaxil-M 4% WP (Ridomil Gold u homólogo)",
          activeIngredient: "Mancozeb + Mefenoxam",
          actionType: "Fungicida protectante de contacto + sistémico curativo",
          dosageBasePerHa: 2000,
          dosageUnit: "gramos / hectárea (2.0 kg/ha)",
          waterVolumePerHa: 300,
          safetyIntervalDays: 14,
          reentryHours: 24,
          toxicologicalBand: "Banda Azul (Ligeramente Peligroso)"
        },
        biological: {
          name: "Caldo Bordelés o Sulfato de Cobre preventivo",
          dosageBasePerHa: 1500,
          dosageUnit: "gramos / hectárea",
          details: "Protector de contacto que forma una barrera contra la germinación de esporas."
        },
        cultural: [
          "Hacer aporques altos y anchos para aislar los tubérculos del agua de escorrentía con esporas.",
          "Cortar y quemar el follaje (chamusco) 10 días antes de cosechar si la rancha persiste.",
          "Usar semilla certificada de variedades tolerantes (ej. Canchán, Amarilis)."
        ],
        image: "assets/img/aplicacion_campo.jpg"
      }
    },
    {
      id: "R_PP_02",
      code: "R-PP-02",
      cropId: "papa",
      name: "Gorgojo de los Andes",
      requiredSymptoms: ["s_pp_mordedura_semilunar", "s_pp_galerias_tuberculo"],
      optionalSymptoms: [],
      diagnosis: {
        id: "diag_gorgojo",
        name: "Gorgojo de los Andes",
        scientificName: "Premnotrypes suturicallus",
        category: "Plaga perforadora de tubérculo",
        dangerLevel: "Alta (daño directo irreversible a la papa comercial)",
        image: "assets/img/diag_gorgojo.jpg",
        description: "El adulto muerde el borde de las hojas de noche y pone huevos en la base. Las larvas penetran el suelo y barrenan las papas creando galerías con tierra que las dejan invendibles.",
        senasaStatus: "Plaga andina de control obligatorio"
      },
      treatment: {
        title: "Manejo Integrado de Gorgojo de los Andes",
        chemical: {
          productName: "Cipermetrina 25% EC (Arrivo / Cymbush)",
          activeIngredient: "Cypermethrin 250 g/L",
          actionType: "Insecticida piretroide de contacto y derribe rápido",
          dosageBasePerHa: 400,
          dosageUnit: "mililitros / hectárea",
          waterVolumePerHa: 250,
          safetyIntervalDays: 21,
          reentryHours: 24,
          toxicologicalBand: "Banda Amarilla (Moderadamente Peligroso)"
        },
        biological: {
          name: "Hongo blanco Beauveria brongniartii aplicado al aporque",
          dosageBasePerHa: 1000,
          dosageUnit: "gramos / hectárea",
          details: "Biocontrolador que infecta las larvas y pupas bajo tierra provocando micosis letal."
        },
        cultural: [
          "Colocar barreras plásticas de 40 cm en los bordes del lote para impedir el ingreso de adultos.",
          "Revisar de noche con linterna sacudiendo las matas sobre una manta plástica.",
          "Rotación estricta: nunca sembrar papa sobre rastrojo de papa de la campaña previa."
        ],
        image: "assets/img/aplicacion_campo.jpg"
      }
    },

    // --- PALTO ---
    {
      id: "R_PT_01",
      code: "R-PT-01",
      cropId: "palto",
      name: "Arañita Roja del Palto",
      requiredSymptoms: ["s_pt_follaje_bronceado", "s_pt_telaranas_enves"],
      optionalSymptoms: ["s_pt_defoliacion_severa"],
      diagnosis: {
        id: "diag_aranita",
        name: "Arañita Roja del Palto",
        scientificName: "Oligonychus punicae",
        category: "Plaga de ácaros fitófagos",
        dangerLevel: "Alta en temporada seca y caminos polvorientos",
        image: "assets/img/diag_palto_aranita.jpg",
        description: "Ácaros diminutos que raspan las células de las hojas para succionar savia. Broncean el follaje, tejen telarañas finas y provocan desfoliación prematura que expone la fruta al golpe de sol.",
        senasaStatus: "Regulada en protocolos de exportación de palta Hass"
      },
      treatment: {
        title: "Programa Acaricida para Palto",
        chemical: {
          productName: "Abamectina 1.8% EC + Aceite Agrícola",
          activeIngredient: "Abamectina 18 g/L",
          actionType: "Acaricida translaminar de choque y persistencia",
          dosageBasePerHa: 600,
          dosageUnit: "mililitros / hectárea (o 150 ml por cilindro de 200L)",
          waterVolumePerHa: 800,
          safetyIntervalDays: 14,
          reentryHours: 24,
          toxicologicalBand: "Banda Amarilla (Moderadamente Peligroso)"
        },
        biological: {
          name: "Azufre micronizado 80% WG o Jabón Agrícola Potásico",
          dosageBasePerHa: 2500,
          dosageUnit: "gramos / hectárea (o 600 g por cilindro)",
          details: "Control ecológico que derriba ninfas y adultos sin perjudicar a los insectos polinizadores."
        },
        cultural: [
          "Regar los caminos de tierra perimetrales para evitar polvo que favorece la plaga.",
          "Realizar podas de aclareo para asegurar que la pulverización ingrese al centro de la copa."
        ],
        image: "assets/img/aplicacion_campo.jpg"
      }
    },
    {
      id: "R_PT_02",
      code: "R-PT-02",
      cropId: "palto",
      name: "Tristeza o Pudrición Radicular del Palto",
      requiredSymptoms: ["s_pt_marchitez_progresiva", "s_pt_raices_negras"],
      optionalSymptoms: ["s_pt_defoliacion_severa"],
      diagnosis: {
        id: "diag_tristeza",
        name: "Tristeza o Marchitez del Palto",
        scientificName: "Phytophthora cinnamomi",
        category: "Patógeno radicular destructivo",
        dangerLevel: "Crítica (causa la muerte regresiva del árbol)",
        image: "assets/img/diag_palto_tristeza.jpg",
        description: "Pudre las raicillas absorbentes encargadas de tomar agua y sales. Las hojas se marchitan pero permanecen colgadas del árbol como tabaco seco. Frecuente en suelos pesados con exceso de riego.",
        senasaStatus: "Principal causa de declive en huertos de palto en la costa"
      },
      treatment: {
        title: "Manejo Radicular de Phytophthora en Palto",
        chemical: {
          productName: "Fosfito de Potasio + Metalaxil en drench al pie",
          activeIngredient: "Fosfonato de potasio",
          actionType: "Fungicida inductor de defensas y cicatrizante radicular",
          dosageBasePerHa: 3000,
          dosageUnit: "mililitros / hectárea",
          waterVolumePerHa: 1000,
          safetyIntervalDays: 0,
          reentryHours: 12,
          toxicologicalBand: "Banda Verde (Ligeramente Tóxico)"
        },
        biological: {
          name: "Inoculación de Trichoderma harzianum al bulbo de riego",
          dosageBasePerHa: 2000,
          dosageUnit: "gramos / hectárea",
          details: "Hongo antagónico que coloniza la zona de raíces compitiendo y desplazando al patógeno."
        },
        cultural: [
          "Diseñar camellones altos de siembra (40 a 50 cm) para evitar encharcamiento en el cuello.",
          "Control riguroso de riegos: el palto tolera sequedad moderada pero no asfixia por agua estancada."
        ],
        image: "assets/img/aplicacion_campo.jpg"
      }
    },

    // --- TOMATE ---
    {
      id: "R_TM_01",
      code: "R-TM-01",
      cropId: "tomate",
      name: "Mosca Blanca en Tomate",
      requiredSymptoms: ["s_tm_nubes_mosquitas", "s_tm_melaza_fumagina"],
      optionalSymptoms: [],
      diagnosis: {
        id: "diag_mosca_blanca",
        name: "Mosca Blanca del Tomate",
        scientificName: "Bemisia tabaci",
        category: "Plaga chupadora y vector viral",
        dangerLevel: "Alta (trasmite virus que encrespan y enanan la planta)",
        image: "assets/img/diag_mosca_blanca.jpg",
        description: "Succiona savia de hojas tiernas y segrega mielecilla donde prolifera el moho negro (fumagina). El peligro principal es la inoculación de geminivirus que deforman la mata e impiden la cosecha.",
        senasaStatus: "Plaga de prioridad fitosanitaria nacional"
      },
      treatment: {
        title: "Control Integrado de Mosca Blanca",
        chemical: {
          productName: "Imidacloprid 35% SC (Confidor u homólogo)",
          activeIngredient: "Imidacloprid 350 g/L",
          actionType: "Insecticida neonicotinoide sistémico",
          dosageBasePerHa: 350,
          dosageUnit: "mililitros / hectárea",
          waterVolumePerHa: 300,
          safetyIntervalDays: 7,
          reentryHours: 24,
          toxicologicalBand: "Banda Azul (Ligeramente Peligroso)"
        },
        biological: {
          name: "Jabón Potásico al 2% + Extracto de Aceite de Neem",
          dosageBasePerHa: 2000,
          dosageUnit: "mililitros / hectárea",
          details: "Disuelve la cutícula cerosa de las ninfas y repele adultos sin dejar residuos químicos en el tomate."
        },
        cultural: [
          "Instalar trampas plásticas amarillas pegajosas (30 a 40 trampas por hectárea) en los bordes.",
          "Eliminar y enterrar inmediatamente plantas con síntomas de virosis."
        ],
        image: "assets/img/aplicacion_campo.jpg"
      }
    },
    {
      id: "R_TM_02",
      code: "R-TM-02",
      cropId: "tomate",
      name: "Polilla del Tomate / Barrenador de Fruto",
      requiredSymptoms: ["s_tm_frutos_perforados"],
      optionalSymptoms: ["s_tm_melaza_fumagina"],
      diagnosis: {
        id: "diag_tuta",
        name: "Polilla del Tomate (Tuta) o Barrenador",
        scientificName: "Tuta absoluta",
        category: "Oruga barrenadora de fruto y hojas",
        dangerLevel: "Severa (daño directo al fruto de exportación y mercado)",
        image: "assets/img/diag_tuta.jpg",
        description: "Oruga pequeña que penetra el follaje creando minas transparentes y perfora tomates verdes o maduros cerca del pedúnculo, abriendo paso a pudriciones bacterianas secundarias.",
        senasaStatus: "Plaga clave del tomate a nivel nacional"
      },
      treatment: {
        title: "Tratamiento contra Polilla del Tomate",
        chemical: {
          productName: "Clorantraniliprole 20% SC (Coragen u homólogo)",
          activeIngredient: "Chlorantraniliprole 200 g/L",
          actionType: "Insecticida modulador de receptores de rianodina",
          dosageBasePerHa: 150,
          dosageUnit: "mililitros / hectárea",
          waterVolumePerHa: 300,
          safetyIntervalDays: 1, // Solo 1 día de carencia
          reentryHours: 12,
          toxicologicalBand: "Banda Verde (Baja toxicidad)"
        },
        biological: {
          name: "Bacillus thuringiensis al follaje",
          dosageBasePerHa: 600,
          dosageUnit: "gramos / hectárea",
          details: "Control microbiano selectivo contra orugas recién emergidas."
        },
        cultural: [
          "Recoger y enterrar frutos perforados caídos para cortar la reproducción de la plaga.",
          "Instalar trampas de agua con feromona sexual específica para captura masiva de machos."
        ],
        image: "assets/img/aplicacion_campo.jpg"
      }
    }
  ]
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = KNOWLEDGE_BASE;
}
