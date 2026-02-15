export const euroFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
});

export const formatE = (v) => euroFormatter.format(v);
