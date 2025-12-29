import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUEDetail } from '../services/api';
import type { UEFullDto } from '../types';
import { ArrowLeft, FileText, Target, BookOpen } from 'lucide-react';

// ATTENTION ICI : C'est bien "export const" et pas "export default"
export const UEDetail = () => {
    const { code } = useParams<{ code: string }>();
    const [ue, setUe] = useState<UEFullDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (code) {
            getUEDetail(code)
                .then(setUe)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [code]);

    if (loading) return <div className="p-12 text-center text-gray-500">Chargement de la fiche...</div>;
    if (!ue) return <div className="p-12 text-center text-red-500">UE introuvable.</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <Link to="/ues" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
                <ArrowLeft size={16} className="mr-2" /> Retour au catalogue
            </Link>

            {/* EN-TÊTE DE LA FICHE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="bg-blue-900 text-white p-8">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2 opacity-90">
                                <span className="bg-blue-800 px-3 py-1 rounded text-sm font-mono tracking-wider">{ue.code}</span>
                                <span className="text-sm font-light">Réf: {ue.ref}</span>
                            </div>
                            <h1 className="text-3xl font-bold leading-tight">{ue.nom}</h1>
                        </div>
                        <div className="flex gap-4 mt-2 md:mt-0">
                            <div className="text-center bg-blue-800/50 p-3 rounded-lg backdrop-blur-sm min-w-[90px]">
                                <div className="text-2xl font-bold">{ue.ects}</div>
                                <div className="text-xs uppercase tracking-wide opacity-80">ECTS</div>
                            </div>
                            <div className="text-center bg-blue-800/50 p-3 rounded-lg backdrop-blur-sm min-w-[90px]">
                                <div className="text-2xl font-bold">{ue.nbPeriodes}</div>
                                <div className="text-xs uppercase tracking-wide opacity-80">Périodes</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CORPS DE LA FICHE */}
                <div className="p-8 grid md:grid-cols-3 gap-10">

                    {/* COLONNE GAUCHE : PROGRAMME */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 text-blue-900 border-b pb-2">
                            <BookOpen size={24} />
                            <h2 className="text-xl font-bold">Contenu du cours</h2>
                        </div>
                        <div className="prose text-gray-700 whitespace-pre-line leading-relaxed">
                            {ue.prgm}
                        </div>
                    </div>

                    {/* COLONNE DROITE : ACQUIS & INFOS */}
                    <div className="space-y-8">
                        {/* Acquis d'apprentissage */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <div className="flex items-center gap-2 text-blue-900 mb-4">
                                <Target size={20} />
                                <h3 className="font-bold text-lg">Acquis d'apprentissage</h3>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                                Pour valider cette UE, l'étudiant doit démontrer qu'il maîtrise les compétences suivantes :
                            </p>
                            <ul className="space-y-4">
                                {ue.acquis && ue.acquis.map((acq) => (
                                    <li key={acq.num} className="flex gap-3 text-sm">
                                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                                            {acq.num}
                                        </div>
                                        <div className="flex-grow">
                                            <span className="text-gray-800 block">{acq.acquis}</span>
                                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${acq.pourcentage}%` }}></div>
                                            </div>
                                            <span className="text-xs text-gray-400 mt-0.5 block">Pondération : {acq.pourcentage}%</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Liens utiles (Simulation) */}
                        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                <FileText size={18} /> Documents
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#" className="text-indigo-600 hover:underline flex items-center gap-2">
                                        Voir la fiche ECTS PDF (Site ISFCE)
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};