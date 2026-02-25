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

  const d = sim.data;
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

  // Validate numeric fields
  for (const f of requiredNumericFields) {
    if (typeof d[f] !== 'number') return false;
  }

  // Validate arrays
  if (!Array.isArray(d.loyers) || !d.loyers.every(v => typeof v === 'number')) return false;

  if (!Array.isArray(d.charges)) return false;
  // Charges must have a numeric value to prevent calculation errors
  if (!d.charges.every(c => c && typeof c === 'object' && typeof c.value === 'number')) return false;

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
