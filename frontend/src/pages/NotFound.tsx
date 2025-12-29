import { useNavigate } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="text-center space-y-6 max-w-lg">

                {/* Illustration Icone */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-6 rounded-full shadow-xl border-2 border-blue-50">
                        <FileQuestion size={64} className="text-blue-600" />
                    </div>
                </div>

                {/* Textes */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Page introuvable
                    </h1>
                    <p className="text-lg text-gray-500">
                        Oups ! La page que vous cherchez semble avoir disparu ou n'a jamais existé.
                    </p>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition shadow-sm"
                    >
                        <ArrowLeft size={20} />
                        Retour
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:scale-105 transition shadow-lg"
                    >
                        <Home size={20} />
                        Tableau de bord
                    </button>
                </div>

                {/* Code erreur discret */}
                <p className="text-xs text-gray-300 font-mono mt-8">ERREUR 404</p>
            </div>
        </div>
    );
};