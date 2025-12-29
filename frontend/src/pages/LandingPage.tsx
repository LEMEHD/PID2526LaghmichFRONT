import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {ArrowRight, CheckCircle, FileText, ShieldCheck, Clock, BrainCog} from 'lucide-react';

export const LandingPage = () => {
    const { user, signIn } = useAuth();
    const navigate = useNavigate();

    // Action du bouton principal selon l'état de connexion
    const handleMainAction = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            signIn(); // Déclenche la connexion Keycloak (ou ta méthode mockée)
        }
    };

    return (
        <div className="flex flex-col min-h-screen animate-fade-in">

            {/* --- HERO SECTION --- */}
            <div className="relative bg-blue-900 text-white overflow-hidden">
                {/* Image de fond avec overlay sombre pour la lisibilité */}
                <div className="absolute inset-0">
                    <img
                        src="/images/banniere_ecole.jpg"
                        alt="Campus ISFCE"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-800/50"></div>
                </div>

                <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-400/30 rounded-full px-4 py-1 text-sm font-medium text-blue-100 backdrop-blur-sm">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            Rentrée Académique 2024-2025
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                            Valorisez vos acquis et <br/>
                            <span className="text-blue-300">simplifiez votre parcours.</span>
                        </h1>
                        <p className="text-lg text-blue-100 max-w-lg leading-relaxed">
                            La plateforme non-officielle de gestion des dispenses de l'ISFCE.
                            Introduisez vos demandes, téléchargez vos preuves et suivez l'avancement de votre dossier en temps réel.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={handleMainAction}
                                className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-50 hover:scale-105 transition transform flex items-center justify-center gap-3"
                            >
                                {user ? 'Accéder à mon Espace' : 'Commencer ma demande'}
                                <ArrowRight size={20} />
                            </button>
                            {!user && (
                                <button className="px-8 py-4 rounded-xl font-bold text-white border border-white/30 hover:bg-white/10 transition">
                                    En savoir plus
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Petite carte flottante décorative */}
                    <div className="hidden md:block w-80 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl text-white transform rotate-3 hover:rotate-0 transition duration-500">
                        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
                            <div className="bg-green-500 p-2 rounded-lg">
                                <CheckCircle size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">Dossier Validé</p>
                                <p className="text-xs text-blue-200">Il y a 2 heures</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-2 bg-white/20 rounded w-3/4"></div>
                            <div className="h-2 bg-white/10 rounded w-1/2"></div>
                            <div className="h-2 bg-white/10 rounded w-5/6"></div>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-200">
                            <ShieldCheck size={16} /> 100% Digitalisé
                        </div>
                    </div>
                </div>
            </div>

            {/* --- COMMENT ÇA MARCHE ? --- */}
            <div className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Un processus simple et transparent</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Fini les dossiers papiers perdus. Notre assistant intelligent vous guide étape par étape pour constituer un dossier complet et conforme.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Étape 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition">
                                <FileText size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Constituez votre dossier</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Renseignez votre parcours académique précédent et téléchargez vos bulletins et preuves de réussite directement sur la plateforme.
                            </p>
                        </div>

                        {/* Étape 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition">
                                <BrainCog size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Analyse Automatique</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Notre système compare vos cours avec le programme de l'ISFCE pour vous suggérer automatiquement les dispenses potentielles.
                            </p>
                        </div>

                        {/* Étape 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition">
                                <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Validation Officielle</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Soumettez votre demande. La direction et les coordinateurs examinent votre dossier et vous notifient de la décision finale.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BANDEAU D'INFO / DÉLAIS --- */}
            <div className="bg-white border-y border-gray-100">
                <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Dates limites d'introduction</h3>
                            <p className="text-gray-600">
                                Pour le 1er quadrimestre : <span className="font-bold text-orange-600">15 Octobre 2024</span><br/>
                                Les demandes tardives ne seront pas prioritaires.
                            </p>
                        </div>
                    </div>

                    <div className="h-12 w-px bg-gray-200 hidden md:block"></div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center text-sm font-medium text-gray-600">
                            <span className="hover:text-blue-600 cursor-default transition">Informatique de Gestion</span>
                            <span className="mx-3 text-gray-300">|</span>
                            <span className="hover:text-blue-600 cursor-default transition">Comptabilité</span>
                            <span className="mx-3 text-gray-300">|</span>
                            <span className="hover:text-blue-600 cursor-default transition">Marketing</span>
                            <span className="mx-3 text-gray-300">|</span>
                            <span className="hover:text-blue-600 cursor-default transition">Droit</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FOOTER SIMPLE --- */}
            <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo_isfce.png" alt="ISFCE" className="h-10 opacity-50 grayscale hover:grayscale-0 transition" />
                        <span className="text-sm">© 2024 ISFCE - Tous droits réservés.</span>
                    </div>
                    <div className="text-sm flex gap-6">
                        <a href="#" className="hover:text-white transition">Règlement des études</a>
                        <a href="#" className="hover:text-white transition">Contact Support</a>
                        <a href="#" className="hover:text-white transition">Mentions légales</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};