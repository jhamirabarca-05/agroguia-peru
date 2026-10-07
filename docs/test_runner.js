const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
const HTML_FILE = "file:///" + path.resolve(__dirname, "index.html").replace(/\\/g, "/");

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result ? res.result.value : null;
  }

  async screenshot(filePath) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`[Screenshot] Saved ${path.basename(filePath)} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runTests() {
  const port = 9334;
  console.log("=== INICIANDO PRUEBAS COMPLETAS DE EXPERIENCIA DE USUARIO (UX) ===");
  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    "--window-size=1280,1000",
    "--disable-gpu",
    HTML_FILE
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    if (!targets || targets.length === 0) throw new Error("No se pudo conectar a Chrome CDP");
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("Runtime.enable");

    // 1. CARGA INICIAL
    console.log("\n[1] Verificando pantalla de inicio...");
    const title = await client.eval("document.title");
    console.log("  Título:", title);
    const cropCount = await client.eval("document.querySelectorAll('.crop-card').length");
    console.log("  Cultivos renderizados:", cropCount);
    await client.screenshot(path.join(__dirname, "ux_step1_inicio.png"));

    // 2. SELECCIONAR MAÍZ Y PROBAR ASISTENTE DE DESAMBIGUACIÓN (SÓLO 1 SÍNTOMA)
    console.log("\n[2] Probando flujo con síntoma parcial (Asistente de desambiguación)...");
    await client.eval(`
      const card = Array.from(document.querySelectorAll('.crop-card')).find(c => c.textContent.includes('Maíz'));
      if (card) card.click();
    `);
    await sleep(300);

    const bannerCropText = await client.eval("document.getElementById('selected-crop-label').textContent");
    console.log("  Banner de cultivo activo:", bannerCropText);

    // Marcar SOLO "Residuo marrón húmedo (aserrín)"
    await client.eval(`
      const sym = Array.from(document.querySelectorAll('.symptom-card')).find(c => c.textContent.includes('aserrín') || c.textContent.includes('Aserrín'));
      if (sym) sym.click();
    `);
    await sleep(200);

    // Clic en Identificar problema
    await client.eval("document.getElementById('btn-run-diagnosis').click()");
    await sleep(400);

    const partialTitle = await client.eval("document.querySelector('#card-diagnosis h3')?.textContent");
    const partialSuggs = await client.eval("document.querySelectorAll('.btn-add-partial-sym').length");
    console.log("  Título diagnóstico preliminar:", partialTitle);
    console.log("  Botones de sugerencias interactivas generadas:", partialSuggs);
    await client.screenshot(path.join(__dirname, "ux_step2_asistente_parcial.png"));

    // 3. CLIC EN LA SUGERENCIA INTERACTIVA "+ [Hojas comidas]"
    console.log("\n[3] Probando clic en sugerencia complementaria...");
    await client.eval("document.querySelector('.btn-add-partial-sym')?.click()");
    await sleep(500);

    const fullDiag = await client.eval("document.querySelector('#card-diagnosis h3')?.textContent");
    const fullCert = await client.eval("document.querySelector('#card-diagnosis .bg-emerald-600')?.textContent?.trim()");
    console.log("  Diagnóstico confirmado:", fullDiag, "Certeza:", fullCert);
    await client.screenshot(path.join(__dirname, "ux_step3_diagnostico_confirmado.png"));

    // 4. PROBAR CALCULADORA CON MEDIDAS DE CAMPO Y VALIDACIÓN
    console.log("\n[4] Probando calculadora con validación y medidas prácticas...");
    // Caso inválido: área = 0
    await client.eval(`
      const inp = document.getElementById('calc-area-val');
      inp.value = '0';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    `);
    await sleep(200);
    const zeroMsg = await client.eval("document.querySelector('#calculator-display .text-amber-900')?.textContent?.trim()");
    console.log("  Mensaje amigable con área 0:", zeroMsg);

    // Caso válido: 2 topos en mochila de 20L
    await client.eval(`
      const inp = document.getElementById('calc-area-val');
      inp.value = '2';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      const selUnit = document.getElementById('calc-area-unit');
      selUnit.value = 'topos';
      selUnit.dispatchEvent(new Event('change', { bubbles: true }));
    `);
    await sleep(200);

    const calcHeader = await client.eval("document.querySelector('#calculator-display h4')?.textContent");
    const totalProd = await client.eval("document.querySelector('#calculator-display .text-amber-300')?.textContent");
    const doseMeasure = await client.eval("document.querySelector('#calculator-display .bg-emerald-950 p:nth-child(3)')?.textContent?.trim()");
    const goldenRule = await client.eval("document.querySelector('#calculator-display .bg-emerald-900\\\\/40')?.textContent?.trim()");

    console.log("  Cálculo para 2 topos:", calcHeader);
    console.log("  Producto total:", totalProd);
    console.log("  Medida práctica:", doseMeasure);
    console.log("  Regla de oro de campo:", goldenRule?.substring(0, 90) + "...");
    await client.screenshot(path.join(__dirname, "ux_step4_calculadora_topos.png"));

    // 5. PROBAR MODO DOCENTE (SUSTENTACIÓN UNJFSC)
    console.log("\n[5] Probando Modo Docente y pestañas teóricas...");
    await client.eval("document.getElementById('btn-open-academic').click()");
    await sleep(400);

    const drawerOpen = await client.eval("!document.getElementById('academic-drawer').classList.contains('translate-x-full')");
    console.log("  Drawer desplegado:", drawerOpen);

    // Ver pestaña ¿Cómo? (Traza cronológica)
    await client.eval("document.querySelector('[data-academic-tab=\"how\"]').click()");
    await sleep(300);
    const howSteps = await client.eval("document.querySelectorAll('#academic-how-box > div').length");
    console.log("  Pasos deductivos formales en ¿Cómo?:", howSteps);
    await client.screenshot(path.join(__dirname, "ux_step5_modo_docente_traza.png"));

    // Cerrar drawer
    await client.eval("document.getElementById('btn-close-academic').click()");
    await sleep(300);

    // 6. PROBAR CULTIVO PAPA: RANCHA (TIZÓN TARDÍO)
    console.log("\n[6] Probando flujo con cultivo Papa (Rancha / Phytophthora)...");
    await client.eval("document.getElementById('btn-change-crop').click()");
    await sleep(300);

    await client.eval(`
      const papaCard = Array.from(document.querySelectorAll('.crop-card')).find(c => c.textContent.includes('Papa'));
      if (papaCard) papaCard.click();
    `);
    await sleep(300);

    // Seleccionar síntomas de rancha
    await client.eval(`
      const sym1 = Array.from(document.querySelectorAll('.symptom-card')).find(c => c.textContent.includes('Manchas oscuras húmedas'));
      if (sym1) sym1.click();
      const sym2 = Array.from(document.querySelectorAll('.symptom-card')).find(c => c.textContent.includes('Pelusa blanquecina'));
      if (sym2) sym2.click();
    `);
    await sleep(200);

    await client.eval("document.getElementById('btn-run-diagnosis').click()");
    await sleep(400);

    const papaDiag = await client.eval("document.querySelector('#card-diagnosis h3')?.textContent");
    const papaChem = await client.eval("document.querySelector('#card-treatment .text-slate-900.text-sm.block')?.textContent");
    console.log("  Diagnóstico Papa:", papaDiag);
    console.log("  Producto recomendado:", papaChem);
    await client.screenshot(path.join(__dirname, "ux_step6_papa_rancha.png"));

    // 7. RESPONSIVIDAD MÓVIL (390 x 844 px)
    console.log("\n[7] Verificando responsividad móvil en resolución de celular (390 x 844)...");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await sleep(400);
    await client.screenshot(path.join(__dirname, "ux_step7_mobile_view.png"));

    console.log("\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!");
    client.close();
  } finally {
    chromeProc.kill();
  }
}

runTests().catch(err => {
  console.error("Error en pruebas:", err);
  process.exit(1);
});
