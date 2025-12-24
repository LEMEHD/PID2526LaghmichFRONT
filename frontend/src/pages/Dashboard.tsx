import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Calendar, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getStudentRequests, deleteRequest } from '../services/api';
// Assure-toi que ton fichier types/index.ts a bien été mis à jour avec les champs du backend (statut, createdAt...)
import type { ExemptionRequestDto } from '../types';

export const Dashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<ExemptionRequestDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Chargement des demandes au démarrage
    useEffect(() => {
        if (user && user.email) {
            getStudentRequests(user.email)
                .then(data => {
                    setRequests(data);
                    setError('');
                })
                .catch((err) => {
                    console.error("Erreur chargement dashboard:", err);
                    setError("Impossible de charger vos demandes. Vérifiez que le backend tourne.");
                })
                .finally(() => setLoading(false));
        }
    }, [user]);

    // Fonction de suppression
    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault(); // Empêche le clic de déclencher le lien vers le détail
        e.stopPropagation();

        if (confirm("Êtes-vous sûr de vouloir supprimer ce brouillon ?")) {
            try {
                // On passe l'ID qui est maintenant une String (UUID)
                await deleteRequest(id);
                // Mise à jour locale de la liste pour effet immédiat
                setRequests(prev => prev.filter(req => req.id !== id));
            } catch (err) {
                alert("Erreur lors de la suppression.");
                console.error(err);
            }
        }
    };

    // Helper pour la couleur des badges de statut
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'SUBMITTED': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'APPROVED': return 'bg-green-50 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'DRAFT': 'Brouillon',
            'SUBMITTED': 'Soumis',
            'APPROVED': 'Accepté',
            'REJECTED': 'Refusé',
            'UNDER_ANALYSIS': 'Analyse en cours'
        };
        return labels[status] || status;
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes Demandes</h1>
                    <p className="text-gray-500">Gérez vos dossiers de dispenses en cours.</p>
                </div>
                <Link
                    to="/create"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle Demande
                </Link>
            </div>

            {/* Gestion des erreurs */}
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center border border-red-200">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Liste vide */}
            {!loading && !error && requests.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Aucun dossier</h3>
                    <p className="text-gray-500 mt-1 mb-6">Vous n'avez pas encore créé de demande de dispense.</p>
                    <Link to="/create" className="text-indigo-600 font-medium hover:underline">
                        Commencer un dossier &rarr;
                    </Link>
                </div>
            )}

            {/* Grille des demandes */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {requests.map((req) => (
                    <Link
                        key={req.id}
                        to={`/request/${req.id}`}
                        className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition group relative overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(req.statut || 'DRAFT')}`}>
                                    {getStatusLabel(req.statut || 'DRAFT')}
                                </span>
                                {/* On affiche les 8 premiers caractères de l'UUID pour faire "tech" */}
                                <span className="text-xs text-gray-400 font-mono">#{req.id.substring(0, 8)}</span>
                            </div>

                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition mb-1">
                                {req.sectionNom || req.sectionCode}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Code Section : <span className="font-mono text-gray-600">{req.sectionCode}</span>
                            </p>

                            <div className="flex items-center text-xs text-gray-400 border-t border-gray-100 pt-4 mt-auto">
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                <span>Créé le {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Date inconnue'}</span>
                                <ArrowRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-indigo-600 transition" />
                            </div>
                        </div>

                        {/* Bouton supprimer (uniquement pour les brouillons) */}
                        {req.statut === 'DRAFT' && (
                            <button
                                onClick={(e) => handleDelete(e, req.id)}
                                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition z-10"
                                title="Supprimer le brouillon"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
};