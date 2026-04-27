/**
 * Mocks scraping a real estate listing URL to extract data.
 * @param {string} url - The URL to scrape (e.g., Leboncoin, SeLoger).
 * @returns {Promise<Object>} - A promise that resolves to the extracted data.
 */
export const scrapeUrl = (url) => {
  return new Promise((resolve, reject) => {
    // Basic validation
    if (!url || typeof url !== 'string') {
      return reject(new Error("URL invalide"));
    }

    // Simulate network delay
    setTimeout(() => {
      const lowerUrl = url.toLowerCase();
      
      // We cannot do real client-side scraping because of CORS and Anti-Bot protections (Datadome).
      // Instead, we extract some info from the URL to generate a plausible mock.
      
      // Simple hash function to generate consistent "random" data per URL
      let hash = 0;
      for (let i = 0; i < lowerUrl.length; i++) {
        hash = Math.imul(31, hash) + lowerUrl.charCodeAt(i) | 0;
      }
      const random = () => {
        hash = Math.imul(1597334677, hash) + 1 | 0;
        return ((hash >>> 0) / 4294967296);
      };

      // Extract parts from typical URLs
      let type = "Appartement";
      if (lowerUrl.includes('maison')) type = "Maison";
      if (lowerUrl.includes('studio')) type = "Studio";

      // Try to extract city or zipcode
      let location = "Localité inconnue";
      let codePostal = String(Math.floor(random() * 80000) + 10000);
      
      const match = lowerUrl.match(/\/([a-z\-]+)-([0-9]{2,5})\//);
      if (match) {
        location = match[1].charAt(0).toUpperCase() + match[1].slice(1).replace(/-/g, ' ');
        codePostal = match[2].length === 2 ? match[2] + "000" : match[2];
      }

      // Generate plausible numbers based on the hash
      const surface = Math.floor(random() * 80) + 20; // 20 to 100 m2
      const prixM2 = Math.floor(random() * 5000) + 2000; // 2000 to 7000 / m2
      const prixAchat = surface * prixM2;
      
      const dpeList = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      const dpe = dpeList[Math.floor(random() * dpeList.length)];

      if (lowerUrl.includes('leboncoin.fr') || lowerUrl.includes('seloger.com') || lowerUrl.includes('bienici.com')) {
        resolve({
          prixAchat,
          surface,
          dpe,
          titre: `${type} à rénover - ${location}`,
          codePostal
        });
      } else {
         reject(new Error("Domaine non supporté. Essayez Leboncoin, SeLoger, ou BienIci."));
      }
    }, 1500); // 1.5 seconds delay
  });
};
