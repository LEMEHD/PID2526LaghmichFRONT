import { Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

export const Navbar = () => {
    return (
        <nav className="bg-blue-900 text-white shadow-md sticky top-0 z-50">
            <div className="w-full px-6 h-20 flex items-center justify-between">

                {/* --- PARTIE GAUCHE (Logo + Menu) --- */}
                <div className="flex items-center gap-10">

                    {/* 1. Logo Image + Texte */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src="/images/logo_isfce.png"
                            alt="Logo ISFCE"
                            // MODIFICATION ICI : Plus de fond blanc, juste la taille et l'effet de survol
                            className="h-12 w-auto transition-transform group-hover:scale-105"
                        />
                        <div className="flex flex-col leading-none">
                            <span className="font-bold text-xl tracking-wide">ISFCE</span>
                            <span className="text-xs text-blue-300 font-light">Portail Dispenses</span>
                        </div>
                    </Link>

                    {/* 2. Liens de navigation */}
                    <div className="hidden md:flex space-x-6 pt-1">
                        <Link
                            to="/dashboard"
                            className="text-sm font-medium hover:text-blue-200 transition-colors border-b-2 border-transparent hover:border-blue-300 pb-0.5"
                        >
                            Mes Demandes
                        </Link>
                        <Link
                            to="/create"
                            className="text-sm font-medium hover:text-blue-200 transition-colors border-b-2 border-transparent hover:border-blue-300 pb-0.5"
                        >
                            Nouvelle Demande
                        </Link>
                    </div>
                </div>

                {/* --- PARTIE DROITE (Bouton Profil) --- */}
                <div>
                    <div className="flex items-center gap-2 bg-blue-800 hover:bg-blue-700 transition py-2 px-4 rounded-full text-sm font-medium border border-blue-700 shadow-sm cursor-pointer">
                        <span>Mon Profil</span>
                        <UserCircle size={18} />
                    </div>
                </div>

            </div>
        </nav>
    );
};