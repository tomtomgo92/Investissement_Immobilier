export const encodeShareCode = (simulation) => {
  const json = JSON.stringify(simulation);
  return btoa(json);
};

const validateSimulation = (sim) => {
  if (!sim || typeof sim !== 'object') return false;

  // Basic structure
  if (typeof sim.id !== 'string') return false;
  if (typeof sim.name !== 'string') return false;
  if (!sim.data || typeof sim.data !== 'object') return false;

  // --- SECURITY ENHANCEMENTS ---
  // Apply limits BEFORE deep processing to prevent DoS
  const MAX_NAME_LENGTH = 100;
  const MAX_ARRAY_LENGTH = 100;
  const MAX_VALUE = 1_000_000_000;
  const MIN_VALUE = -1_000_000_000;

  if (sim.name.length > MAX_NAME_LENGTH) return false;

  const d = sim.data;

  // Validate array lengths before content iteration
  if (!Array.isArray(d.loyers) || d.loyers.length > MAX_ARRAY_LENGTH) return false;
  if (!Array.isArray(d.charges) || d.charges.length > MAX_ARRAY_LENGTH) return false;

  // Validate numeric fields presence and type
  const requiredNumericFields = [
    'prixAchat',
    'travaux',
    'fraisNotaire',
    'apport',
    'tauxInteret',
    'dureeCredit',
    'mensualiteCredit',
    'vacanceLocative',
    'tmi'
  ];

  for (const f of requiredNumericFields) {
    if (typeof d[f] !== 'number' || !Number.isFinite(d[f])) return false;
    if (d[f] > MAX_VALUE || d[f] < MIN_VALUE) return false;
  }

  // Logic specific checks
  if (d.dureeCredit < 0) return false;
  // nbColocs is often tied to loyers length, but let's check it reasonably
  if (typeof d.nbColocs === 'number' && d.nbColocs > MAX_ARRAY_LENGTH) return false;


  // Deep validation - now safe(r) because arrays are capped
  if (!d.loyers.every(v => typeof v === 'number' && Number.isFinite(v) && v <= MAX_VALUE && v >= MIN_VALUE)) return false;

  // Charges must have a numeric value to prevent calculation errors
  if (!d.charges.every(c => c && typeof c === 'object' && typeof c.value === 'number' && Number.isFinite(c.value) && c.value <= MAX_VALUE && c.value >= MIN_VALUE)) return false;

  return true;
};

export const decodeShareCode = (encoded) => {
  try {
    const json = atob(encoded);
    const result = JSON.parse(json);

    if (validateSimulation(result)) {
      return result;
    }

    console.error("Invalid simulation data structure - validation failed");
    return null;
  } catch (e) {
    console.error("Failed to decode share code", e);
    return null;
  }
};
