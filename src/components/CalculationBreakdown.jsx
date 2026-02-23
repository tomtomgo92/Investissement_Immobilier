import React from 'react';
import { Calculator, ArrowRight, Info } from 'lucide-react';

export default function CalculationBreakdown({ data, calculations, formatE }) {
    const {
        recetteMensuelleBrute, vacanceLocative, recetteMensuelleRéelle,
        totalChargesAnnuelles, mCredit, tmi, impots, cashflowM, cashflowNetNet
    } = { ...data, ...calculations };

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
                <Calculator size={20} className="text-accent" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-white">Détail des Calculs (Mensuel)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                {/* Revenus */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Revenus</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Loyer Brut</span>
                            <span className="font-bold text-success">+{formatE(recetteMensuelleBrute)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Vacance ({vacanceLocative}%)</span>
                            <span className="font-bold text-danger">-{formatE(recetteMensuelleBrute * (vacanceLocative / 100))}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-bold">
                            <span className="text-primary dark:text-white uppercase text-[9px]">Revenu Réel</span>
                            <span className="text-success">{formatE(recetteMensuelleRéelle)}</span>
                        </div>
                    </div>
                </div>

                {/* Sorties */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Charges & Crédit</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Mensualité Crédit</span>
                            <span className="font-bold text-danger">-{formatE(mCredit)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Charges (moyenne)</span>
                            <span className="font-bold text-danger">-{formatE(totalChargesAnnuelles / 12)}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-bold">
                            <span className="text-primary dark:text-white uppercase text-[9px]">Total Sorties</span>
                            <span className="text-danger">-{formatE(mCredit + (totalChargesAnnuelles / 12))}</span>
                        </div>
                    </div>
                </div>

                {/* Fiscalité */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Fiscalité (LMNP)</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Tranche d'imposition</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{tmi}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Prélèvements Sociaux</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">17.2%</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-bold">
                            <span className="text-primary dark:text-white uppercase text-[9px]">Impôt moyen / mois</span>
                            <span className="text-danger">-{formatE(impots / 12)}</span>
                        </div>
                    </div>
                </div>

                {/* Résultat final */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-sm">
                    <div>
                        <h4 className="text-[10px] font-black uppercase text-accent tracking-tighter mb-2">Cashflow Net-Net</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-primary dark:text-white">{formatE(cashflowNetNet)}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">/ mois</span>
                        </div>
                    </div>
                    <div className="text-[9px] text-slate-400 italic">
                        Soit {formatE(cashflowNetNet * 12)} / an dans votre poche après TOUT.
                    </div>
                </div>

            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <Info size={12} className="text-accent shrink-0" />
                <p>Calcul détaillé : Revenu Réel {formatE(recetteMensuelleRéelle)} - Mensualité {formatE(mCredit)} - Charges {formatE(totalChargesAnnuelles / 12)} - Impôts {formatE(impots / 12)} = <span className="font-black text-slate-900 dark:text-white">{formatE(cashflowNetNet)}</span></p>
            </div>
        </div>
    );
}
