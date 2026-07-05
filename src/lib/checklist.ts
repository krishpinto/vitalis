// Hard-coded acute-febrile-illness history checklist (item 3 — gap detection).
// The consult is compared against this list; anything not covered surfaces as
// "Not yet ruled out". One vertical, deep: dengue / typhoid / malaria only.

export interface ChecklistItem {
  key: string;
  /** What should have been asked. */
  item: string;
  /** Which diagnosis it discriminates — used in the gap prompt. */
  whyItMatters: string;
}

export const FEBRILE_CHECKLIST: ChecklistItem[] = [
  {
    key: 'travel',
    item: 'Recent travel history',
    whyItMatters: 'Travel to a malaria- or typhoid-endemic area changes pre-test probability sharply; malaria cannot be ruled out without it.',
  },
  {
    key: 'rash',
    item: 'Rash / skin changes',
    whyItMatters: 'A petechial rash points toward dengue; rose spots toward typhoid.',
  },
  {
    key: 'bleeding',
    item: 'Bleeding tendencies (gums, nose, stool)',
    whyItMatters: 'Mucosal bleeding is a dengue warning sign requiring urgent platelet monitoring.',
  },
  {
    key: 'urination',
    item: 'Urine output / urinary symptoms',
    whyItMatters: 'Reduced urine output signals dehydration or early shock; dysuria suggests an alternative (UTI) source of fever.',
  },
  {
    key: 'hydration',
    item: 'Oral intake and hydration status',
    whyItMatters: 'Poor oral intake with vomiting drives dengue morbidity; guides admission vs home care.',
  },
  {
    key: 'fever_pattern',
    item: 'Fever pattern (continuous / intermittent / step-ladder / cyclical)',
    whyItMatters: 'Cyclical fever with rigors suggests malaria; a step-ladder pattern suggests typhoid.',
  },
  {
    key: 'exposure',
    item: 'Exposure history (mosquito exposure, stagnant water, sick contacts, outside food/water)',
    whyItMatters: 'Vector and food/water exposure separate dengue and malaria from enteric fever.',
  },
];

/** Plain-text checklist block for embedding into the Gemini prompt. */
export function checklistPromptBlock(): string {
  return FEBRILE_CHECKLIST.map((c) => `- ${c.item}: ${c.whyItMatters}`).join('\n');
}
