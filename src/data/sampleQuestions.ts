/**
 * Seed questions for the Explore page, built directly from the vetted
 * library in data/sources.ts — one natural student-style question per
 * passage, so Explore has real, cited content from the moment the app is
 * live instead of waiting for real traffic. Each entry points at the exact
 * chunk id it should cite; db.ts inserts these with question_key dedupe (see
 * getPublicStats/bootstrap), so if a real student later asks the identical
 * question it upserts onto the same row, gets synthesized by Claude on first
 * ask, and becomes indistinguishable from organic content.
 */

export interface SampleQuestion {
  question: string;
  chunkId: string;
}

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  { question: "What is the correct chest compression rate and depth for adult CPR?", chunkId: "bls-compressions" },
  { question: "How do you give adrenaline in anaphylaxis?", chunkId: "anaphylaxis-adrenaline" },
  { question: "What are the diagnostic criteria for diabetes mellitus?", chunkId: "diabetes-diagnosis" },
  { question: "What is the first-hour management of septic shock?", chunkId: "sepsis-bundle" },
  { question: "At what blood pressure should antihypertensive treatment be started?", chunkId: "hypertension-thresholds" },
  { question: "What are the normal reference ranges for serum sodium and potassium?", chunkId: "labs-electrolytes" },
  { question: "What is the correct order of draw for blood collection tubes?", chunkId: "labs-order-of-draw" },

  { question: "Why is the left recurrent laryngeal nerve more vulnerable to injury than the right?", chunkId: "anat-recurrent-laryngeal" },
  { question: "Why is aspiration of foreign bodies more common in the right main bronchus?", chunkId: "anat-right-bronchus" },
  { question: "Why is the appendix called a surgical graveyard of diagnosis? What are its common positions?", chunkId: "anat-appendix-positions" },
  { question: "Why does an indirect inguinal hernia descend into the scrotum more than a direct hernia?", chunkId: "anat-inguinal-hernia" },
  { question: "What is the anatomical basis of referred pain from the heart to the left arm and shoulder?", chunkId: "anat-cardiac-referred-pain" },
  { question: "Why is the femoral canal a common site for herniation, especially in females?", chunkId: "anat-femoral-hernia" },
  { question: "What structures pass through the porta hepatis, and why is this region clinically important?", chunkId: "anat-porta-hepatis" },
  { question: "Why is the facial nerve considered the nerve of the second pharyngeal arch?", chunkId: "anat-facial-nerve" },
  { question: "What anatomical factors prevent gastroesophageal reflux under normal conditions?", chunkId: "anat-antireflux" },
  { question: "Why does raised intracranial pressure produce papilloedema?", chunkId: "anat-papilledema" },

  { question: "Why does stimulation of the vagus nerve decrease heart rate?", chunkId: "phys-vagus-heart" },
  { question: "Why does blood pressure fall when a person suddenly stands up, and how is it corrected?", chunkId: "phys-orthostatic" },
  { question: "Why is haemoglobin a better oxygen carrier than dissolved oxygen in plasma?", chunkId: "phys-hemoglobin-o2" },
  { question: "Why does carbon monoxide poisoning cause severe hypoxia despite a normal oxygen tension?", chunkId: "phys-co-poisoning" },
  { question: "Why does hyperventilation lead to dizziness or fainting?", chunkId: "phys-hyperventilation" },
  { question: "Why is gastric mucosa not digested by its own hydrochloric acid and pepsin?", chunkId: "phys-gastric-barrier" },
  { question: "Why does oedema occur in nephrotic syndrome?", chunkId: "phys-nephrotic-edema" },
  { question: "Why is glucose normally absent in urine but appears in uncontrolled diabetes mellitus?", chunkId: "phys-glucosuria" },
  { question: "How does increased extracellular potassium affect cardiac function?", chunkId: "phys-hyperkalemia" },
  { question: "Why does fever occur during infection?", chunkId: "phys-fever" },
];
