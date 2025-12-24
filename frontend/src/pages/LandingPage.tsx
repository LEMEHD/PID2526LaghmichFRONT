import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, PlusCircle, BookOpen, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Configuration du Carrousel (Vos images originales)
const SLIDES = [
    {
        image: "/images/banniere_ecole.jpg",
        title: "Formation Continue",
        subtitle: "L'excellence académique au cœur de Bruxelles."
    },
    {
        image: "/images/banniere_informatique.jpg",
        title: "Informatique",
        subtitle: "Bachelier en Développement d'applications"
    },
    {
        image: "/images/banniere_compta.jpg",
        title: "Comptabilité",
        subtitle: "Bachelier en Gestion"
    },
    // Ajoutez les autres si nécessaire
];

export const LandingPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Changement automatique des slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

    return (
        <div className="flex flex-col">
            {/* --- CARROUSEL BANNIÈRE (Plein écran relatif) --- */}
            <div className="relative h-[500px] w-full overflow-hidden bg-gray-900">
                {SLIDES.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        {/* Filtre sombre pour lisibilité texte */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-transparent z-10" />

                        {/* Image de fond */}
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />

                        {/* Texte sur la bannière */}
                        <div className="absolute inset-0 z-20 flex items-center px-6">
                            <div className="max-w-4xl text-white pl-12 md:pl-24">
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg leading-tight">
                                    {slide.title}
                                </h1>
                                <p className="text-lg md:text-xl text-blue-100 drop-shadow-md border-l-4 border-yellow-400 pl-4">
                                    {slide.subtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Contrôles du slider */}
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition">
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition">
                    <ChevronRight className="w-8 h-8" />
                </button>

                {/* Indicateurs (points en bas) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
                    {SLIDES.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-3 h-3 rounded-full transition-all shadow-sm ${
                                idx === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/50 hover:bg-white'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* --- GRILLE DE NAVIGATION (Les 3 cartes qui remontent) --- */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-30 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Carte 1 : Mes Demandes */}
                    <Link to="/dashboard" className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2 border-b-4 border-indigo-600 flex flex-col justify-between h-full group">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors duration-300">
                                    <FileText className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                                </div>
                                <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-indigo-600 transition" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Mes Demandes</h3>
                            <p className="text-gray-500">Suivre l'état de vos dossiers de dispenses en cours.</p>
                        </div>
                    </Link>

                    {/* Carte 2 : Nouvelle Demande */}
                    <Link to="/create" className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2 border-b-4 border-green-500 flex flex-col justify-between h-full group">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-green-50 rounded-2xl group-hover:bg-green-600 transition-colors duration-300">
                                    <PlusCircle className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                                </div>
                                <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-green-500 transition" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Nouvelle Demande</h3>
                            <p className="text-gray-500">Introduire un nouveau dossier pour une section.</p>
                        </div>
                    </Link>

                    {/* Carte 3 : Liste des UE (Catalogue) */}
                    {/* Note: pointe vers dashboard pour l'instant car /ues n'est pas encore fait */}
                    <Link to="/ues" className="bg-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2 border-b-4 border-blue-500 flex flex-col justify-between h-full group">
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors duration-300">
                                    <BookOpen className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <ArrowRight className="w-6 h-6 text-gray-300 group-hover:text-blue-500 transition" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Liste des UE</h3>
                            <p className="text-gray-500">Consulter le catalogue officiel des cours.</p>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
};