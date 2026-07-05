// Guideline text block injected directly into the Gemini Call #2 system prompt.
// NO RAG / vector DB — this plain-text block is the entire knowledge source.
//
// Specialty for the demo: acute febrile illness in an Indian primary-care setting
// (dengue / typhoid / malaria triage). Your medical co-founder owns and verifies
// these excerpts before any real demo. Placeholder/synthetic content for now.

export const GUIDELINES = `
ACUTE FEBRILE ILLNESS — PRIMARY CARE TRIAGE GUIDELINES (synthetic demo set)

[G1] Fever >38°C lasting 2-7 days with severe headache, retro-orbital pain, myalgia
and a positive tourniquet test or petechiae is suggestive of dengue fever.

[G2] In suspected dengue, order a CBC with platelet count and dengue NS1 antigen
(day 1-5) or IgM/IgG (after day 5). Falling platelets warrant close monitoring.

[G3] Warning signs for severe dengue requiring escalation: persistent vomiting,
mucosal bleeding (gums, nose), abdominal pain, lethargy, and rapid platelet drop.

[G4] Step-ladder (gradually rising) fever for >1 week with relative bradycardia,
abdominal discomfort and constipation or diarrhoea suggests enteric (typhoid) fever.
Confirm with blood culture; Widal test is supportive but not definitive.

[G5] Cyclical fever with chills and rigors, especially with travel to or residence in
an endemic area, requires a malaria smear / rapid antigen test to exclude malaria.

[G6] Paracetamol is the antipyretic of choice in suspected dengue. AVOID NSAIDs
(ibuprofen, aspirin) and IM injections due to bleeding risk.

[G7] Red-flag symptoms mandating same-day referral: signs of shock (cold clammy skin,
weak pulse), active bleeding, altered consciousness, or inability to tolerate oral fluids.

[G8] Maintain hydration with oral fluids/ORS. Advise return immediately if warning
signs appear, particularly around the time of defervescence (day 4-6).
`.trim();
