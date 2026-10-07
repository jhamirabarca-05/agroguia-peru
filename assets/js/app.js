/**
 * AGROGUÍA PERÚ - CONTROLADOR DE APLICACIÓN (APP.JS)
 * Interfaz humana, limpia, sin emojis y enfocada en el agricultor.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Inicialización de motores del Sistema Experto
  const engine = new InferenceEngine(KNOWLEDGE_BASE);
  const explainer = new ExplanationModule(KNOWLEDGE_BASE);

  // Estado reactivo
  const state = {
    selectedCropId: null,
    selectedSymptomIds: new Set(),
    activeOrgan: "all",
    inferenceResult: null,
    calc: {
      area: 1.0,
      unit: "ha",
      equipment: "mochila_20"
    }
  };

  // Elementos DOM principales
  const cropGrid = document.getElementById("crop-grid");
  const stepSymptoms = document.getElementById("step-symptoms");
  const organFilters = document.getElementById("organ-filters");
  const symptomsGrid = document.getElementById("symptoms-grid");
  const symptomsCountBadge = document.getElementById("symptoms-count-badge");
  const btnRunDiagnosis = document.getElementById("btn-run-diagnosis");
  const btnReset = document.getElementById("btn-reset");

  // Resultados
  const resultsWrapper = document.getElementById("results-wrapper");
  const cardDiagnosis = document.getElementById("card-diagnosis");
  const cardTreatment = document.getElementById("card-treatment");
  const cardCalculator = document.getElementById("card-calculator");

  // Inputs de la calculadora
  const inputArea = document.getElementById("calc-area-val");
  const selectUnit = document.getElementById("calc-area-unit");
  const selectEquipment = document.getElementById("calc-equipment");
  const displayCalculator = document.getElementById("calculator-display");

  // Modal / Drawer Académico
  const btnOpenAcademic = document.getElementById("btn-open-academic");
  const academicDrawer = document.getElementById("academic-drawer");
  const academicBackdrop = document.getElementById("academic-backdrop");
  const btnCloseAcademic = document.getElementById("btn-close-academic");
  const academicTabs = document.querySelectorAll(".academic-tab-btn");
  const academicPanels = document.querySelectorAll(".academic-panel");
  const boxWhy = document.getElementById("academic-why-box");
  const boxHow = document.getElementById("academic-how-box");
  const boxRawTrace = document.getElementById("academic-trace-box");
  const boxRules = document.getElementById("academic-rules-box");
  const boxClips = document.getElementById("academic-clips-box");
  const btnDownloadClips = document.getElementById("btn-download-clips");

  // Fallback neutral de imagen
  window.handleImgFallback = function(imgEl, label) {
    imgEl.onerror = null;
    const parent = imgEl.parentElement;
    imgEl.style.display = "none";
    const placeholder = document.createElement("div");
    placeholder.className = "w-full h-full min-h-[140px] flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 text-center";
    placeholder.innerHTML = `
      <svg class="w-8 h-8 mb-1 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <span class="text-xs font-semibold text-slate-500">${label || "Imagen botánica"}</span>
    `;
    parent.appendChild(placeholder);
  };

  // =========================================================================
  // 1. RENDERIZAR CULTIVOS (PASO 1)
  // =========================================================================
  function renderCrops() {
    cropGrid.innerHTML = "";
    KNOWLEDGE_BASE.crops.forEach((crop) => {
      const isSelected = state.selectedCropId === crop.id;
      const card = document.createElement("div");
      card.className = `crop-card cursor-pointer rounded-2xl border-2 overflow-hidden bg-white shadow-sm ${
        isSelected ? "card-checked border-emerald-700 ring-2 ring-emerald-600/30" : "border-slate-200 hover:border-slate-300"
      }`;

      card.innerHTML = `
        <div class="h-40 w-full relative bg-slate-100 overflow-hidden">
          <img src="${crop.image}" alt="${crop.name}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onerror="handleImgFallback(this, '${crop.name}')" />
          <div class="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold">
            ${crop.varieties}
          </div>
        </div>
        <div class="p-4 space-y-2">
          <div class="flex items-center justify-between">
            <h3 class="font-extrabold text-slate-900 text-lg leading-tight">${crop.name}</h3>
            <span class="text-xs font-bold ${isSelected ? "text-emerald-700" : "text-slate-400"}">
              ${isSelected ? "Seleccionado" : "Elegir"}
            </span>
          </div>
          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">${crop.summary}</p>
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span class="text-slate-400">Zona: <b class="text-slate-600">${crop.zone}</b></span>
            <div class="w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-400"}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      `;

      card.addEventListener("click", () => selectCrop(crop.id));
      cropGrid.appendChild(card);
    });
  }

  function selectCrop(cropId) {
    state.selectedCropId = cropId;
    state.selectedSymptomIds.clear();
    state.inferenceResult = null;

    const crop = KNOWLEDGE_BASE.crops.find((c) => c.id === cropId);
    const selectedCropLabel = document.getElementById("selected-crop-label");
    if (selectedCropLabel && crop) {
      selectedCropLabel.textContent = `${crop.name} (${crop.varieties})`;
    }

    stepSymptoms.classList.remove("hidden");
    resultsWrapper.classList.add("hidden");

    renderCrops();
    renderOrganFilters();
    renderSymptoms();
    updateSubmitButton();

    stepSymptoms.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const btnChangeCrop = document.getElementById("btn-change-crop");
  if (btnChangeCrop) {
    btnChangeCrop.addEventListener("click", () => {
      document.getElementById("step-crop").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  // =========================================================================
  // 2. FILTROS Y SÍNTOMAS (PASO 2)
  // =========================================================================
  function renderOrganFilters() {
    const cropSymptoms = KNOWLEDGE_BASE.symptoms.filter((s) => s.cropId === state.selectedCropId);
    const organs = ["all", ...new Set(cropSymptoms.map((s) => s.organ))];

    organFilters.innerHTML = "";
    organs.forEach((organ) => {
      const btn = document.createElement("button");
      const isActive = state.activeOrgan === organ;
      const label = organ === "all" ? "Todas las partes" : organ;

      btn.className = `px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
        isActive
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
      }`;
      btn.textContent = label;
      btn.addEventListener("click", () => {
        state.activeOrgan = organ;
        renderOrganFilters();
        renderSymptoms();
      });
      organFilters.appendChild(btn);
    });
  }

  function renderSymptoms() {
    symptomsGrid.innerHTML = "";
    const cropSymptoms = KNOWLEDGE_BASE.symptoms.filter((s) => s.cropId === state.selectedCropId);
    const filtered = cropSymptoms.filter((s) => {
      if (state.activeOrgan === "all") return true;
      return s.organ === state.activeOrgan;
    });

    if (filtered.length === 0) {
      symptomsGrid.innerHTML = `
        <div class="col-span-full py-8 text-center text-slate-400 text-sm">
          No hay síntomas registrados para esta parte de la planta.
        </div>
      `;
      return;
    }

    filtered.forEach((symptom) => {
      const isSelected = state.selectedSymptomIds.has(symptom.id);
      const card = document.createElement("div");
      card.className = `symptom-card cursor-pointer rounded-2xl border-2 overflow-hidden bg-white shadow-sm ${
        isSelected ? "card-checked border-emerald-700 ring-2 ring-emerald-600/30" : "border-slate-200 hover:border-slate-300"
      }`;

      card.innerHTML = `
        <div class="h-36 w-full relative bg-slate-100 overflow-hidden">
          <img src="${symptom.image}" alt="${symptom.name}" class="w-full h-full object-cover" onerror="handleImgFallback(this, '${symptom.organ}')" />
          <div class="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[11px] font-bold">
            ${symptom.organ}
          </div>
          <div class="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${
            isSelected ? "bg-emerald-700 text-white" : "bg-white text-slate-400 border border-slate-300"
          }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="${isSelected ? 'M5 13l4 4L19 7' : 'M12 4v16m8-8H4'}" />
            </svg>
          </div>
        </div>
        <div class="p-4 space-y-1.5">
          <h4 class="font-bold text-slate-900 text-sm leading-snug line-clamp-2">${symptom.name}</h4>
          <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">${symptom.description}</p>
        </div>
      `;

      card.addEventListener("click", () => toggleSymptom(symptom.id));
      symptomsGrid.appendChild(card);
    });

    symptomsCountBadge.textContent = `${state.selectedSymptomIds.size} seleccionados`;
  }

  function toggleSymptom(symptomId) {
    if (state.selectedSymptomIds.has(symptomId)) {
      state.selectedSymptomIds.delete(symptomId);
    } else {
      state.selectedSymptomIds.add(symptomId);
    }
    renderSymptoms();
    updateSubmitButton();
  }

  function updateSubmitButton() {
    const hasSymptoms = state.selectedSymptomIds.size > 0;
    btnRunDiagnosis.disabled = !hasSymptoms;
    if (hasSymptoms) {
      btnRunDiagnosis.classList.remove("opacity-50", "cursor-not-allowed");
      btnRunDiagnosis.classList.add("shadow-lg");
    } else {
      btnRunDiagnosis.classList.add("opacity-50", "cursor-not-allowed");
      btnRunDiagnosis.classList.remove("shadow-lg");
    }
  }

  // =========================================================================
  // 3. INFERENCIA Y RESULTADOS (PASOS 3, 4 Y 5)
  // =========================================================================
  btnRunDiagnosis.addEventListener("click", () => {
    if (!state.selectedCropId || state.selectedSymptomIds.size === 0) return;

    const result = engine.runForwardChaining(
      state.selectedCropId,
      Array.from(state.selectedSymptomIds)
    );

    state.inferenceResult = result;
    renderResults(result);
    updateAcademicDrawer(result);

    resultsWrapper.classList.remove("hidden");
    resultsWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function renderResults(result) {
    const printDateEl = document.getElementById("print-date");
    if (printDateEl) {
      printDateEl.textContent = new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
    }

    if (!result.success) {
      if (result.hasPartialMatch) {
        cardDiagnosis.innerHTML = `
          <div class="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 md:p-8 space-y-5">
            <div class="flex items-start gap-3.5">
              <div class="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div class="space-y-1">
                <span class="text-xs font-black uppercase tracking-wider text-amber-800">Diagnóstico Preliminar (${result.certaintyFactor}% de Indicios)</span>
                <h3 class="text-xl md:text-2xl font-black text-amber-950">Sospecha de: ${result.possibleDiagnosis.name}</h3>
                <p class="text-xs text-amber-900 font-medium italic">${result.possibleDiagnosis.scientificName}</p>
              </div>
            </div>

            <p class="text-xs md:text-sm text-amber-900 leading-relaxed">
              Las señales que marcó sugieren la presencia de este problema, pero para confirmar con certeza técnica antes de fumigar, <b>¿observa también alguna de las siguientes señales en su chacra?</b>
            </p>

            <div class="space-y-2 pt-1">
              <span class="text-xs font-bold text-amber-950 block">Haga clic sobre la señal que vea para incluirla y confirmar el diagnóstico:</span>
              <div class="flex flex-wrap gap-2">
                ${result.suggestedSymptoms.map(sym => `
                  <button data-sym-id="${sym.id}" class="btn-add-partial-sym bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border-2 border-amber-300 hover:border-emerald-600 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer">
                    <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>${sym.name} <span class="text-slate-400 font-normal">(${sym.organ})</span></span>
                  </button>
                `).join("")}
              </div>
            </div>

            <div class="pt-3 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span class="text-amber-800">Si no observa estas señales, revise otras partes de la planta en el Paso 2 arriba.</span>
              <button id="btn-show-partial-treatment" class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer">
                Ver tratamiento preventivo recomendado
              </button>
            </div>
          </div>
        `;
        cardTreatment.innerHTML = "";
        displayCalculator.innerHTML = "";
        cardCalculator.classList.add("hidden");

        // Listener para añadir síntoma sugerido
        document.querySelectorAll(".btn-add-partial-sym").forEach(b => {
          b.addEventListener("click", () => {
            const symId = b.getAttribute("data-sym-id");
            state.selectedSymptomIds.add(symId);
            renderSymptoms();
            updateSubmitButton();
            btnRunDiagnosis.click();
          });
        });

        // Listener para ver tratamiento preventivo
        const btnShowPartialTreatment = document.getElementById("btn-show-partial-treatment");
        if (btnShowPartialTreatment) {
          btnShowPartialTreatment.addEventListener("click", () => {
            renderTreatmentCard(result.rule.treatment, true);
            cardCalculator.classList.remove("hidden");
            state.inferenceResult = {
              success: true,
              winningRule: result.rule,
              treatment: result.rule.treatment,
              diagnosis: result.rule.diagnosis,
              certaintyFactor: result.certaintyFactor
            };
            runCalculation();
            updateAcademicDrawer(state.inferenceResult);
          });
        }
        return;
      }

      cardDiagnosis.innerHTML = `
        <div class="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-3">
          <h3 class="text-base font-extrabold text-amber-900">No se identificó el problema con total certeza</h3>
          <p class="text-xs text-amber-800 leading-relaxed">
            Las señales seleccionadas no coinciden suficientemente con las reglas de plagas registradas para este cultivo.
          </p>
          <p class="text-xs text-slate-600 font-medium">
            Le recomendamos volver a revisar la mata y marcar otros síntomas visibles en hojas, tallos o raíces.
          </p>
        </div>
      `;
      cardTreatment.innerHTML = "";
      displayCalculator.innerHTML = "";
      cardCalculator.classList.add("hidden");
      return;
    }

    const { diagnosis, treatment, certaintyFactor } = result;
    cardCalculator.classList.remove("hidden");

    // --- PASO 3: DIAGNÓSTICO ---
    cardDiagnosis.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-400">Paso 3</span>
            <span class="text-xs text-slate-400">•</span>
            <span class="text-xs text-slate-200 font-medium">Diagnóstico Fitosanitario</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 font-medium">Certeza:</span>
            <span class="bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              ${certaintyFactor}%
            </span>
          </div>
        </div>

        <div class="p-5 md:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div class="md:col-span-4">
            <div class="rounded-2xl overflow-hidden shadow-sm aspect-video md:aspect-square bg-slate-100">
              <img src="${diagnosis.image}" alt="${diagnosis.name}" class="w-full h-full object-cover" onerror="handleImgFallback(this, '${diagnosis.name}')" />
            </div>
            <p class="text-[11px] text-center text-slate-400 mt-1.5 italic">${diagnosis.scientificName}</p>
          </div>

          <div class="md:col-span-8 space-y-3">
            <div>
              <span class="text-xs font-bold text-emerald-700 tracking-wide uppercase">${diagnosis.category}</span>
              <h3 class="text-2xl font-black text-slate-900 leading-tight mt-0.5">${diagnosis.name}</h3>
              <p class="text-xs font-semibold text-slate-500 italic">${diagnosis.scientificName}</p>
            </div>

            <p class="text-sm text-slate-600 leading-relaxed">${diagnosis.description}</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div class="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span class="text-slate-500 font-semibold block">Nivel de daño:</span>
                <span class="text-red-700 font-bold block mt-0.5">${diagnosis.dangerLevel}</span>
              </div>
              <div class="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                <span class="text-slate-500 font-semibold block">Vigilancia oficial (SENASA):</span>
                <span class="text-slate-700 font-bold block mt-0.5">${diagnosis.senasaStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // --- PASO 4: TRATAMIENTO ---
    renderTreatmentCard(treatment, false);

    // --- RECALCULAR PASO 5: CALCULADORA AGRÍCOLA ---
    runCalculation();
  }

  function renderTreatmentCard(treatment, isPreliminary = false) {
    const chem = treatment.chemical;
    const bio = treatment.biological;

    let badgeBand = "band-blue";
    if (chem.toxicologicalBand.includes("Verde")) badgeBand = "band-green";
    if (chem.toxicologicalBand.includes("Amarill")) badgeBand = "band-yellow";

    cardTreatment.innerHTML = `
      <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-6 p-5 md:p-7">
        <div class="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-emerald-700 tracking-wider uppercase">Paso 4</span>
              ${isPreliminary ? '<span class="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">PREVENTIVO / PRELIMINAR</span>' : ''}
            </div>
            <h3 class="text-lg md:text-xl font-extrabold text-slate-900">${treatment.title}</h3>
            <p class="text-xs text-slate-500 mt-0.5">Control integrado para detener la plaga sin perjudicar la fertilidad del suelo.</p>
          </div>
        </div>

        <!-- Opción 1: Químico -->
        <div class="border border-slate-200 rounded-2xl p-5 bg-slate-50/60 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <h4 class="font-extrabold text-slate-900 text-sm md:text-base">1. Control Químico Técnico</h4>
            <span class="text-xs font-bold px-3 py-1 rounded-full ${badgeBand}">
              ${chem.toxicologicalBand}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span class="text-slate-500 font-semibold block">Producto comercial recomendado:</span>
              <span class="font-extrabold text-slate-900 text-sm block mt-0.5">${chem.productName}</span>
              <span class="text-slate-500 block text-[11px] mt-0.5">I.A.: ${chem.activeIngredient}</span>
            </div>

            <div>
              <span class="text-slate-500 font-semibold block">Dosis técnica base:</span>
              <span class="font-extrabold text-emerald-800 text-sm block mt-0.5">${chem.dosageBasePerHa} ${chem.dosageUnit}</span>
              <span class="text-slate-500 block text-[11px] mt-0.5">Volumen base: ${chem.waterVolumePerHa} L agua/ha</span>
            </div>

            <div>
              <span class="text-slate-500 font-semibold block">Tiempos de seguridad:</span>
              <span class="font-extrabold text-slate-800 text-sm block mt-0.5">Carencia: ${chem.safetyIntervalDays} días antes de cosecha</span>
              <span class="text-slate-500 block text-[11px] mt-0.5">Reingreso al lote: ${chem.reentryHours} horas</span>
            </div>
          </div>
        </div>

        <!-- Opción 2: Biológico y Cultural -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border border-emerald-200 bg-emerald-50/40 p-4 rounded-2xl text-xs space-y-2">
            <h4 class="font-bold text-emerald-900 text-sm">2. Opción Biológica / Ecológica</h4>
            <p class="font-extrabold text-slate-900">${bio.name}</p>
            <p class="text-slate-600 leading-relaxed">${bio.details}</p>
            <p class="text-emerald-800 font-bold pt-1">Dosis recomendada: ${bio.dosageBasePerHa} ${bio.dosageUnit}</p>
          </div>

          <div class="border border-slate-200 bg-slate-50 p-4 rounded-2xl text-xs space-y-2">
            <h4 class="font-bold text-slate-900 text-sm">3. Manejo en la Chacra</h4>
            <ul class="list-disc list-inside space-y-1 text-slate-600 leading-relaxed">
              ${treatment.cultural.map((c) => `<li>${c}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 4. CALCULADORA PRÁCTICA (PASO 5)
  // =========================================================================
  function runCalculation() {
    if (!state.inferenceResult || !state.inferenceResult.treatment) return;

    const chem = state.inferenceResult.treatment.chemical;
    const areaVal = parseFloat(inputArea.value) || 0;
    const unitVal = selectUnit.value;
    const equipVal = selectEquipment.value;

    const calcResult = AgronomicCalculator.calculateDosage(chem, areaVal, unitVal, equipVal);
    if (!calcResult) return;

    if (!calcResult.valid) {
      displayCalculator.innerHTML = `
        <div class="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-center text-xs text-amber-900 font-bold">
          ${calcResult.message}
        </div>
      `;
      return;
    }

    displayCalculator.innerHTML = `
      <div class="bg-slate-900 text-white rounded-2xl p-5 md:p-6 space-y-6">
        <div class="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
          <div>
            <span class="text-xs text-emerald-400 font-semibold">Resumen de Preparación</span>
            <h4 class="text-lg font-black text-white">Superficie: ${calcResult.inputArea} ${calcResult.inputUnit.toUpperCase()} (${calcResult.areaInHectares} hectáreas)</h4>
          </div>
          <span class="text-xs font-bold bg-white/10 text-slate-200 px-3 py-1 rounded-full border border-white/10">
            ${calcResult.equipment.name}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <span class="text-xs text-slate-400 block font-medium">Producto a comprar en la tienda:</span>
            <span class="text-2xl font-black text-amber-300 block mt-1">${calcResult.totalProduct}</span>
            <span class="text-[11px] text-slate-400 block mt-0.5">Para fumigar todo su lote</span>
          </div>

          <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <span class="text-xs text-slate-400 block font-medium">Agua limpia requerida:</span>
            <span class="text-2xl font-black text-cyan-300 block mt-1">${calcResult.totalWaterLiters} Litros</span>
            <span class="text-[11px] text-slate-400 block mt-0.5">Agua fresca con pH corregido</span>
          </div>

          <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <span class="text-xs text-slate-400 block font-medium">Cargas totales a preparar:</span>
            <span class="text-2xl font-black text-emerald-400 block mt-1">${calcResult.equipment.totalTanksLabel}</span>
            <span class="text-[11px] text-slate-400 block mt-0.5">Capacidad: ${calcResult.equipment.tankCapacity}</span>
          </div>
        </div>

        <div class="bg-emerald-950 border border-emerald-600/40 rounded-xl p-4">
          <div class="space-y-2">
            <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider block">¿Cuánto mezclar por cada carga?</span>
            <p class="text-lg md:text-xl font-black text-white">
              Echar <span class="text-amber-300 underline">${calcResult.equipment.dosePerTank}</span>
            </p>
            <p class="text-xs text-slate-300 leading-relaxed pt-1">
              <b>Medida de campo:</b> ${calcResult.equipment.practicalMeasuringTip}
            </p>
            <div class="bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-200 leading-relaxed mt-2">
              <b>Consejo agronómico:</b> ${calcResult.equipment.goldenRule}
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span class="font-bold text-slate-200 block">Seguridad obligatoria:</span>
            <span class="text-[11px] text-slate-400">Usar botas de jebe, guantes y mascarilla al momento de mezclar y pulverizar.</span>
          </div>
          <span class="text-[11px] bg-slate-800 text-slate-300 px-3 py-1 rounded-md">
            Carencia: ${calcResult.safety.safetyIntervalDays} días antes de cosechar
          </span>
        </div>
      </div>
    `;
  }

  inputArea.addEventListener("input", runCalculation);
  selectUnit.addEventListener("change", runCalculation);
  selectEquipment.addEventListener("change", runCalculation);

  // =========================================================================
  // 5. MODAL / DRAWER ACADÉMICO PARA SUSTENTACIÓN (UNJFSC)
  // =========================================================================
  function openAcademicDrawer() {
    academicDrawer.classList.remove("translate-x-full");
    academicBackdrop.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  function closeAcademicDrawer() {
    academicDrawer.classList.add("translate-x-full");
    academicBackdrop.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  if (btnOpenAcademic) btnOpenAcademic.addEventListener("click", openAcademicDrawer);
  if (btnCloseAcademic) btnCloseAcademic.addEventListener("click", closeAcademicDrawer);
  if (academicBackdrop) academicBackdrop.addEventListener("click", closeAcademicDrawer);

  academicTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-academic-tab");
      academicTabs.forEach((t) => {
        t.classList.remove("bg-slate-900", "text-white");
        t.classList.add("bg-slate-100", "text-slate-600");
      });
      tab.classList.remove("bg-slate-100", "text-slate-600");
      tab.classList.add("bg-slate-900", "text-white");

      academicPanels.forEach((p) => {
        if (p.id === `academic-panel-${target}`) {
          p.classList.remove("hidden");
        } else {
          p.classList.add("hidden");
        }
      });
    });
  });

  function updateAcademicDrawer(result) {
    if (!result || !result.success) return;

    const whyData = explainer.generateWhyExplanation(result);
    const howData = explainer.generateHowExplanation(result);

    // ¿Por qué?
    boxWhy.innerHTML = `
      <div class="space-y-3 text-xs">
        <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
          <span class="font-bold text-emerald-900 block text-sm">Regla disparada: [${whyData.ruleCode}] ${whyData.ruleName}</span>
          <span class="text-emerald-700">Meta deducida: ${whyData.diagnosis} (Certeza: ${whyData.certainty}%)</span>
        </div>
        <div>
          <span class="font-bold text-slate-800 block mb-1">Premisas verificadas (SI):</span>
          <ul class="list-disc list-inside space-y-0.5 text-slate-600">
            ${whyData.satisfiedConditions.map((c) => `<li>${c}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;

    // ¿Cómo?
    boxHow.innerHTML = `
      <div class="space-y-2 text-xs">
        ${howData.steps.map((s) => `
          <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span class="font-bold text-slate-800">${s.order}. ${s.title}</span>
            <p class="text-slate-600 text-[11px] mt-0.5">${s.detail}</p>
          </div>
        `).join("")}
      </div>
    `;

    // Traza cruda JSON
    boxRawTrace.textContent = JSON.stringify(howData.rawTrace, null, 2);
  }

  // Renderizar catálogo de reglas y código CLIPS
  function renderRules() {
    boxRules.innerHTML = "";
    KNOWLEDGE_BASE.rules.forEach((r) => {
      const card = document.createElement("div");
      card.className = "p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] space-y-1";
      card.innerHTML = `
        <div class="font-bold text-emerald-800">[${r.code}] ${r.name}</div>
        <div class="text-slate-600">SI: cultivo == '${r.cropId}' Y síntomas obligatorios [${r.requiredSymptoms.join(", ")}]</div>
        <div class="text-slate-800 font-bold">ENTONCES: diagnosticar('${r.diagnosis.name}') + dosis ${r.treatment.chemical.dosageBasePerHa} ${r.treatment.chemical.dosageUnit}</div>
      `;
      boxRules.appendChild(card);
    });
  }

  if (typeof CLIPS_SOURCE_CODE !== "undefined" && boxClips) {
    boxClips.textContent = CLIPS_SOURCE_CODE;
  }

  if (btnDownloadClips) {
    btnDownloadClips.addEventListener("click", () => {
      const code = boxClips.textContent;
      const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sistema_experto_agricola.clp";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Reiniciar
  btnReset.addEventListener("click", () => {
    state.selectedCropId = null;
    state.selectedSymptomIds.clear();
    state.inferenceResult = null;
    stepSymptoms.classList.add("hidden");
    resultsWrapper.classList.add("hidden");
    renderCrops();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Inicio
  renderCrops();
  renderRules();
});
