/**
 * Mocks scraping a real estate listing URL to extract data.
 * @param {string} url - The URL to scrape (e.g., Leboncoin, SeLoger).
 * @returns {Promise<Object>} - A promise that resolves to the extracted data.
 */
export const scrapeUrl = (url) => {
  return new Promise((resolve, reject) => {
    // Basic validation
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return reject(new Error("URL invalide"));
    }

    // Simulate network delay
    setTimeout(() => {
      // Mock data extraction based on URL
      const lowerUrl = url.toLowerCase();

      if (lowerUrl.includes('leboncoin.fr')) {
        resolve({
          prixAchat: 145000,
          surface: 45,
          dpe: 'C',
          titre: "Appartement T2 rénové",
          codePostal: '69003'
        });
      } else if (lowerUrl.includes('seloger.com')) {
        resolve({
          prixAchat: 210000,
          surface: 65,
          dpe: 'D',
          titre: "Superbe T3 lumineux",
          codePostal: '75011'
        });
      } else if (lowerUrl.includes('bienici.com')) {
         resolve({
          prixAchat: 85000,
          surface: 25,
          dpe: 'E',
          titre: "Studio étudiant hyper centre",
          codePostal: '31000'
        });
      } else {
         reject(new Error("Domaine non supporté. Essayez Leboncoin, SeLoger, ou BienIci."));
      }
    }, 1500); // 1.5 seconds delay
  });
};
