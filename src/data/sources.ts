import type { Chunk, Source } from "@/lib/types";

/**
 * DEMONSTRATION SEED LIBRARY
 * --------------------------
 * This is a small, hand-curated set of well-established teaching facts, each
 * tied to a real issuing body so the citation/abstention flow can be shown
 * end-to-end. It is NOT a substitute for the full ingestion pipeline: in
 * production this table is replaced by chunked, embedded text from vetted
 * sources (national guidelines, standard textbooks, PubMed) — see README.
 *
 * The URLs point at the official issuing body's landing page rather than a
 * deep link, so nothing here pretends to be a verified deep citation it is not.
 * Every fact below is deliberately a stable, non-controversial teaching point.
 */

export const SOURCES: Source[] = [
  {
    id: "aha-bls-2020",
    title: "Adult Basic Life Support Guidelines",
    publisher: "American Heart Association",
    year: 2020,
    url: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines",
    evidence: "guideline",
  },
  {
    id: "resus-anaphylaxis",
    title: "Emergency Treatment of Anaphylactic Reactions",
    publisher: "Resuscitation Council UK",
    year: 2021,
    url: "https://www.resus.org.uk/library/additional-guidance/guidance-anaphylaxis",
    evidence: "guideline",
  },
  {
    id: "ada-standards-2025",
    title: "Standards of Care in Diabetes — Diagnosis",
    publisher: "American Diabetes Association",
    year: 2025,
    url: "https://diabetesjournals.org/care/issue/standards-of-care",
    evidence: "guideline",
  },
  {
    id: "ssc-sepsis-2021",
    title: "Surviving Sepsis Campaign Guidelines",
    publisher: "Society of Critical Care Medicine / ESICM",
    year: 2021,
    url: "https://www.sccm.org/clinical-resources/guidelines/guidelines/surviving-sepsis-guidelines",
    evidence: "guideline",
  },
  {
    id: "who-hypertension-2021",
    title: "Guideline for the Pharmacological Treatment of Hypertension in Adults",
    publisher: "World Health Organization",
    year: 2021,
    url: "https://www.who.int/publications/i/item/9789240033986",
    evidence: "guideline",
  },
  {
    id: "ref-labs",
    title: "Common Reference Intervals (Adult) — Teaching Summary",
    publisher: "Standard clinical biochemistry reference",
    year: 2023,
    url: "https://www.ncbi.nlm.nih.gov/books/NBK519424/",
    evidence: "textbook",
  },
  {
    id: "ref-phlebotomy",
    title: "Order of Draw and Specimen Handling",
    publisher: "Clinical & Laboratory Standards Institute (teaching summary)",
    year: 2023,
    url: "https://clsi.org/",
    evidence: "textbook",
  },
  {
    id: "snell-anatomy",
    title: "Clinical Anatomy by Regions (teaching summary)",
    publisher: "Snell / Wolters Kluwer",
    year: 2019,
    url: "https://www.wolterskluwer.com/en/solutions/lww/snells-clinical-anatomy-by-regions",
    evidence: "textbook",
  },
  {
    id: "guyton-physiology",
    title: "Textbook of Medical Physiology (teaching summary)",
    publisher: "Guyton & Hall / Elsevier",
    year: 2020,
    url: "https://www.elsevier.com/books/guyton-and-hall-textbook-of-medical-physiology/hall/978-0-323-59712-8",
    evidence: "textbook",
  },
];

