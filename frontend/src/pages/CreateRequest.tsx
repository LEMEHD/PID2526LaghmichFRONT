import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSections, createExemptionRequest } from '../services/api';
import type { Section } from '../types';
import { ProgressBar } from '../components/ProgressBar'; // Réutilisation intelligente
import { ArrowRight, GraduationCap, Info, ChevronLeft, Loader } from 'lucide-react';
import {getErrorMessage} from "../utils/errorUtils.ts";

export const CreateRequest = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [sections, setSections] = useState<Section[]>([]);
    const [selectedSection, setSelectedSection] = useState('');
    const [loading, setLoading] = useState(false);
    const [initLoading, setInitLoading] = useState(true);
    const [error, setError] = useState('');

    // Chargement des sections
    useEffect(() => {
        getSections()
            .then(data => {
                setSections(data);
                setInitLoading(false);
            })
            .catch((err) => { // On capture l'erreur
                setError(getErrorMessage(err, "Impossible de charger la liste des sections.")); // On l'utilise
                setInitLoading(false);
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSection || !user?.email) return;

        setLoading(true);
        setError(''); // Reset erreur
        try {
            const newRequest = await createExemptionRequest(user.email, selectedSection);
            navigate(`/request/${newRequest.id}`);
        } catch (err) {
            console.error(err);
            // On affiche l'erreur dans la div rouge
            setError(getErrorMessage(err, "Une erreur est survenue lors de la création du dossier."));
        } finally {
            setLoading(false);
        }
    };

    if (initLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader className="animate-spin text-blue-600" size={40} />
                <p className="text-gray-500 font-medium">Chargement des sections disponibles...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">

            {/* BOUTON RETOUR */}
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition mb-6 font-medium"
            >
                <ChevronLeft size={20} /> Retour au tableau de bord
            </button>

            {/* BARRE DE PROGRESSION (ÉTAPE 1) */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Initialisation du dossier</h1>
                <ProgressBar currentStep={1} />
            </div>

            <div className="grid md:grid-cols-5 gap-8">

                {/* COLONNE GAUCHE : CONTEXTE (2/5) */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-blue-900">
                        <h3 className="font-bold flex items-center gap-2 mb-3">
                            <Info size={20} /> Pourquoi cette étape ?
                        </h3>
                        <p className="text-sm leading-relaxed text-blue-800">
                            Le choix de la section est crucial. Il détermine :
                        </p>
                        <ul className="list-disc list-inside mt-2 text-sm space-y-1 text-blue-800 ml-1">
                            <li>Le programme de cours cible.</li>
                            <li>Les règles de correspondances automatiques.</li>
                            <li>Le coordinateur qui validera votre dossier.</li>
                        </ul>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-2">Besoin d'aide ?</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Si vous hésitez entre deux sections (ex: Info de Gestion vs Systèmes), consultez les grilles de cours sur le site.
                        </p>
                        <a href="https://www.isfce.org" target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                            Voir les programmes &rarr;
                        </a>
                    </div>
                </div>

                {/* COLONNE DROITE : FORMULAIRE (3/5) */}
                <div className="md:col-span-3">
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 h-full flex flex-col justify-center">

                        <div className="text-center mb-8">
                            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Sélectionnez votre cursus</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Dans quelle section souhaitez-vous vous inscrire ?
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <select
                                    className="w-full appearance-none border-2 border-gray-200 rounded-xl p-4 pl-5 pr-10 bg-white font-medium text-gray-700 focus:border-blue-500 focus:ring-0 outline-none transition cursor-pointer hover:border-blue-300"
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    disabled={loading}
                                    required
                                >
                                    <option value="">-- Choisir dans la liste --</option>
                                    {sections.map((sec) => (
                                        <option key={sec.code} value={sec.code}>
                                            {sec.nom}
                                        </option>
                                    ))}
                                </select>
                                {/* Petite flèche custom pour le style */}
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedSection || loading}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition transform
                                ${(!selectedSection || loading)
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader className="animate-spin" size={20} /> Création...
                                    </>
                                ) : (
                                    <>
                                        Commencer le dossier <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};