# 🏠 Investissement Immobilier Pro

Un simulateur de rentabilité immobilière moderne, précis et intuitif, conçu pour les investisseurs exigeants et les projets de colocation.

[Voir la démo en ligne](https://tomtomgo92.github.io/Investissement_Immobilier/)

## ✨ Fonctionnalités

- **Calcul de Rentabilité Haute Précision** : Brute et nette, prenant en compte toutes les charges et taxes.
- **Gestion de Colocation** : Loyers individualisés pour chaque locataire.
- **Bilan de Trésorerie Dynamique** : Visualisation claire du cashflow mensuel et annuel.
- **Simulation de Financement** : Intégration de l'apport, du taux d'intérêt et de la durée du crédit.
- **Interface Premium** : Design moderne, réactif et optimisé pour une expérience utilisateur fluide.

## 📊 Détails des Calculs

### 1. Investissement & Financement
- **Investissement Total** = Prix d'Achat + Travaux + Frais de Notaire
- **Montant Emprunté** = Investissement Total - Apport Personnel
- **Mensualité de Crédit** : Calculée selon la formule standard d'amortissement (intérêts composés) ou linéaire si taux 0%.

### 2. Revenus Locatifs
- **Revenus Bruts** = Somme des loyers mensuels
- **Revenus Réels** = Revenus Bruts × (1 - Vacance Locative %)
  > *La vacance locative estime les périodes où le bien est inoccupé.*

### 3. Rentabilité
- **Rentabilité Brute** = (Revenus Bruts × 12) / Investissement Total × 100
- **Rentabilité Nette** = (Revenus Réels Annuels - Charges Annuelles) / Investissement Total × 100

### 4. Cashflow (Trésorerie)
- **Cashflow Brut (Avant Impôts)** = (Revenus Réels Annuels - Charges Annuelles - Crédit Annuel) / 12
- **Cashflow Net-Net (Après Impôts)** = Cashflow Brut - (Impôts Mensuels Estimés)

### 5. Fiscalité (Estimation LMNP Réel Simplifié)
Le simulateur estime l'impôt selon le régime LMNP au Réel :
- **Amortissement Annuel (Est.)** = (85% du Prix du Bien + Frais de Notaire + Travaux) / 25 ans
- **Intérêts Annuels** = Estimation sur la 1ère année (Montant Emprunté × Taux)
- **Base Imposable** = Revenus Réels Annuels - Charges - Intérêts - Amortissement
- **Impôts** = Base Imposable × (TMI + 17.2% Prélèvements Sociaux)
  > *Si la base imposable est négative, l'impôt est de 0€ (déficit reportable non géré ici).*

### 6. Projection Patrimoniale (20 ans)
- **Valeur Nette** = (Prix Achat + Travaux) - Capital Restant Dû + Cashflow Cumulé
  > *Hypothèse simplifiée : La valeur du bien reste stable (Prix Achat + Travaux).*

## 🚀 Installation Locale

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/tomtomgo92/Investissement_Immobilier.git
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## 🛠️ Technologies

- **React 19**
- **Vite**
- **Tailwind CSS v4**
- **Lucide React** (Icones)
- **GitHub Pages** (Déploiement)

---
Optimisé par **Antigravity**
