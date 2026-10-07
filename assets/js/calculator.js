/**
 * CALCULADORA AGRONÓMICA DE DOSIFICACIÓN (NIVEL 4)
 * Diseñada para agricultores peruanos y técnicos de campo
 * 
 * Convierte dosis técnicas oficiales en instrucciones prácticas:
 * - Unidades peruanas: Hectáreas (ha), Topos (3,333 m²), Metros cuadrados (m²)
 * - Equipos de aplicación: Mochila manual (20L), Cilindro (200L), Tractor
 * - Dosificación por carga individual (copa dosificadora / tapa)
 */

class AgronomicCalculator {
  /**
   * Realiza el cálculo agronómico completo
   * @param {Object} treatmentChemical - Datos del tratamiento químico
   * @param {number} areaValue - Valor numérico del área
   * @param {string} areaUnit - 'ha', 'topos', 'm2'
   * @param {string} equipmentType - 'mochila_20', 'cilindro_200', 'tractor'
   */
  static calculateDosage(treatmentChemical, areaValue, areaUnit = "ha", equipmentType = "mochila_20") {
    if (!treatmentChemical) return null;

    if (!areaValue || isNaN(areaValue) || areaValue <= 0) {
      return {
        valid: false,
        message: "Por favor ingrese una superficie mayor a cero (ejemplo: 1 ha, 2 topos, o 500 m²)."
      };
    }

    // 1. Normalizar área a Hectáreas (ha)
    let areaInHectares = 0;
    if (areaUnit === "ha") {
      areaInHectares = areaValue;
    } else if (areaUnit === "topos") {
      // 1 topo tradicional peruano = aprox 3,333.33 m² = 0.33333 ha
      areaInHectares = (areaValue * 3333.33) / 10000;
    } else if (areaUnit === "m2") {
      areaInHectares = areaValue / 10000;
    }

    const dosageBase = treatmentChemical.dosageBasePerHa; // g o ml por hectárea
    const waterBase = treatmentChemical.waterVolumePerHa || 200; // Litros de agua por hectárea

    // 2. Cálculo total de producto y volumen de agua
    const totalProductRaw = dosageBase * areaInHectares;
    const totalWaterLiters = Math.max(10, Math.round(waterBase * areaInHectares));

    // 3. Formato legible de producto total
    let formattedProductTotal = "";
    const isSolid = treatmentChemical.dosageUnit.toLowerCase().includes("g") || treatmentChemical.dosageUnit.toLowerCase().includes("k");

    if (isSolid) {
      if (totalProductRaw >= 1000) {
        formattedProductTotal = `${(totalProductRaw / 1000).toFixed(2)} Kilogramos (kg)`;
      } else {
        formattedProductTotal = `${Math.round(totalProductRaw)} Gramos (g)`;
      }
    } else {
      if (totalProductRaw >= 1000) {
        formattedProductTotal = `${(totalProductRaw / 1000).toFixed(2)} Litros (L)`;
      } else {
        formattedProductTotal = `${Math.round(totalProductRaw)} Mililitros (ml)`;
      }
    }

    // 4. Cálculos específicos según el equipo de aplicación
    let equipmentSummary = {};

    if (equipmentType === "mochila_20") {
      const backpackCapacity = 20; // 20 Litros
      const totalBackpacks = Math.max(1, Math.ceil(totalWaterLiters / backpackCapacity));
      const productPerBackpackRaw = totalProductRaw / totalBackpacks;

      let practicalTip = "";
      if (isSolid) {
        if (productPerBackpackRaw <= 15) {
          practicalTip = `Aprox. 1 cuchara sopera al ras (1 cuchara ≈ 10-12g). Pre-diluir en 1 litro de agua en balde.`;
        } else if (productPerBackpackRaw <= 30) {
          practicalTip = `Aprox. ${(productPerBackpackRaw / 15).toFixed(1)} cucharas soperas colmadas (1 cuchara colmada ≈ 15g).`;
        } else {
          practicalTip = `Pesar con balanza gramera o usar vaso medidor graduado. Pre-diluir siempre en balde.`;
        }
      } else {
        if (productPerBackpackRaw <= 15) {
          practicalTip = `Aprox. 1 jeringa médica de 10-15 ml o 1 cuchara sopera al ras (≈ 10 ml). No exceder la dosis.`;
        } else if (productPerBackpackRaw <= 35) {
          practicalTip = `Aprox. 1 copita dosificadora o tapita del frasco original al ras (≈ 25 ml).`;
        } else if (productPerBackpackRaw <= 75) {
          practicalTip = `Aprox. 2 copitas dosificadoras al ras o medio vasito descartable pequeño (≈ 50 ml).`;
        } else {
          practicalTip = `Aprox. ${(productPerBackpackRaw / 150).toFixed(1)} vasitos descartables de 150 ml.`;
        }
      }

      equipmentSummary = {
        name: "Mochila Manual / Palanca (20 Litros)",
        tankCapacity: "20 Litros",
        totalTanksNeeded: totalBackpacks,
        totalTanksLabel: `${totalBackpacks} mochilas de 20L`,
        dosePerTank: isSolid
          ? `${productPerBackpackRaw.toFixed(1)} g por mochila`
          : `${productPerBackpackRaw.toFixed(1)} ml por mochila`,
        practicalMeasuringTip: practicalTip,
        goldenRule: "Regla de oro: Llene la mochila con agua hasta la mitad, agregue el producto disuelto en balde y complete los 20 litros con colador para evitar atascar boquillas."
      };
    } else if (equipmentType === "cilindro_200") {
      const drumCapacity = 200; // 200 Litros
      const totalDrums = Math.max(0.5, totalWaterLiters / drumCapacity).toFixed(1);
      const dosePerDrumRaw = (dosageBase / waterBase) * drumCapacity;

      equipmentSummary = {
        name: "Cilindro Plástico / Metal (200 Litros - 55 Galones)",
        tankCapacity: "200 Litros",
        totalTanksNeeded: totalDrums,
        totalTanksLabel: `${totalDrums} cilindros de 200L`,
        dosePerTank: isSolid
          ? `${dosePerDrumRaw.toFixed(0)} g por cilindro`
          : `${dosePerDrumRaw.toFixed(0)} ml (${(dosePerDrumRaw / 1000).toFixed(2)} L) por cilindro`,
        practicalMeasuringTip: isSolid
          ? `Pesar ${dosePerDrumRaw.toFixed(0)} g. Disolver primero en balde con 10L de agua agitando con vara de madera limpia antes de verter al cilindro.`
          : `Medir ${dosePerDrumRaw.toFixed(0)} ml con probeta o jarra medidora graduada de campo y homogenizar con vara limpia.`,
        goldenRule: "Regla de oro: Mantener la mezcla en agitación periódica mientras se extrae el caldo para pulverizar."
      };
    } else {
      // Tractor / Aguilón
      const tractorTankCapacity = 500;
      const totalTanks = Math.max(0.5, totalWaterLiters / tractorTankCapacity).toFixed(1);
      const dosePerTankRaw = dosageBase * (tractorTankCapacity / waterBase);

      equipmentSummary = {
        name: "Tractor con Aguilón / Barra Pulverizadora (500 L)",
        tankCapacity: "Tanque tractor (500 Litros)",
        totalTanksNeeded: totalTanks,
        totalTanksLabel: `${totalTanks} tanques de 500L`,
        dosePerTank: isSolid
          ? `${dosePerTankRaw.toFixed(0)} g por tanque de 500L`
          : `${dosePerTankRaw.toFixed(0)} ml (${(dosePerTankRaw / 1000).toFixed(2)} L) por tanque`,
        practicalMeasuringTip: "Verificar calibración de pastillas (boquillas abanico plano) y presión constante a 40 PSI.",
        goldenRule: "Regla de oro: Activar el retorno de agitación hidráulica del tractor durante todo el recorrido del lote."
      };
    }

    return {
      valid: true,
      areaInHectares: areaInHectares.toFixed(3),
      inputArea: areaValue,
      inputUnit: areaUnit,
      totalProduct: formattedProductTotal,
      totalProductRaw,
      totalWaterLiters,
      isSolid,
      equipment: equipmentSummary,
      safety: {
        safetyIntervalDays: treatmentChemical.safetyIntervalDays || 7,
        reentryHours: treatmentChemical.reentryHours || 24,
        toxicologicalBand: treatmentChemical.toxicologicalBand || "Clase III (Ligeramente Peligroso)",
        ppeRecommendations: [
          "Botas de jebe altas y limpias.",
          "Guantes de nitrilo o goma (no de cuero ni tela).",
          "Mascarilla con filtro para vapores orgánicos y partículas.",
          "Lentes de seguridad con protección lateral.",
          "Overol de manga larga o poncho impermeable."
        ]
      }
    };
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = AgronomicCalculator;
}
