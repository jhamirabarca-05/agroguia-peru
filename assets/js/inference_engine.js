/**
 * MOTOR DE INFERENCIA (INFERENCE ENGINE)
 * Curso: Sistemas de Expertos - Ing. de Sistemas (UNJFSC)
 * Basado en las fases teóricas del Ing. Juan C. Meyhuay Fidel:
 * 
 * 1. Detección (Matching / Filtro) -> Conjunto de Conflicto
 * 2. Selección (Resolución de Conflictos: Especificidad + Heurística de Certeza)
 * 3. Aplicación (Disparo de Regla por Modus Ponens -> Nuevos Hechos)
 * 4. Generación de Traza de Razonamiento para el Módulo de Explicación
 */

class InferenceEngine {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase;
    this.workingMemory = []; // Base de Hechos activa
    this.conflictSet = [];   // Conjunto de Conflicto
    this.executionTrace = []; // Traza de pasos de deducción
  }

  /**
   * Inicializa la memoria de trabajo con los hechos iniciales proporcionados por el usuario
   * @param {string} cropId - Hecho de contexto: cultivo seleccionado
   * @param {Array<string>} symptomIds - Hechos de observación: síntomas marcados
   */
  initializeWorkingMemory(cropId, symptomIds) {
    this.workingMemory = [];
    this.conflictSet = [];
    this.executionTrace = [];

    // Hecho 0: Contexto del Cultivo
    this.assertFact({
      type: "CULTIVO",
      value: cropId,
      source: "USUARIO",
      description: `El cultivo objetivo es: ${cropId}`
    });

    // Hechos 1..N: Síntomas observados
    symptomIds.forEach((symId) => {
      const symObj = this.kb.symptoms.find((s) => s.id === symId);
      this.assertFact({
        type: "SINTOMA",
        value: symId,
        name: symObj ? symObj.name : symId,
        organ: symObj ? symObj.organ : "General",
        source: "USUARIO",
        description: `Se constata el síntoma: ${symObj ? symObj.name : symId}`
      });
    });

    this.logTrace("INICIALIZACIÓN", `Base de Hechos inicializada con 1 hecho de contexto y ${symptomIds.length} hechos de observación.`);
  }

  /**
   * Inserta un hecho en la memoria de trabajo (Working Memory)
   */
  assertFact(fact) {
    this.workingMemory.push({
      id: `H_${this.workingMemory.length + 1}`,
      timestamp: new Date().toISOString(),
      ...fact
    });
  }

  /**
   * Registra un paso en la traza de ejecución
   */
  logTrace(phase, message, details = null) {
    this.executionTrace.push({
      step: this.executionTrace.length + 1,
      phase,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  /**
   * Ejecuta el ciclo de inferencia por Encadenamiento hacia Adelante (Forward Chaining)
   * Entrada: Base de Hechos inicial
   * Salida: Diagnóstico + Tratamiento + Explicación
   */
  runForwardChaining(cropId, symptomIds) {
    this.initializeWorkingMemory(cropId, symptomIds);

    const activeSymptomIds = new Set(
      this.workingMemory.filter((f) => f.type === "SINTOMA").map((f) => f.value)
    );

    // ----------------------------------------------------
    // FASE 1: DETECCIÓN (Matching / Filtro)
    // ----------------------------------------------------
    this.logTrace("FASE_1_DETECCION", "Evaluando antecedentes de las reglas de producción en la Base de Conocimiento...");

    // Filtrar reglas asociadas al cultivo
    const candidateRules = this.kb.rules.filter((r) => r.cropId === cropId);
    this.conflictSet = [];
    const partialCandidates = [];

    candidateRules.forEach((rule) => {
      const reqConditions = rule.requiredSymptoms;
      const optConditions = rule.optionalSymptoms || [];
      const totalConditions = reqConditions.length + optConditions.length;

      // Evaluar cuántas condiciones obligatorias y opcionales se cumplen
      const satisfiedReq = reqConditions.filter((sId) => activeSymptomIds.has(sId));
      const satisfiedOpt = optConditions.filter((sId) => activeSymptomIds.has(sId));
      const allReqSatisfied = satisfiedReq.length === reqConditions.length;
      const totalSatisfied = satisfiedReq.length + satisfiedOpt.length;

      // Cálculo de Heurística de Coincidencia / Factor de Certeza (CF)
      let certaintyFactor = 0;
      if (allReqSatisfied) {
        const optBonus = optConditions.length > 0 ? (satisfiedOpt.length / optConditions.length) * 15 : 15;
        certaintyFactor = Math.min(100, Math.round(85 + optBonus));
      } else if (totalSatisfied > 0) {
        // Porcentaje proporcional de síntomas observados respecto a la regla
        certaintyFactor = Math.round((totalSatisfied / totalConditions) * 65);
      }

      const matchItem = {
        rule,
        allReqSatisfied,
        satisfiedReq,
        missingReq: reqConditions.filter((sId) => !activeSymptomIds.has(sId)),
        satisfiedOpt,
        totalSatisfied,
        totalConditions,
        certaintyFactor
      };

      if (allReqSatisfied) {
        this.conflictSet.push(matchItem);
      } else if (totalSatisfied > 0) {
        partialCandidates.push(matchItem);
      }
    });

    this.logTrace(
      "CONJUNTO_DE_CONFLICTO",
      `Se formó el Conjunto de Conflicto con ${this.conflictSet.length} regla(s) que cumplen todos los requisitos obligatorios, y ${partialCandidates.length} regla(s) con coincidencia parcial.`,
      {
        reglasCompletas: this.conflictSet.map((c) => ({
          codigo: c.rule.code,
          nombre: c.rule.name,
          certeza: `${c.certaintyFactor}%`
        })),
        coincidenciasParciales: partialCandidates.map((c) => ({
          codigo: c.rule.code,
          nombre: c.rule.name,
          coincidencias: `${c.totalSatisfied}/${c.totalConditions}`,
          certeza: `${c.certaintyFactor}%`
        }))
      }
    );

    // ----------------------------------------------------
    // FASE 2: SELECCIÓN (Resolución de Conflictos)
    // ----------------------------------------------------
    this.logTrace("FASE_2_SELECCION", "Aplicando estrategia de resolución de conflictos (Mayor Factor de Certeza + Especificidad)...");

    if (this.conflictSet.length === 0) {
      // Si no hay regla completa pero sí hay indicios parciales, proveer asistencia interactiva
      if (partialCandidates.length > 0) {
        partialCandidates.sort((a, b) => b.certaintyFactor - a.certaintyFactor || b.totalSatisfied - a.totalSatisfied);
        const bestPartial = partialCandidates[0];
        
        this.logTrace(
          "COINCIDENCIA_PARCIAL_DETECTADA",
          `No se cumplieron todas las premisas obligatorias, pero la regla [${bestPartial.rule.code}] muestra ${bestPartial.certaintyFactor}% de indicios.`,
          {
            plagaSospechosa: bestPartial.rule.diagnosis.name,
            sintomasFaltantes: bestPartial.missingReq
          }
        );

        return {
          success: false,
          hasPartialMatch: true,
          bestPartial,
          possibleDiagnosis: bestPartial.rule.diagnosis,
          suggestedSymptoms: bestPartial.missingReq.map(id => this.kb.symptoms.find(s => s.id === id)).filter(Boolean),
          satisfiedSymptoms: bestPartial.satisfiedReq.map(id => this.kb.symptoms.find(s => s.id === id)).filter(Boolean),
          certaintyFactor: bestPartial.certaintyFactor,
          rule: bestPartial.rule,
          message: `Indicios preliminares de ${bestPartial.rule.diagnosis.name} (${bestPartial.certaintyFactor}% de certeza). Verifique señales complementarias.`,
          trace: this.executionTrace,
          conflictSet: [],
          workingMemory: this.workingMemory
        };
      }

      this.logTrace("TERMINACION", "No se encontraron reglas aplicables ni indicios para los síntomas ingresados.");
      return {
        success: false,
        hasPartialMatch: false,
        message: "No se identificó ninguna regla en la Base de Conocimiento que concuerde con los síntomas seleccionados.",
        trace: this.executionTrace,
        conflictSet: [],
        workingMemory: this.workingMemory
      };
    }

    // Ordenar por: 1) Mayor Certeza, 2) Mayor número de síntomas coincidentes
    this.conflictSet.sort((a, b) => {
      if (b.certaintyFactor !== a.certaintyFactor) {
        return b.certaintyFactor - a.certaintyFactor;
      }
      return b.totalSatisfied - a.totalSatisfied;
    });

    const winningMatch = this.conflictSet[0];
    const winningRule = winningMatch.rule;

    this.logTrace(
      "REGLA_GANADORA",
      `Regla seleccionada: [${winningRule.code}] "${winningRule.name}" con ${winningMatch.certaintyFactor}% de certeza.`,
      {
        regla: winningRule.code,
        sintomasVerificados: winningMatch.satisfiedReq.length + winningMatch.satisfiedOpt.length,
        certeza: winningMatch.certaintyFactor
      }
    );

    // ----------------------------------------------------
    // FASE 3: APLICACIÓN (Disparo / Modus Ponens)
    // ----------------------------------------------------
    this.logTrace("FASE_3_APLICACION", `Disparando regla ${winningRule.code} por Modus Ponens: A, A -> B |= B.`);

    // Deducir nuevo hecho: Diagnóstico
    this.assertFact({
      type: "DIAGNOSTICO",
      value: winningRule.diagnosis.id,
      name: winningRule.diagnosis.name,
      scientificName: winningRule.diagnosis.scientificName,
      ruleCode: winningRule.code,
      certainty: winningMatch.certaintyFactor,
      source: "MOTOR_DE_INFERENCIA",
      description: `Se deduce la presencia de: ${winningRule.diagnosis.name} (${winningRule.diagnosis.scientificName})`
    });

    // Deducir nuevo hecho: Tratamiento
    this.assertFact({
      type: "TRATAMIENTO",
      value: winningRule.treatment.title,
      chemicalProduct: winningRule.treatment.chemical.productName,
      ruleCode: winningRule.code,
      source: "MOTOR_DE_INFERENCIA",
      description: `Se prescribe tratamiento: ${winningRule.treatment.chemical.productName}`
    });

    this.logTrace(
      "TERMINACION_EXITOSA",
      `Inferencia completada con éxito. Diagnóstico final: ${winningRule.diagnosis.name}.`
    );

    return {
      success: true,
      winningRule,
      certaintyFactor: winningMatch.certaintyFactor,
      allRequirementsSatisfied: winningMatch.allReqSatisfied,
      satisfiedSymptoms: winningMatch.satisfiedReq,
      missingSymptoms: winningMatch.missingReq,
      optionalSatisfied: winningMatch.satisfiedOpt,
      conflictSet: this.conflictSet,
      workingMemory: this.workingMemory,
      trace: this.executionTrace,
      diagnosis: winningRule.diagnosis,
      treatment: winningRule.treatment
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = InferenceEngine;
}
