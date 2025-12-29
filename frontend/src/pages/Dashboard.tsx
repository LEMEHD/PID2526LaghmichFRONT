import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { myRequests, deleteDraft } from '../services/api'; // Assure-toi d'avoir deleteDraft dans api.ts (on l'a codé précédemment)
import type { ExemptionRequestDto } from '../types';
import {
    Plus, FileText, Clock, CheckCircle, AlertCircle,
    ArrowRight, Trash2, BookOpen, GraduationCap,
} from 'lucide-react';

export const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState<ExemptionRequestDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email) {
            myRequests(user.email)
                .then(setRequests)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Empêche le clic sur la carte
        if (confirm("Supprimer définitivement ce brouillon ?")) {
            try {
                // Supposant que tu as ajouté deleteDraft dans api.ts comme vu précédemment
                // Sinon, commente cette partie pour l'instant
                await deleteDraft(id);
                setRequests(requests.filter(r => r.id !== id));
            } catch (err) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    // Calcul des statistiques (KPIs)
    const stats = {
        drafts: requests.filter(r => r.statut === 'DRAFT').length,
        submitted: requests.filter(r => ['SUBMITTED', 'IN_REVIEW'].includes(r.statut)).length,
        validated: requests.filter(r => r.statut === 'ACCEPTED').length
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Chargement de votre espace...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">

            {/* EN-TÊTE AVEC BOUTON D'ACTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Bonjour, <span className="text-blue-600">{user?.prenom || 'Étudiant'}</span> 👋
                    </h1>
                    <p className="text-gray-500">Voici le suivi de vos demandes de dispenses.</p>
                </div>
                <button
                    onClick={() => navigate('/create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md flex items-center gap-2 transition transform hover:scale-105"
                >
                    <Plus size={20} /> Nouvelle demande
                </button>
            </div>

            {/* BARRE DE STATUTS (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 text-yellow-700 rounded-lg">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats.drafts}</p>
                        <p className="text-sm text-gray-500">Brouillon(s) en cours</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats.submitted}</p>
                        <p className="text-sm text-gray-500">Dossier(s) transmis</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{stats.validated}</p>
                        <p className="text-sm text-gray-500">Accepté(s)</p>
                    </div>
                </div>
            </div>

            {/* LISTE DES DOSSIERS */}
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="text-gray-500" size={20}/> Vos Dossiers
                </h2>

                {requests.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <div className="mb-4 inline-block p-4 bg-white rounded-full shadow-sm">
                            <GraduationCap size={48} className="text-blue-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Aucun dossier pour le moment</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Commencez par créer une demande pour la section dans laquelle vous souhaitez vous inscrire.
                        </p>
                        <button
                            onClick={() => navigate('/create-request')}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Démarrer ma première demande &rarr;
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((req) => {
                            const isDraft = req.statut === 'DRAFT';
                            const isSubmitted = req.statut === 'SUBMITTED';

                            return (
                                <div
                                    key={req.id}
                                    onClick={() => navigate(`/request/${req.id}`)}
                                    className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                                >
                                    {/* Info Principale */}
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg shrink-0 ${isDraft ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
                                            {isDraft ? <FileText size={24} /> : <CheckCircle size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">
                                                {req.sectionNom}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Créée le {req.createdAt ? new Date(req.createdAt).toLocaleDateString('fr-FR') : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Statut & Actions */}
                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">

                                        {/* Badge Statut */}
                                        <div className="flex flex-col items-end">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                ${isDraft ? 'bg-yellow-100 text-yellow-800' : ''}
                                                ${isSubmitted ? 'bg-blue-100 text-blue-800' : ''}
                                                ${req.statut === 'ACCEPTED' ? 'bg-green-100 text-green-800' : ''}
                                            `}>
                                                {isDraft ? 'Brouillon' : isSubmitted ? 'Déposé' : req.statut}
                                            </span>
                                            {isDraft && <span className="text-xs text-gray-400 mt-1">À finaliser</span>}
                                        </div>

                                        {/* Bouton Action */}
                                        <div className="flex items-center gap-2">
                                            {isDraft && (
                                                <button
                                                    onClick={(e) => handleDelete(e, req.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                                    title="Supprimer ce brouillon"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                            <ArrowRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* PIED DE PAGE INFORMATIF */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                        <AlertCircle size={18} /> Besoin d'aide ?
                    </h3>
                    <p className="text-sm text-blue-800 mb-2">
                        Si vous avez un doute sur la correspondance d'un cours, consultez le programme des études sur le site officiel.
                    </p>
                    <a href="https://www.isfce.org" target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">
                        Visiter le site ISFCE &rarr;
                    </a>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                        <Clock size={18} /> Dates limites
                    </h3>
                    <p className="text-sm text-gray-600">
                        Les demandes de dispenses pour le 1er quadrimestre doivent être introduites avant le <strong>15 octobre</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};