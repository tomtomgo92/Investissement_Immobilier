export const getMarketData = async (postalCode) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock market data based on postal code prefixes
      if (!postalCode) {
        resolve({ avgRentPerSqm: 12, avgPropertyTax: 1000, marketName: 'France (Moyenne)' });
        return;
      }

      const prefix = postalCode.substring(0, 2);

      switch (prefix) {
        case '75': // Paris
          resolve({ avgRentPerSqm: 32, avgPropertyTax: 900, marketName: 'Paris' });
          break;
        case '69': // Lyon
          resolve({ avgRentPerSqm: 18, avgPropertyTax: 1100, marketName: 'Lyon' });
          break;
        case '31': // Toulouse
          resolve({ avgRentPerSqm: 15, avgPropertyTax: 1300, marketName: 'Toulouse' });
          break;
        case '33': // Bordeaux
          resolve({ avgRentPerSqm: 16, avgPropertyTax: 1400, marketName: 'Bordeaux' });
          break;
        case '13': // Marseille
          resolve({ avgRentPerSqm: 14, avgPropertyTax: 1500, marketName: 'Marseille' });
          break;
        case '59': // Lille
          resolve({ avgRentPerSqm: 15, avgPropertyTax: 1200, marketName: 'Lille' });
          break;
        default:
          resolve({ avgRentPerSqm: 12, avgPropertyTax: 1000, marketName: 'Province' });
      }
    }, 400); // 400ms delay to simulate API
  });
};
