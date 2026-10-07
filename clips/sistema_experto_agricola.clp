;; ==============================================================================
;; SISTEMA EXPERTO FITOSANITARIO AGRÍCOLA PARA EL PERÚ
;; Asignatura: Sistemas de Expertos - E.P. Ingeniería de Sistemas
;; Universidad Nacional José Faustino Sánchez Carrión (UNJFSC - Huacho)
;; Docente: Ing. Juan C. Meyhuay Fidel
;; Sintaxis: CLIPS 6.30
;; ==============================================================================

;; ------------------------------------------------------------------------------
;; 1. PLANTILLAS (DEF-TEMPLATES - REPRESENTACIÓN DEL CONOCIMIENTO)
;; ------------------------------------------------------------------------------

(deftemplate cultivo
   (slot id (type SYMBOL))
   (slot nombre (type STRING))
)

(deftemplate sintoma
   (slot id (type SYMBOL))
   (slot nombre (type STRING))
   (slot organo (type STRING))
)

(deftemplate diagnostico
   (slot id (type SYMBOL))
   (slot plaga (type STRING))
   (slot cientifico (type STRING))
   (slot categoria (type STRING))
   (slot certeza (type INTEGER))
)

(deftemplate tratamiento
   (slot id (type SYMBOL))
   (slot producto-quimico (type STRING))
   (slot dosis-ha (type STRING))
   (slot agua-ha (type STRING))
   (slot control-biologico (type STRING))
)

(deftemplate dosificacion-campo
   (slot hectareas (type FLOAT))
   (slot equipo (type STRING))
   (slot total-producto (type STRING))
   (slot total-agua (type STRING))
   (slot dosis-por-tanque (type STRING))
)

;; ------------------------------------------------------------------------------
;; 2. REGLAS DE PRODUCCIÓN: CULTIVO DE MAÍZ (Zea mays)
;; ------------------------------------------------------------------------------

(defrule regla-maiz-cogollero
   "Detección de Spodoptera frugiperda en maíz"
   (cultivo (id maiz))
   (sintoma (id hojas-mordidas))
   (sintoma (id aserrin-cogollo))
   =>
   (assert (diagnostico 
      (id diag-cogollero)
      (plaga "Gusano Cogollero del Maiz")
      (cientifico "Spodoptera frugiperda")
      (categoria "Plaga Insectil (Noctuidae)")
      (certeza 95)))
   (assert (tratamiento 
      (id trat-cogollero)
      (producto-quimico "Emamectina Benzoato 5% SG")
      (dosis-ha "150 g/ha")
      (agua-ha "200 L/ha")
      (control-biologico "Bacillus thuringiensis kurstaki (500 g/ha)")))
   (printout t "==========================================================" crlf)
   (printout t "[REGLA DISPARADA]: R-MZ-01 -> Gusano Cogollero detectado." crlf)
   (printout t "Certeza: 95% | Prescripcion: Emamectina Benzoato 150 g/ha" crlf)
   (printout t "==========================================================" crlf)
)

(defrule regla-maiz-mancha-asfalto
   "Detección de Complejo Mancha de Asfalto en maíz"
   (cultivo (id maiz))
   (sintoma (id puntos-negros-hojas))
   (sintoma (id secado-follaje))
   =>
   (assert (diagnostico 
      (id diag-mancha-asfalto)
      (plaga "Complejo Mancha de Asfalto")
      (cientifico "Phyllachora maydis + Monographella maydis")
      (categoria "Enfermedad Fungosa Foliar")
      (certeza 90)))
   (assert (tratamiento 
      (id trat-mancha-asfalto)
      (producto-quimico "Azoxistrobina 200 g/L + Ciproconazol 80 g/L")
      (dosis-ha "350 ml/ha")
      (agua-ha "250 L/ha")
      (control-biologico "Trichoderma harzianum preventivo")))
   (printout t "[REGLA DISPARADA]: R-MZ-02 -> Mancha de Asfalto detectada." crlf)
)

