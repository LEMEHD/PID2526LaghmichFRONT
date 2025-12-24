import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getExemptionRequest, addExternalCourse, addCourseDocument, addGlobalDocument,
    analyzeRequest, submitRequest, getUEs, addManualItem, uploadFile, deleteDocument
} from '../services/api';
import type { ExemptionRequestFullDto, UEDto } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { Plus, Upload, FileText, BrainCircuit, CheckCircle, ArrowRight, Save, BookOpen, AlertTriangle, FileCheck, Loader, Trash2, ExternalLink } from 'lucide-react';

export const RequestDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // États
    const [request, setRequest] = useState<ExemptionRequestFullDto | null>(null);
    const [step, setStep] = useState(2);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Formulaires
    const [ues, setUes] = useState<UEDto[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [newCourse, setNewCourse] = useState({ etablissement: '', code: '', libelle: '', ects: 0 });
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [manualItem, setManualItem] = useState({ ueCode: '', selectedCourseIds: [] as string[] });

    // Refs Upload
    const globalDocInputRef = useRef<HTMLInputElement>(null);
    const courseDocInputRef = useRef<HTMLInputElement>(null);
    const [currentUploadContext, setCurrentUploadContext] = useState<{ type: 'GLOBAL' | 'COURSE', subType?: string, courseId?: string } | null>(null);

    // --- CHARGEMENT ---
    useEffect(() => {
        if (!id) return;

        // On charge les UEs une seule fois
        getUEs().then(setUes).catch(console.error);

        // Chargement initial complet (avec détermination de l'étape)
        setLoading(true);
        getExemptionRequest(id)
            .then(data => {
                setRequest(data);
                // On détermine l'étape UNIQUEMENT au premier chargement pour éviter les sauts
                if (data.statut === 'SUBMITTED' || data.statut === 'ACCEPTED' || data.statut === 'IN_REVIEW') {
                    setStep(4);
                } else if (data.items && data.items.length > 0) {
                    setStep(3);
                } else {
                    setStep(2);
                }
            })
            .catch(() => alert("Erreur chargement"))
            .finally(() => setLoading(false));
    }, [id]);

    // Fonction légère pour rafraîchir les données SANS changer l'étape visuelle
    const refreshData = () => {
        if(!id) return;
        getExemptionRequest(id).then(setRequest);
    };

    // --- GESTION UPLOAD ---

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUploadContext || !id) return;

        // On accepte tout (PDF, JPG, PNG) comme demandé
        setUploading(true);
        try {
            const fileUrl = await uploadFile(file);

            if (currentUploadContext.type === 'GLOBAL' && currentUploadContext.subType) {
                // On passe le nom du fichier ici
                await addGlobalDocument(id, fileUrl, currentUploadContext.subType, file.name);
            } else if (currentUploadContext.type === 'COURSE' && currentUploadContext.courseId) {
                await addCourseDocument(currentUploadContext.courseId, fileUrl, file.name);
            }

            refreshData(); // Rafraichissement sans changer de page
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'envoi.");
        } finally {
            setUploading(false);
            e.target.value = '';
            setCurrentUploadContext(null);
        }
    };

    const handleDeleteDoc = async (docId: string) => {
        if (!confirm("Supprimer ce document ?")) return;
        try {
            await deleteDocument(docId);
            refreshData();
        } catch(err) { alert("Impossible de supprimer."); }
    };

    // --- AUTRES ACTIONS ---
    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try {
            await addExternalCourse(id, newCourse);
            setNewCourse({ etablissement: '', code: '', libelle: '', ects: 0 });
            setShowCourseForm(false);
            refreshData();
        } catch (err) { alert("Erreur ajout cours"); }
    };

    const handleAnalyze = async () => {
        if (!id) return;

        const hasGlobalDoc = request?.documents && request.documents.length > 0;
        const allCoursesHaveDoc = request?.externalCourses.every(c => c.hasDocAttached);

        if (!hasGlobalDoc && !allCoursesHaveDoc) {
            alert("Veuillez fournir un Bulletin Global OU une preuve pour chaque cours.");
            return;
        }

        setIsAnalyzing(true);
        try {
            await new Promise(r => setTimeout(r, 1500));
            const updatedReq = await analyzeRequest(id);
            setRequest(updatedReq);
            setStep(3); // Là on change explicitement d'étape
        } catch (err) {
            alert("Erreur lors de l'analyse.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddManualItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !manualItem.ueCode || manualItem.selectedCourseIds.length === 0) return;
        try {
            const updated = await addManualItem(id, manualItem.ueCode, manualItem.selectedCourseIds);
            setRequest(updated);
            setManualItem({ ueCode: '', selectedCourseIds: [] });
        } catch (err) { alert("Erreur ajout item manuel"); }
    };

    const toggleCourseSelection = (courseId: string) => {
        setManualItem(prev => {
            const exists = prev.selectedCourseIds.includes(courseId);
            if (exists) return { ...prev, selectedCourseIds: prev.selectedCourseIds.filter(id => id !== courseId) };
            return { ...prev, selectedCourseIds: [...prev.selectedCourseIds, courseId] };
        });
    };

    const handleSubmit = async () => {
        if (!id) return;
        if (confirm("Envoyer le dossier définitivement ?")) {
            try {
                await submitRequest(id);
                refreshData();
            } catch (err) { alert("Erreur soumission."); }
        }
    };

    if (loading || !request) return <div className="p-12 text-center">Chargement...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 pb-24">

            {/* Inputs cachés (acceptent PDF et Images) */}
            <input type="file" ref={globalDocInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            <input type="file" ref={courseDocInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />

            {uploading && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl flex flex-col items-center gap-3">
                        <Loader className="animate-spin text-blue-600" size={32} />
                        <span className="font-bold text-gray-700">Envoi en cours...</span>
                    </div>
                </div>
            )}

            {/* EN-TÊTE */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Dossier : <span className="text-blue-600">{request.sectionNom}</span>
                </h1>
                <ProgressBar currentStep={step} />
            </div>

            {/* --- VUE ÉTAPE 2 : COURS & DOCUMENTS --- */}
            {step === 2 && (
                <div className="space-y-8 animate-fade-in">

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-blue-800">
                        <BookOpen className="shrink-0" />
                        <div>
                            <p className="font-bold">Étape 2 : Constituez votre dossier</p>
                            <p className="text-sm">Pour valider cette étape, vous devez fournir :</p>
                            <ul className="list-disc list-inside text-sm ml-2">
                                <li>La liste de vos cours réussis.</li>
                                <li><strong>Important :</strong> Soit un relevé de notes global (Bulletin), soit une preuve pour chaque cours.</li>
                            </ul>
                            <p className="text-sm">Formats acceptés : PDF, Images (JPG, PNG). Taille max recommandée : 5 Mo.</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">

                        {/* COLONNE GAUCHE : DOCUMENTS GÉNÉRAUX */}
                        <div className="md:col-span-1 space-y-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <FileCheck className="text-orange-600" /> Documents Officiels
                            </h3>

                            <div className="bg-white border p-4 rounded-xl shadow-sm space-y-3">
                                {/* Liste des docs ajoutés */}
                                {request.documents.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {request.documents.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-200 group">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText size={14} className="text-gray-500 shrink-0" />
                                                    {/* On affiche le VRAI nom du fichier */}
                                                    <a href={doc.urlStockage} target="_blank" rel="noreferrer" className="truncate hover:underline text-blue-600 font-medium" title={doc.type}>
                                                        {doc.originalFileName || doc.type}
                                                    </a>
                                                </div>
                                                <button onClick={() => handleDeleteDoc(doc.id)} className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* UN SEUL BOUTON ICI */}
                                <button
                                    onClick={() => {
                                        setCurrentUploadContext({ type: 'GLOBAL', subType: 'BULLETIN' });
                                        if (globalDocInputRef.current) globalDocInputRef.current.click();
                                    }}
                                    className="w-full py-3 border-2 border-dashed border-blue-300 bg-blue-50 rounded text-sm text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition flex items-center justify-center gap-2 font-medium"
                                >
                                    <Upload size={16} /> Ajouter Bulletin / Relevé
                                </button>
                            </div>
                        </div>

                        {/* COLONNE DROITE : COURS */}
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <BookOpen className="text-blue-600" /> Mes Cours Réussis
                            </h3>

                            <div className="space-y-3">
                                {request.externalCourses.map(course => (
                                    <div key={course.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-gray-900">{course.libelle}</div>
                                            <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded">{course.code}</span>
                                                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">{course.ects} ECTS</span>
                                            </div>

                                            {/* Liste des preuves par cours */}
                                            {course.programmes && course.programmes.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {course.programmes.map(p => (
                                                        <div key={p.id} className="flex items-center gap-2 text-xs bg-gray-50 w-fit px-2 py-1 rounded border">
                                                            <ExternalLink size={10} className="text-gray-400"/>
                                                            <a href={p.urlStockage} target="_blank" rel="noreferrer" className="truncate max-w-[150px] hover:underline text-blue-600">
                                                                {p.originalFileName || "Document"}
                                                            </a>
                                                            <button onClick={() => handleDeleteDoc(p.id)} className="text-red-500 hover:text-red-700 ml-1"><Trash2 size={12} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setCurrentUploadContext({ type: 'COURSE', courseId: course.id });
                                                    if (courseDocInputRef.current) courseDocInputRef.current.click();
                                                }}
                                                className="text-xs flex items-center gap-1 text-gray-600 hover:text-blue-600 border border-gray-200 px-2 py-1 rounded hover:bg-gray-50 transition"
                                            >
                                                <Upload size={12} /> Joindre PDF/Img
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {showCourseForm ? (
                                    <form onSubmit={handleAddCourse} className="bg-gray-50 border border-dashed border-gray-300 p-4 rounded-xl space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input placeholder="Établissement" className="p-2 border rounded text-sm" required
                                                   value={newCourse.etablissement} onChange={e => setNewCourse({...newCourse, etablissement: e.target.value})} />
                                            <input placeholder="Code" className="p-2 border rounded text-sm" required
                                                   value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} />
                                            <input placeholder="Intitulé" className="p-2 border rounded text-sm col-span-2" required
                                                   value={newCourse.libelle} onChange={e => setNewCourse({...newCourse, libelle: e.target.value})} />
                                            <input type="number" placeholder="ECTS" className="p-2 border rounded text-sm" required min="1"
                                                   value={newCourse.ects || ''} onChange={e => setNewCourse({...newCourse, ects: parseInt(e.target.value)})} />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button type="button" onClick={() => setShowCourseForm(false)} className="text-xs text-gray-500">Annuler</button>
                                            <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded">Enregistrer</button>
                                        </div>
                                    </form>
                                ) : (
                                    <button onClick={() => setShowCourseForm(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 transition flex items-center justify-center gap-2 text-sm">
                                        <Plus size={18} /> Ajouter un cours
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t mt-8">
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || request.externalCourses.length === 0}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all"
                        >
                            {isAnalyzing ? "Analyse en cours..." : <><BrainCircuit /> Lancer l'analyse</>}
                        </button>
                    </div>
                </div>
            )}

            {/* ... ETAPE 3 et 4 inchangées ... */}
            {step === 3 && (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BrainCircuit className="text-indigo-600" /> Résultats</h2>
                        {request.items && request.items.length > 0 ? (
                            <div className="space-y-3">
                                {request.items.map(item => (
                                    <div key={item.id} className="bg-green-50 border border-green-200 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-green-900">{item.ue?.nom} ({item.ue?.code})</div>
                                            <div className="text-sm text-green-700">Via : {item.justifyingCourses?.map(c => c.code).join(', ')}</div>
                                        </div>
                                        <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-bold">{item.decision}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-100 p-6 rounded-lg text-center text-gray-500">Aucune correspondance auto.</div>
                        )}
                    </div>
                    {/* ... (Bloc Ajout Manuel) ... */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus className="text-gray-600" /> Ajout manuel</h2>
                        <form onSubmit={handleAddManualItem} className="space-y-4">
                            <div>
                                <select className="w-full border rounded p-2" value={manualItem.ueCode} onChange={e => setManualItem({...manualItem, ueCode: e.target.value})}>
                                    <option value="">-- Sélectionner une UE --</option>
                                    {ues.map(ue => <option key={ue.code} value={ue.code}>{ue.nom} ({ue.code})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
                                {request.externalCourses.map(course => (
                                    <label key={course.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer">
                                        <input type="checkbox" checked={manualItem.selectedCourseIds.includes(course.id)} onChange={() => toggleCourseSelection(course.id)} />
                                        <span className="text-sm">{course.libelle}</span>
                                    </label>
                                ))}
                            </div>
                            <button type="submit" disabled={!manualItem.ueCode || manualItem.selectedCourseIds.length === 0} className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900 disabled:opacity-50">Ajouter</button>
                        </form>
                    </div>
                    <div className="flex justify-between pt-6 border-t">
                        <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-800">&larr; Retour</button>
                        <button onClick={() => setStep(4)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2">Suivant <ArrowRight /></button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in">
                    {request.statut === 'SUBMITTED' ? (
                        <div className="bg-green-50 border border-green-200 p-8 rounded-xl">
                            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-green-900 mb-2">Dossier Envoyé !</h2>
                            <button onClick={() => navigate('/dashboard')} className="mt-6 text-green-700 underline">Retour au tableau de bord</button>
                        </div>
                    ) : (
                        <div>
                            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-left mb-8">
                                <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2"><AlertTriangle size={20} /> Récapitulatif</h3>
                                <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                                    <li>Documents officiels : <strong>{request.documents.length}</strong></li>
                                    <li>Cours externes : <strong>{request.externalCourses.length}</strong></li>
                                    <li>Dispenses demandées : <strong>{request.items?.length || 0}</strong></li>
                                </ul>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => setStep(3)} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">Modifier</button>
                                <button onClick={handleSubmit} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-xl hover:bg-green-700 flex items-center gap-2"><Save /> Envoyer</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};