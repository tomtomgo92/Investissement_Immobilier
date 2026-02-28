import React, { useEffect, useState } from 'react';
import {
    Instagram,
    Linkedin,
    Youtube,
    Music,
    Send,
    ExternalLink,
    ChevronRight
} from 'lucide-react';

export default function DeepMindFooter() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <footer className="w-full bg-[#030014] text-white pt-20 overflow-hidden relative font-sans border-t border-white/5">
            {/* Top Content */}
            <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 pb-20 border-b border-white/10 uppercase tracking-widest font-bold">

                {/* Branding & Socials */}
                <div className="space-y-8">
                    <div className="text-3xl font-black tracking-[-0.05em] text-white">
                        THAT MU<span className="text-[#6366f1] underline decoration-[#6366f1] underline-offset-[6px] decoration-4">C</span>H
                    </div>
                    <div className="flex gap-4 text-white/50">
                        <a href="#" className="hover:text-white transition-colors hover:scale-110 transition-transform"><Instagram size={22} strokeWidth={1.5} /></a>
                        <a href="#" className="hover:text-white transition-colors hover:scale-110 transition-transform"><svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg></a> {/* TikTok Manual */}
                        <a href="#" className="hover:text-white transition-colors hover:scale-110 transition-transform"><Linkedin size={22} strokeWidth={1.5} /></a>
                        <a href="#" className="hover:text-white transition-colors hover:scale-110 transition-transform"><Youtube size={22} strokeWidth={1.5} /></a>
                    </div>
                    <button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.1em] transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95">
                        Nous contacter
                    </button>
                </div>

                {/* Expertises */}
                <div className="space-y-6">
                    <h3 className="text-xs text-slate-500 font-black tracking-[0.3em]">Expertises</h3>
                    <ul className="space-y-4 text-[10px]">
                        <li className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer group">
                            <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" /> Développement web
                        </li>
                        <li className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer group">
                            <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" /> UX/UI
                        </li>
                    </ul>
                </div>

                {/* Empty col instead of articles as requested */}
                <div></div>
            </div>

            {/* Corporate Line */}
            <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                <div>© 2026 THATMUCH - Tous droits réservés</div>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                    <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
                    <a href="#" className="hover:text-white transition-colors">THATMUCH Conditions générales de vente</a>
                    <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
                    <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
            </div>

            {/* Big Parallax Section */}
            <div className="relative h-[400px] w-full bg-[#030014] flex items-center justify-center overflow-hidden">
                {/* Background Decorative elements (Simulation) */}
                <div
                    className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                    style={{
                        transform: `translateY(${scrollY * 0.15}px)`,
                        backgroundImage: 'radial-gradient(circle at 10% 20%, #6366f1 0%, transparent 40%), radial-gradient(circle at 90% 80%, #10b981 0%, transparent 40%)',
                        filter: 'blur(80px)'
                    }}
                />

                {/* Big Stylized Logo */}
                <div
                    className="relative z-10 text-[12vw] md:text-[150px] font-black text-white/5 tracking-tighter select-none flex items-center justify-center gap-8"
                    style={{ transform: `translateY(${scrollY * -0.05}px)` }}
                >
                    {/* Logo Icon Replacement */}
                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white/5 flex items-center justify-center relative overflow-hidden">
                        <div className="absoute inset-0 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10" />
                        <div className="text-white opacity-20"><ExternalLink size={60} /></div>
                    </div>
                    THAT MUCH
                </div>

                {/* Small stars parallax */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white opacity-40 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        style={{
                            width: Math.random() * 3 + 'px',
                            height: Math.random() * 3 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            transform: `translateY(${scrollY * (0.05 + Math.random() * 0.1)}px)`
                        }}
                    />
                ))}
            </div>
        </footer>
    );
}
