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
];

/** Resolve a chunk's source. */
export function sourceFor(chunk: Chunk): Source {
  const source = SOURCES.find((s) => s.id === chunk.sourceId);
  if (!source) {
    throw new Error(`No source found for chunk ${chunk.id} (sourceId=${chunk.sourceId})`);
  }
  return source;
}