(defrule regla-maiz-deficiencia-nitrogeno
   "Detección de deficiencia nutricional de nitrógeno"
   (cultivo (id maiz))
   (sintoma (id amarilleo-v))
   (sintoma (id retraso-crecimiento))
   =>
   (assert (diagnostico 
      (id diag-def-nitrogeno)
      (plaga "Deficiencia Severa de Nitrogeno")
      (cientifico "Trastorno Nutricional Abiotico")
      (categoria "Deficiencia Nutricional")
      (certeza 92)))
   (assert (tratamiento 
      (id trat-def-nitrogeno)
      (producto-quimico "Urea Agricola 46% N fraccionada")
      (dosis-ha "100 kg/ha al aporque")
      (agua-ha "Riego inmediato")
      (control-biologico "Inoculacion de Azospirillum brasilense")))
   (printout t "[REGLA DISPARADA]: R-MZ-03 -> Deficiencia de Nitrogeno." crlf)
)

;; ------------------------------------------------------------------------------
;; 3. REGLAS DE PRODUCCIÓN: CULTIVO DE PAPA (Solanum tuberosum)
;; ------------------------------------------------------------------------------

(defrule regla-papa-rancha
   "Detección de Phytophthora infestans en papa"
   (cultivo (id papa))
   (sintoma (id manchas-acuosas))
   (sintoma (id pelusa-enves))
   =>
   (assert (diagnostico 
      (id diag-rancha)
      (plaga "Rancha o Tizon Tardio de la Papa")
      (cientifico "Phytophthora infestans")
      (categoria "Oomyceto Fitosanitario Critico")
      (certeza 98)))
   (assert (tratamiento 
      (id trat-rancha)
      (producto-quimico "Mancozeb 64% + Metalaxil-M 4% WP")
      (dosis-ha "2.0 kg/ha")
      (agua-ha "300 L/ha")
      (control-biologico "Extracto de Cola de Caballo + Cobre quelatado")))
   (printout t "==========================================================" crlf)
   (printout t "[REGLA DISPARADA]: R-PP-01 -> RANCHA DETECTADA (ALERTA FITOSANITARIA)" crlf)
   (printout t "==========================================================" crlf)
)

(defrule regla-papa-gorgojo
   "Detección de Premnotrypes suturicallus en papa"
   (cultivo (id papa))
   (sintoma (id mordedura-semilunar))
   (sintoma (id galerias-tuberculo))
   =>
   (assert (diagnostico 
      (id diag-gorgojo)
      (plaga "Gorgojo de los Andes")
      (cientifico "Premnotrypes suturicallus")
      (categoria "Plaga de Tuberculo (Curculionidae)")
      (certeza 95)))
   (assert (tratamiento 
      (id trat-gorgojo)
      (producto-quimico "Cipermetrina 25% EC")
      (dosis-ha "400 ml/ha al aporque")
      (agua-ha "250 L/ha")
      (control-biologico "Beauveria brongniartii aplicado al suelo")))
   (printout t "[REGLA DISPARADA]: R-PP-02 -> Gorgojo de los Andes." crlf)
)

;; ------------------------------------------------------------------------------
;; 4. REGLAS DE PRODUCCIÓN: CULTIVO DE PALTO (Persea americana)
;; ------------------------------------------------------------------------------

(defrule regla-palto-aranita-roja
   "Detección de Oligonychus punicae en palto"
   (cultivo (id palto))
   (sintoma (id follaje-bronceado))
   (sintoma (id telaranas-enves))
   =>
   (assert (diagnostico 
      (id diag-aranita)
      (plaga "Aranita Roja del Palto")
      (cientifico "Oligonychus punicae")
      (categoria "Plaga de Acaros (Tetranychidae)")
      (certeza 94)))
   (assert (tratamiento 
      (id trat-aranita)
      (producto-quimico "Abamectina 1.8% EC + Aceite Agricola")
      (dosis-ha "600 ml/ha (150 ml/cilindro 200L)")
      (agua-ha "800 L/ha (4 cilindros)")
      (control-biologico "Azufre micronizado 80% WG (2.5 kg/ha)")))
   (printout t "[REGLA DISPARADA]: R-PT-01 -> Aranita Roja en Palto." crlf)
)

