import React from 'react';
import { Calculator, ArrowRight, Info } from 'lucide-react';

export default function CalculationBreakdown({ data, calculations, formatE }) {
    const {
        recetteMensuelleBrute, vacanceLocative, recetteMensuelleRéelle,
        totalChargesAnnuelles, mCredit, tmi, impots, cashflowM, cashflowNetNet,
        bestRegime, impotsReel, impotsMicro
    } = { ...data, ...calculations };

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
                <Calculator size={20} className="text-accent" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary dark:text-white">Détail des Calculs & Optimisation</h3>
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

                {/* Fiscalité Intelligente */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Fiscalité Optimale</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${bestRegime === 'reel' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'}`}>
                            {bestRegime === 'reel' ? 'Réel' : 'Micro-BIC'}
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs opacity-50">
                            <span className="text-slate-500">{bestRegime === 'reel' ? 'Option Micro-BIC' : 'Option Réel'}</span>
                            <span className="font-bold text-slate-500 line-through">-{formatE(Math.max(impotsReel, impotsMicro) / 12)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Impôt Retenu</span>
                            <span className="font-bold text-danger">-{formatE(impots / 12)}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-bold">
                            <span className="text-success uppercase text-[9px]">Économie / an</span>
                            <span className="text-success">+{formatE(Math.abs(impotsReel - impotsMicro))}</span>
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
                        Soit {formatE(cashflowNetNet * 12)} / an dans votre poche après TOUT (Régime {bestRegime === 'reel' ? 'Réel' : 'Micro'}).
                    </div>
                </div>

            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <Info size={12} className="text-accent shrink-0" />
                <p>Le simulateur a automatiquement choisi le régime <strong className="text-primary dark:text-white uppercase">{bestRegime === 'reel' ? 'Réel Simplifié' : 'Micro-BIC'}</strong> car il vous fait économiser <strong className="text-success">{formatE(Math.abs(impotsReel - impotsMicro))}</strong> d'impôts par an par rapport à l'autre option.</p>
            </div>
        </div>
    );
}
