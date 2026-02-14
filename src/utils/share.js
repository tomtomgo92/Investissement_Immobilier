export const encodeShareCode = (simulation) => {
  const json = JSON.stringify(simulation);
  return btoa(json);
};

export const decodeShareCode = (encoded) => {
  try {
    const json = atob(encoded);
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode share code", e);
    return null;
  }
};