export const CHUNKS: Chunk[] = [
  {
    id: "bls-compressions",
    sourceId: "aha-bls-2020",
    topic: "CPR / Basic Life Support",
    keywords: ["cpr", "compressions", "resuscitation", "cardiac arrest", "bls", "rate", "depth"],
    text:
      "For adult cardiac arrest, deliver chest compressions at a rate of 100–120 per minute to a depth of at least 5 cm (about 2 inches) but not more than 6 cm. Allow full chest recoil between compressions, minimise interruptions, and use a compression-to-ventilation ratio of 30:2 when the airway is unprotected.",
  },
  {
    id: "anaphylaxis-adrenaline",
    sourceId: "resus-anaphylaxis",
    topic: "Anaphylaxis",
    keywords: ["anaphylaxis", "adrenaline", "epinephrine", "allergic", "im", "thigh", "shock"],
    text:
      "In anaphylaxis, give intramuscular adrenaline (epinephrine) immediately into the anterolateral thigh. The adult dose is 500 micrograms (0.5 mL of 1:1000). Repeat after 5 minutes if there is no improvement. IM is the preferred route; IV adrenaline is reserved for specialist settings with monitoring because of the risk of arrhythmia.",
  },
  {
    id: "diabetes-diagnosis",
    sourceId: "ada-standards-2025",
    topic: "Diabetes diagnosis",
    keywords: ["diabetes", "diagnosis", "hba1c", "fasting glucose", "fpg", "ogtt", "criteria", "blood sugar"],
    text:
      "Diabetes can be diagnosed by any one of: fasting plasma glucose ≥126 mg/dL (7.0 mmol/L); 2-hour plasma glucose ≥200 mg/dL (11.1 mmol/L) during a 75 g OGTT; HbA1c ≥6.5% (48 mmol/mol); or a random plasma glucose ≥200 mg/dL (11.1 mmol/L) in a patient with classic hyperglycaemic symptoms. In the absence of unequivocal hyperglycaemia, an abnormal result should be confirmed by repeat testing.",
  },
  {
    id: "sepsis-bundle",
    sourceId: "ssc-sepsis-2021",
    topic: "Sepsis",
    keywords: ["sepsis", "septic shock", "antibiotics", "fluids", "lactate", "bundle", "resuscitation"],
    text:
      "For sepsis-induced hypoperfusion or septic shock, begin at least 30 mL/kg of IV crystalloid within the first 3 hours and administer broad-spectrum antibiotics as soon as possible, ideally within 1 hour for septic shock. Measure lactate and remeasure if the initial value is elevated (>2 mmol/L), and obtain blood cultures before antibiotics where this does not delay treatment.",
  },
  {
    id: "hypertension-thresholds",
    sourceId: "who-hypertension-2021",
    topic: "Hypertension",
    keywords: ["hypertension", "blood pressure", "bp", "antihypertensive", "threshold", "treatment"],
    text:
      "WHO recommends starting pharmacological treatment in adults with confirmed systolic blood pressure ≥140 mmHg or diastolic ≥90 mmHg. In people with established cardiovascular disease, diabetes, chronic kidney disease, or high cardiovascular risk, treatment is recommended from a systolic threshold of ≥130 mmHg. Recommended first-line drug classes include thiazide diuretics, ACE inhibitors or ARBs, and long-acting dihydropyridine calcium channel blockers.",
  },
  {
    id: "labs-electrolytes",
    sourceId: "ref-labs",
    topic: "Reference intervals",
    keywords: ["reference", "normal range", "electrolytes", "sodium", "potassium", "creatinine", "labs", "values"],
    text:
      "Commonly quoted adult reference intervals: serum sodium 135–145 mmol/L; potassium 3.5–5.0 mmol/L; chloride 98–107 mmol/L; urea (BUN) roughly 2.5–7.1 mmol/L; creatinine about 60–110 µmol/L (varies by sex and assay). Reference intervals are laboratory- and method-specific — always interpret a result against the range printed on that laboratory's own report.",
  },
  {
    id: "labs-order-of-draw",
    sourceId: "ref-phlebotomy",
    topic: "Phlebotomy",
    keywords: ["order of draw", "blood tube", "phlebotomy", "vacutainer", "sample", "collection", "colour"],
    text:
      "The standard order of draw for evacuated tubes minimises cross-contamination of additives: (1) blood culture bottles, (2) coagulation tube (light blue, citrate), (3) serum tube (red or gold/SST), (4) heparin tube (green), (5) EDTA tube (lavender), (6) fluoride/oxalate tube (grey). Mix additive tubes gently by inversion immediately after collection.",
  },

  // ---- Anatomy (viva teaching points) ----
  {
    id: "anat-recurrent-laryngeal",
    sourceId: "snell-anatomy",
    topic: "Recurrent laryngeal nerve",
    keywords: ["recurrent laryngeal nerve", "left", "right", "aorta", "ligamentum arteriosum", "subclavian artery", "vocal cord", "injury", "vulnerable", "hoarseness"],
    text:
      "The left recurrent laryngeal nerve is more vulnerable because it has a longer, mainly intrathoracic course: it loops under the arch of the aorta (behind the ligamentum arteriosum) before ascending in the tracheo-oesophageal groove. The right nerve loops only around the right subclavian artery in the root of the neck. The left nerve's longer course and mediastinal position expose it to injury from aortic aneurysm, mediastinal or bronchial tumours, and cardiothoracic surgery; injury causes vocal cord palsy and hoarseness.",
  },
  {
    id: "anat-right-bronchus",
    sourceId: "snell-anatomy",
    topic: "Tracheobronchial tree / aspiration",
    keywords: ["right main bronchus", "aspiration", "foreign body", "wider", "more vertical", "shorter", "inhaled", "left main bronchus"],
    text:
      "Inhaled foreign bodies more often enter the right main bronchus because it is wider, shorter, and more vertical (more directly in line with the trachea) than the left main bronchus. The left bronchus is narrower and more horizontal as it passes below the arch of the aorta. Aspirated material therefore tends to lodge on the right, especially in the posterobasal segments when supine.",
  },
  {
    id: "anat-appendix-positions",
    sourceId: "snell-anatomy",
    topic: "Vermiform appendix",
    keywords: ["appendix", "retrocaecal", "pelvic", "positions", "appendicitis", "mcburney", "graveyard", "diagnosis"],
    text:
      "The appendix is sometimes called a 'graveyard' of diagnosis because its position is so variable that appendicitis can mimic many other conditions. Common positions are: retrocaecal/retrocolic (the commonest, roughly three-quarters of cases), pelvic/descending, subcaecal, pre-ileal, and post-ileal. The base is constant at the confluence of the taeniae coli on the posteromedial caecum, surface-marked at McBurney's point, but the free tip may lie in any of these directions — which is why the clinical presentation varies.",
  },
  {
    id: "anat-inguinal-hernia",
    sourceId: "snell-anatomy",
    topic: "Inguinal hernia",
    keywords: ["indirect inguinal hernia", "direct inguinal hernia", "scrotum", "deep inguinal ring", "spermatic cord", "processus vaginalis", "inferior epigastric", "hesselbach"],
    text:
      "An indirect inguinal hernia enters the deep inguinal ring lateral to the inferior epigastric vessels and travels the whole length of the inguinal canal within the coverings of the spermatic cord, following the path of the processus vaginalis; it can therefore continue through the superficial ring into the scrotum. A direct hernia pushes forward through the weak posterior wall of the canal (Hesselbach's triangle), medial to the inferior epigastric vessels, and rarely reaches the scrotum because it does not follow the cord through the canal.",
  },
  {
    id: "anat-cardiac-referred-pain",
    sourceId: "snell-anatomy",
    topic: "Referred cardiac pain",
    keywords: ["referred pain", "heart", "left arm", "shoulder", "angina", "dermatome", "sympathetic", "convergence", "t1", "t4"],
    text:
      "Cardiac pain is referred to the left chest, arm, and shoulder because pain afferents from the heart travel with the sympathetic cardiac nerves and enter the spinal cord at segments T1–T4(T5). These same segments receive somatic sensation from the skin of the chest and the medial arm/forearm (T1–T2). Because visceral and somatic afferents converge on the same second-order neurons, the brain interprets the visceral pain as coming from the corresponding somatic dermatomes — the basis of referred pain.",
  },
  {
    id: "anat-femoral-hernia",
    sourceId: "snell-anatomy",
    topic: "Femoral hernia",
    keywords: ["femoral canal", "femoral hernia", "female", "femoral ring", "strangulation", "cloquet", "wider pelvis"],
    text:
      "The femoral canal is the small medial compartment of the femoral sheath; it normally contains fat and a lymph node (of Cloquet) and provides room for venous distension. A femoral hernia protrudes through the femoral ring into this canal, below and lateral to the pubic tubercle. It is commoner in females because the wider female pelvis gives a larger femoral ring and canal. The ring is narrow and bounded by rigid structures (inguinal ligament, lacunar ligament, pectineal ligament, femoral vein), so femoral hernias are especially liable to strangulation.",
  },
  {
    id: "anat-porta-hepatis",
    sourceId: "snell-anatomy",
    topic: "Porta hepatis",
    keywords: ["porta hepatis", "portal vein", "hepatic artery", "bile duct", "portal triad", "pringle", "hepatoduodenal ligament", "jaundice"],
    text:
      "The porta hepatis is the transverse fissure on the visceral surface of the liver where structures enter and leave. It transmits the portal triad: the portal vein (posterior), the hepatic artery proper (to the left), and the common hepatic/bile duct (to the right), together with hepatic nerve plexus and lymphatics. It is clinically important because these structures run in the free edge of the hepatoduodenal ligament (site of the Pringle manoeuvre to control hepatic bleeding), and disease here — such as tumour or nodes — causes obstructive jaundice.",
  },
  {
    id: "anat-facial-nerve",
    sourceId: "snell-anatomy",
    topic: "Facial nerve (second pharyngeal arch)",
    keywords: ["facial nerve", "second pharyngeal arch", "muscles of facial expression", "chorda tympani", "taste", "stapedius", "stylohyoid", "parasympathetic"],
    text:
      "The facial nerve (CN VII) is the nerve of the second pharyngeal arch and supplies that arch's derivatives: the muscles of facial expression, plus stapedius, stylohyoid, and the posterior belly of digastric. Its functions are: motor to the muscles of facial expression; special sensory (taste) from the anterior two-thirds of the tongue via the chorda tympani; parasympathetic secretomotor supply to the lacrimal, submandibular, and sublingual glands; and a small area of somatic sensation around the external ear.",
  },
  {
    id: "anat-antireflux",
    sourceId: "snell-anatomy",
    topic: "Anti-reflux mechanisms",
    keywords: ["gastroesophageal reflux", "lower oesophageal sphincter", "angle of his", "diaphragm", "right crus", "intra-abdominal oesophagus", "reflux", "gerd"],
    text:
      "Several anatomical and physiological factors normally prevent gastro-oesophageal reflux: the physiological lower oesophageal sphincter (tonically contracted smooth muscle); the acute angle of His between the oesophagus and gastric fundus, which acts as a flap valve; the pinch-cock action of the right crus of the diaphragm around the oesophageal hiatus; the short intra-abdominal segment of oesophagus, which is compressed by positive intra-abdominal pressure; and the mucosal 'rosette' of folds at the cardia. Loss of these (e.g. hiatus hernia) predisposes to reflux.",
  },
  {
    id: "anat-papilledema",
    sourceId: "snell-anatomy",
    topic: "Papilloedema and raised ICP",
    keywords: ["papilledema", "papilloedema", "raised intracranial pressure", "optic nerve sheath", "subarachnoid space", "csf", "optic disc", "axoplasmic"],
    text:
      "The optic nerve is an outgrowth of the brain, so it is surrounded by all three meninges and a sleeve of subarachnoid space containing CSF that is continuous with that around the brain. When intracranial pressure rises, the raised CSF pressure is transmitted forward along this optic nerve sheath and compresses the nerve and its central retinal vein, obstructing venous return and axoplasmic transport at the optic disc. The result is swelling of the optic disc — papilloedema — which is characteristically bilateral.",
  },

  // ---- Physiology (viva teaching points) ----
  {
    id: "phys-vagus-heart",
    sourceId: "guyton-physiology",
    topic: "Vagal control of heart rate",
    keywords: ["vagus nerve", "heart rate", "acetylcholine", "muscarinic", "sa node", "parasympathetic", "bradycardia", "hyperpolarization"],
    text:
      "Vagal (parasympathetic) stimulation slows the heart because its postganglionic fibres release acetylcholine, which acts on M2 muscarinic receptors at the SA node. This opens potassium channels (increasing K+ efflux, hyperpolarising the cell) and reduces the funny (If) and calcium currents, so the slope of the phase-4 pacemaker potential falls and it takes longer to reach threshold. The SA node therefore fires less often and AV conduction slows, producing bradycardia.",
  },
  {
    id: "phys-orthostatic",
    sourceId: "guyton-physiology",
    topic: "Orthostatic hypotension",
    keywords: ["blood pressure", "standing", "orthostatic", "venous return", "baroreceptor reflex", "postural", "sympathetic", "gravity"],
    text:
      "On standing, gravity pools several hundred millilitres of blood in the veins of the legs and splanchnic bed, reducing venous return, stroke volume, and cardiac output, so arterial pressure momentarily falls. This is corrected by the baroreceptor reflex: reduced stretch of the carotid sinus and aortic arch baroreceptors lowers their firing, which increases sympathetic outflow and decreases vagal tone — raising heart rate and contractility and causing arteriolar and venous constriction — so blood pressure is restored within a few heartbeats.",
  },
  {
    id: "phys-hemoglobin-o2",
    sourceId: "guyton-physiology",
    topic: "Oxygen transport by haemoglobin",
    keywords: ["hemoglobin", "haemoglobin", "oxygen", "carrier", "dissolved oxygen", "plasma", "oxygen carrying capacity", "saturation"],
    text:
      "Oxygen is poorly soluble in plasma: at a normal arterial PO2 only about 0.3 mL of O2 dissolves per 100 mL of blood — roughly 1.5% of what the tissues need. Haemoglobin hugely increases carrying capacity because each gram binds about 1.34 mL of O2 and each molecule carries four O2 reversibly with cooperative binding, so ~98–99% of blood oxygen is carried bound to haemoglobin (about 20 mL per 100 mL). Haemoglobin also releases O2 where it is needed, which dissolved oxygen alone could never supply.",
  },
  {
    id: "phys-co-poisoning",
    sourceId: "guyton-physiology",
    topic: "Carbon monoxide poisoning",
    keywords: ["carbon monoxide", "poisoning", "hypoxia", "carboxyhemoglobin", "oxygen tension", "affinity", "pulse oximetry", "left shift"],
    text:
      "Carbon monoxide causes severe tissue hypoxia even though the dissolved oxygen tension (PaO2) stays normal. CO binds haemoglobin with roughly 200–250 times the affinity of oxygen, forming carboxyhaemoglobin and reducing the number of sites available to carry O2, so oxygen content and delivery fall sharply. CO also shifts the oxygen–haemoglobin dissociation curve to the left, so the O2 that is carried is released less readily to tissues. Because PaO2 and standard pulse oximetry can look normal, the hypoxia is easily missed.",
  },
  {
    id: "phys-hyperventilation",
    sourceId: "guyton-physiology",
    topic: "Hyperventilation and syncope",
    keywords: ["hyperventilation", "dizziness", "fainting", "hypocapnia", "respiratory alkalosis", "cerebral vasoconstriction", "carbon dioxide", "syncope"],
    text:
      "Hyperventilation blows off carbon dioxide, lowering arterial PCO2 (hypocapnia) and producing a respiratory alkalosis. Carbon dioxide is a powerful cerebral vasodilator, so a fall in PCO2 causes cerebral vasoconstriction and reduced cerebral blood flow, leading to light-headedness, dizziness and sometimes fainting. The accompanying alkalosis also lowers ionised calcium, which can cause tingling (paraesthesiae) around the mouth and fingers and carpopedal spasm.",
  },
  {
    id: "phys-gastric-barrier",
    sourceId: "guyton-physiology",
    topic: "Gastric mucosal barrier",
    keywords: ["gastric mucosa", "hydrochloric acid", "pepsin", "mucus bicarbonate barrier", "pepsinogen", "prostaglandin", "self-digestion", "tight junctions"],
    text:
      "The stomach protects itself from its own acid and pepsin through the gastric mucosal barrier: surface epithelial and mucous cells secrete a thick layer of mucus containing bicarbonate, which traps HCO3- and keeps the epithelial surface near neutral pH. Tight junctions between epithelial cells limit acid back-diffusion, the epithelium regenerates very rapidly to replace damaged cells, pepsin is secreted as inactive pepsinogen and only activated in the lumen, and prostaglandins maintain mucosal blood flow and stimulate mucus and bicarbonate secretion. Breakdown of these defences leads to ulceration.",
  },
  {
    id: "phys-nephrotic-edema",
    sourceId: "guyton-physiology",
    topic: "Oedema in nephrotic syndrome",
    keywords: ["edema", "oedema", "nephrotic syndrome", "proteinuria", "hypoalbuminemia", "oncotic pressure", "sodium retention", "albumin"],
    text:
      "In nephrotic syndrome, heavy proteinuria causes loss of albumin and hypoalbuminaemia. The fall in plasma albumin lowers the plasma colloid osmotic (oncotic) pressure, so less fluid is drawn back into the capillaries and it accumulates in the interstitium as oedema (classically periorbital and dependent). Secondary renal sodium and water retention — driven by reduced effective circulating volume and activation of the renin–angiotensin–aldosterone system, and by primary tubular sodium retention — expands extracellular fluid and worsens the oedema.",
  },
  {
    id: "phys-glucosuria",
    sourceId: "guyton-physiology",
    topic: "Renal threshold for glucose",
    keywords: ["glucose", "urine", "glucosuria", "diabetes mellitus", "renal threshold", "transport maximum", "sglt2", "proximal tubule", "reabsorption"],
    text:
      "Filtered glucose is normally reabsorbed completely in the proximal tubule by sodium-glucose cotransporters (SGLT2 and SGLT1), so urine is essentially glucose-free. This reabsorption has a transport maximum (Tm); the plasma level at which glucose starts to appear in urine is the renal threshold, about 180 mg/dL. In uncontrolled diabetes mellitus, plasma glucose exceeds this threshold and the tubular transporters become saturated, so the excess glucose cannot be reabsorbed and spills into the urine (glucosuria), drawing water with it by osmotic diuresis.",
  },
  {
    id: "phys-hyperkalemia",
    sourceId: "guyton-physiology",
    topic: "Hyperkalaemia and the heart",
    keywords: ["extracellular potassium", "hyperkalemia", "hyperkalaemia", "cardiac", "resting membrane potential", "arrhythmia", "peaked t waves", "excitability"],
    text:
      "The resting membrane potential of cardiac cells depends on the ratio of intracellular to extracellular potassium. A rise in extracellular K+ (hyperkalaemia) makes the resting potential less negative (partial depolarisation). Mild elevation increases excitability, but as K+ rises further the sustained depolarisation inactivates fast sodium channels, so excitability and conduction fall. The ECG shows tall peaked T waves, then a widened QRS, flattening of P waves, and finally a sine-wave pattern that can progress to ventricular fibrillation or asystole — which is why severe hyperkalaemia is a medical emergency.",
  },
  {
    id: "phys-fever",
    sourceId: "guyton-physiology",
    topic: "Pathogenesis of fever",
    keywords: ["fever", "infection", "pyrogen", "interleukin", "prostaglandin", "hypothalamus", "set point", "cytokine", "pge2"],
    text:
      "Fever occurs because infection raises the hypothalamic temperature set-point. Exogenous pyrogens such as bacterial lipopolysaccharide trigger macrophages and other cells to release endogenous pyrogenic cytokines (interleukin-1, interleukin-6, tumour necrosis factor, and interferons). These act on the pre-optic area of the anterior hypothalamus (via the OVLT) to increase prostaglandin E2, which raises the thermoregulatory set-point. The body then behaves as if cold — vasoconstriction, shivering, and behavioural warming — until core temperature rises to the new set-point. This is also why antipyretics that inhibit prostaglandin synthesis (e.g. paracetamol, NSAIDs) reduce fever.",
  },
];

/** Resolve a chunk's source. */
export function sourceFor(chunk: Chunk): Source {
  const source = SOURCES.find((s) => s.id === chunk.sourceId);
  if (!source) {
    throw new Error(`No source found for chunk ${chunk.id} (sourceId=${chunk.sourceId})`);
  }
  return source;
}
