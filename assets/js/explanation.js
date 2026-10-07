/**
 * MÓDULO DE EXPLICACIÓN Y JUSTIFICACIÓN (EXPLANATION FACILITY)
 * Curso: Sistemas de Expertos - Ing. de Sistemas (UNJFSC)
 * Basado en las directrices del Ing. Juan C. Meyhuay Fidel:
 * 
 * Implementa las dos preguntas fundamentales del SBC:
 * 1. ¿POR QUÉ? (Why): Justificación causal y reglas satisfechas.
 * 2. ¿CÓMO? (How): Traza de deducción paso a paso y árbol de inferencia.
 */

class ExplanationModule {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase;
  }

  /**
   * Genera la explicación a la pregunta: ¿POR QUÉ SE DIAGNOSTICÓ ESTO?
   * @param {Object} inferenceResult - Resultado devuelto por el motor de inferencia
   */
  generateWhyExplanation(inferenceResult) {
    if (!inferenceResult || !inferenceResult.success) {
      return {
        title: "Justificación no disponible",
        html: "<p class='text-gray-600'>No se disparó ninguna regla resolutiva para explicar.</p>"
      };
    }

    const { winningRule, certaintyFactor, satisfiedSymptoms, missingSymptoms, optionalSatisfied, conflictSet } = inferenceResult;

    // Obtener nombres amigables de síntomas
    const satisfiedNames = satisfiedSymptoms.map((id) => {
      const s = this.kb.symptoms.find((item) => item.id === id);
      return s ? s.name : id;
    });

    const optionalNames = (optionalSatisfied || []).map((id) => {
      const s = this.kb.symptoms.find((item) => item.id === id);
      return s ? s.name : id;
    });

    const otherCompetitors = conflictSet.filter((c) => c.rule.id !== winningRule.id);

    return {
      ruleCode: winningRule.code,
      ruleName: winningRule.name,
      diagnosis: winningRule.diagnosis.name,
      certainty: certaintyFactor,
      satisfiedConditions: satisfiedNames,
      optionalConditions: optionalNames,
      missingConditions: missingSymptoms,
      otherRulesEvaluated: otherCompetitors.map((c) => ({
        code: c.rule.code,
        nombre: c.rule.name,
        certeza: c.certaintyFactor,
        motivoDescarte: c.allReqSatisfied
          ? "Menor factor de certeza o especificidad que la regla ganadora"
          : `Le faltaron ${c.missingReq.length} síntoma(s) obligatorios`
      }))
    };
  }

  /**
   * Genera la explicación a la pregunta: ¿CÓMO SE LLEGÓ A ESTA CONCLUSIÓN? (Traza y Árbol)
   * @param {Object} inferenceResult
   */
  generateHowExplanation(inferenceResult) {
    if (!inferenceResult || !inferenceResult.success) {
      return [];
    }

    const { winningRule, workingMemory, trace } = inferenceResult;

    // Pasos cronológicos formales del razonamiento deductivo
    const deductionSteps = [
      {
        order: 1,
        title: "Hechos Iniciales en Memoria de Trabajo (Working Memory)",
        detail: `El usuario cargó 1 hecho de contexto (cultivo) y ${workingMemory.filter((f) => f.type === "SINTOMA").length} hechos de síntomas observables en el campo.`,
        type: "HECHOS_INICIALES"
      },
      {
        order: 2,
        title: "Fase de Detección (Pattern Matching)",
        detail: `El motor de inferencia comparó los hechos contra las premisas de la Base de Conocimiento, identificando que la regla [${winningRule.code}] era satisfacible.`,
        type: "MATCHING"
      },
      {
        order: 3,
        title: "Resolución de Conflictos en Conjunto de Conflicto",
        detail: `La regla [${winningRule.code}] fue seleccionada por superar al resto en especificidad y obtener un Factor de Certeza de ${inferenceResult.certaintyFactor}%.`,
        type: "SELECCION"
      },
      {
        order: 4,
        title: "Disparo por Modus Ponens (A, A -> B |= B)",
        detail: `Premisa A verificada -> Se infiere formalmente B: Diagnóstico = "${winningRule.diagnosis.name}" y Tratamiento = "${winningRule.treatment.chemical.productName}".`,
        type: "DISPARO"
      },
      {
        order: 5,
        title: "Transición al Nivel 4 (Prescripción Cuantitativa)",
        detail: `Se habilita la calculadora agronómica para dosificar en campo según la superficie (hectáreas/topos) y equipo disponible.`,
        type: "CONCLUSION"
      }
    ];

    return {
      steps: deductionSteps,
      rawTrace: trace
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ExplanationModule;
}
