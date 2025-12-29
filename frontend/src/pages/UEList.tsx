import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUEs, getSections } from '../services/api';
import type { UEDto, Section } from '../types';
import { Search, BookOpen, Filter, ArrowLeft } from 'lucide-react';

export const UEList = () => {
    // États pour les données
    const [ues, setUes] = useState<UEDto[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);

    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSection, setSelectedSection] = useState(''); // '' = Toutes

    const navigate = useNavigate();

    // Chargement des données au montage
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [uesData, sectionsData] = await Promise.all([getUEs(), getSections()]);
                setUes(uesData);
                setSections(sectionsData);
            } catch (err) {
                console.error("Erreur chargement catalogue", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- LOGIQUE DE FILTRAGE ---
    const filteredUes = useMemo(() => {
        return ues.filter(ue => {
            // 1. Filtre Texte (Nom ou Code)
            const matchesSearch =
                ue.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ue.code.toLowerCase().includes(searchTerm.toLowerCase());

            // 2. Filtre Section
            // Note : Pour l'instant, le backend ne renvoie pas la section dans l'objet UE.
            // On laisse la logique prête, mais on considère que ça match toujours si pas d'info.
            const matchesSection = selectedSection === '' || true;

            return matchesSearch && matchesSection;
        });
    }, [ues, searchTerm, selectedSection]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

            {/* En-tête */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BookOpen className="w-10 h-10 text-indigo-600" />
                        Catalogue des Cours
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">
                        Consultez la liste officielle des Unités d'Enseignement (UE).
                    </p>
                </div>
                <Link
                    to="/"
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-4 py-2 rounded-lg transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'accueil
                </Link>
            </div>

            {/* Barre d'outils (Filtres) */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200">

                {/* Recherche Texte */}
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        placeholder="Rechercher un cours (ex: Java, IPAP...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Sélecteur de Section */}
                <div className="relative min-w-[250px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Filter className="w-5 h-5" />
                    </div>
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                    >
                        <option value="">Toutes les sections</option>
                        {sections.map((sec) => (
                            <option key={sec.code} value={sec.code}>
                                {sec.nom}
                            </option>
                        ))}
                    </select>
                    {/* Flèche custom */}
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Tableau des résultats */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Code
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/2">
                                    Intitulé de l'UE
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Périodes
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    ECTS
                                </th>
                                <th scope="col" className="relative px-6 py-4">
                                    <span className="sr-only">Voir</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUes.length > 0 ? (
                                filteredUes.map((ue) => (
                                    <tr
                                        key={ue.code}
                                        onClick={() => navigate(`/ues/${ue.code}`)}
                                        className="hover:bg-indigo-50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded font-medium bg-gray-100 text-gray-800 font-mono text-sm group-hover:bg-indigo-200 group-hover:text-indigo-900 transition-colors">
                                                    {ue.code}
                                                </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700">
                                                {ue.nom}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-xs">
                                                Réf: {ue.ref}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {ue.nbPeriodes} p.
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                                    {ue.ects} ECTS
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <span className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Détails &rarr;
                                                </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-gray-500 text-lg">Aucun cours ne correspond à votre recherche.</p>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};