/**
 * Learn mode — short clinical case studies for "tired mode" browsing.
 * Each case is a teaching vignette with a guided reveal (stem → prompt →
 * teaching point) and links back to the same vetted sources used by Ask mode.
 */

export interface CaseStudy {
  id: string;
  title: string;
  specialty: string;
  /** Rough read time, minutes. */
  minutes: number;
  /** The presenting scenario. */
  stem: string;
  /** The question posed to the learner. */
  prompt: string;
  /** The teaching answer, revealed on demand. */
  teaching: string;
  /** IDs of sources (from data/sources.ts) that back the teaching point. */
  sourceIds: string[];
}

export const CASES: CaseStudy[] = [
  {
    id: "case-anaphylaxis",
    title: "Wheeze and hives after an antibiotic",
    specialty: "Emergency medicine",
    minutes: 3,
    stem:
      "A 24-year-old develops widespread urticaria, facial swelling and audible wheeze ten minutes after the first dose of IV co-amoxiclav. BP is 82/50, and they feel faint.",
    prompt: "What is the single most important immediate drug, and how do you give it?",
    teaching:
      "This is anaphylaxis (airway/breathing/circulation compromise with a likely trigger). The priority is intramuscular adrenaline 500 micrograms (0.5 mL of 1:1000) into the anterolateral thigh, repeated after 5 minutes if there is no improvement. IM — not IV — is the default route outside a monitored critical-care setting. Then position supine, give high-flow oxygen and an IV fluid bolus, and call for senior help.",
    sourceIds: ["resus-anaphylaxis"],
  },
  {
    id: "case-dka-vs-labs",
    title: "The confusing potassium in DKA",
    specialty: "Endocrinology",
    minutes: 4,
    stem:
      "A newly diagnosed type 1 diabetic presents with vomiting, ketones and glucose 28 mmol/L. The initial potassium comes back at 5.3 mmol/L, and a junior wants to treat the 'high' potassium.",
    prompt: "Is the total body potassium really high — and what does the reference range hide here?",
    teaching:
      "No. In diabetic ketoacidosis, acidosis and insulin deficiency drive potassium out of cells, so a serum value inside or above the reference range (3.5–5.0 mmol/L) usually masks a large total-body deficit. Once insulin and fluids start, potassium falls quickly. The teaching point: a lab value is only meaningful against the clinical context, not the printed range alone — always interpret electrolytes alongside the physiology.",
    sourceIds: ["ref-labs"],
  },
  {
    id: "case-sepsis-hour1",
    title: "The first hour of sepsis",
    specialty: "Critical care",
    minutes: 3,
    stem:
      "An 71-year-old with a urinary source is febrile, confused, tachycardic and hypotensive. Lactate is 4.1 mmol/L.",
    prompt: "What belongs in the first-hour actions?",
    teaching:
      "Treat as septic shock. Start at least 30 mL/kg IV crystalloid, take blood cultures before antibiotics where it doesn't delay them, and give broad-spectrum antibiotics as early as possible — ideally within the first hour. Recheck the lactate to gauge response. Escalate to seniors/critical care early rather than waiting for imaging.",
    sourceIds: ["ssc-sepsis-2021"],
  },
  {
    id: "case-cpr-quality",
    title: "Getting CPR quality right",
    specialty: "Resuscitation",
    minutes: 2,
    stem:
      "During an adult cardiac arrest, a bystander is giving shallow, fast compressions and leaning on the chest between them.",
    prompt: "What three things would you correct immediately?",
    teaching:
      "Rate 100–120 per minute (not faster), depth at least 5 cm but no more than 6 cm, and full chest recoil between compressions (no leaning). Minimise interruptions and use a 30:2 compression-to-ventilation ratio until an advanced airway is in place.",
    sourceIds: ["aha-bls-2020"],
  },
];
