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
      // In a real scenario, this would call a backend service that performs the actual scraping.
      resolve({
        prixAchat: Math.floor(Math.random() * 200000) + 100000, // Random price between 100k and 300k
        surface: Math.floor(Math.random() * 80) + 20, // Random surface between 20m² and 100m²
        dpe: ['A', 'B', 'C', 'D', 'E', 'F', 'G'][Math.floor(Math.random() * 7)], // Random DPE
        titre: "Appartement T" + (Math.floor(Math.random() * 4) + 1) + " hyper centre",
        loyerEstime: Math.floor(Math.random() * 400) + 500 // Random rent between 500 and 900
      });
    }, 1500); // 1.5 seconds delay
  });
};