(defrule regla-palto-tristeza
   "Detección de Phytophthora cinnamomi en palto"
   (cultivo (id palto))
   (sintoma (id marchitez-progresiva))
   (sintoma (id raices-negras))
   =>
   (assert (diagnostico 
      (id diag-tristeza)
      (plaga "Tristeza o Marchitez del Palto")
      (cientifico "Phytophthora cinnamomi")
      (categoria "Oomyceto Radicular Letal")
      (certeza 96)))
   (assert (tratamiento 
      (id trat-tristeza)
      (producto-quimico "Fosfito de Potasio 40-20 + Metalaxil en drench")
      (dosis-ha "3.0 L/ha")
      (agua-ha "1000 L/ha")
      (control-biologico "Trichoderma harzianum al bulbo de riego")))
   (printout t "[REGLA DISPARADA]: R-PT-02 -> Tristeza del Palto." crlf)
)

;; ------------------------------------------------------------------------------
;; 5. REGLAS DE PRODUCCIÓN: CULTIVO DE TOMATE (Solanum lycopersicum)
;; ------------------------------------------------------------------------------

(defrule regla-tomate-mosca-blanca
   "Detección de Bemisia tabaci en tomate"
   (cultivo (id tomate))
   (sintoma (id nubes-mosquitas))
   (sintoma (id melaza-fumagina))
   =>
   (assert (diagnostico 
      (id diag-mosca-blanca)
      (plaga "Mosca Blanca del Tomate")
      (cientifico "Bemisia tabaci")
      (categoria "Plaga Chupadora y Vector Viral")
      (certeza 95)))
   (assert (tratamiento 
      (id trat-mosca-blanca)
      (producto-quimico "Imidacloprid 35% SC")
      (dosis-ha "350 ml/ha")
      (agua-ha "300 L/ha")
      (control-biologico "Jabon Potasico 2% + Aceite de Neem")))
   (printout t "[REGLA DISPARADA]: R-TM-01 -> Mosca Blanca en Tomate." crlf)
)

(defrule regla-tomate-polilla
   "Detección de Tuta absoluta en tomate"
   (cultivo (id tomate))
   (sintoma (id frutos-perforados))
   =>
   (assert (diagnostico 
      (id diag-tuta)
      (plaga "Polilla del Tomate / Barrenador")
      (cientifico "Tuta absoluta")
      (categoria "Lepidoptero Barrenador (Gelechiidae)")
      (certeza 92)))
   (assert (tratamiento 
      (id trat-tuta)
      (producto-quimico "Clorantraniliprole 20% SC (Coragen)")
      (dosis-ha "150 ml/ha")
      (agua-ha "300 L/ha")
      (control-biologico "Liberacion de chinches Nesidiocoris tenuis")))
   (printout t "[REGLA DISPARADA]: R-TM-02 -> Polilla del Tomate." crlf)
)

;; ------------------------------------------------------------------------------
;; 6. HECHOS DE EJEMPLO PARA PRUEBA INICIAL EN CONSOLA CLIPS
;; (Descomente y ejecute (reset) y (run) en el entorno CLIPS)
;; ------------------------------------------------------------------------------

(deffacts caso-prueba-maiz
   (cultivo (id maiz) (nombre "Maiz Amarillo Duro"))
   (sintoma (id hojas-mordidas) (nombre "Hojas masticadas con ventanas") (organo "Hojas"))
   (sintoma (id aserrin-cogollo) (nombre "Aserrin humedo en cogollo") (organo "Cogollo"))
)
