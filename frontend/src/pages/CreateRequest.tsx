import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSections, createExemptionRequest } from '../services/api';
import type { Section } from '../types';
import { ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

export const CreateRequest = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [sections, setSections] = useState<Section[]>([]);
    const [selectedSection, setSelectedSection] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 1. On charge la liste des sections au démarrage
    useEffect(() => {
        getSections()
            .then(setSections)
            .catch(() => setError("Impossible de charger les sections. Vérifiez le backend."));
    }, []);

    // 2. Fonction appelée quand on clique sur "Créer"
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSection) return;

        setLoading(true);
        try {
            // Création dans la DB via l'API (en passant l'email)
            const newRequest = await createExemptionRequest(user.email, selectedSection);

            // SUCCÈS : On redirige directement vers le nouveau dossier pour commencer l'étape 2
            navigate(`/request/${newRequest.id}`);

        } catch (err) {
            console.error(err);
            setError("Erreur lors de la création du dossier.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">

                {/* En-tête */}
                <div className="text-center mb-8">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Commencer un nouveau dossier</h1>
                    <p className="text-gray-500 mt-2">
                        Pour débuter votre demande de dispense, veuillez sélectionner la section dans laquelle vous êtes inscrit.
                    </p>
                </div>

                {/* Message d'erreur éventuel */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3 border border-red-200">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Section d'études
                        </label>
                        <select
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3 border bg-white"
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            disabled={loading || sections.length === 0}
                            required
                        >
                            <option value="">-- Sélectionnez une section --</option>
                            {sections.map((sec) => (
                                // CORRECTION ICI : sec.nom au lieu de sec.name
                                <option key={sec.code} value={sec.code}>
                                    {sec.nom} ({sec.code})
                                </option>
                            ))}
                        </select>
                        {sections.length === 0 && !error && (
                            <p className="text-xs text-gray-400 mt-1">Chargement des sections...</p>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={!selectedSection || loading}
                            className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                            ${(!selectedSection || loading)
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
                            }`}
                        >
                            {loading ? (
                                <span>Création en cours...</span>
                            ) : (
                                <>
                                    Créer le dossier
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Annuler et retourner au tableau de bord
                    </button>
                </div>
            </div>
        </div>
    );
};