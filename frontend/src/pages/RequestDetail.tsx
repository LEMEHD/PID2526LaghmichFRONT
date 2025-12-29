import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getExemptionRequest, addExternalCourse, addCourseDocument, addGlobalDocument,
    analyzeRequest, submitRequest, getUEs, addManualItem, uploadFile, deleteDocument, deleteItem
} from '../services/api';
import type { ExemptionRequestFullDto, UEDto } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import {
    Plus, Upload, FileText, ArrowRight, Save, BookOpen, FileCheck, Loader,
    Trash2, ExternalLink, Info, BrainCog, AlertTriangle, CheckCircle, XCircle, Clock, Sparkles, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../components/ConfirmModal';

// CORRECTION ICI : Le nom est bien RequestDetail
export const RequestDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // --- ÉTATS ---
    const [request, setRequest] = useState<ExemptionRequestFullDto | null>(null);
    const [step, setStep] = useState(2);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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
        getUEs().then(setUes).catch(console.error);

        setLoading(true);
        getExemptionRequest(id)
            .then(data => {
                setRequest(data);
                // Détermination intelligente de l'étape initiale
                if (['SUBMITTED', 'IN_REVIEW', 'ACCEPTED', 'REJECTED'].includes(data.statut)) {
                    setStep(5); // Mode "Vue Résultat/Suivi"
                } else if (data.items && data.items.length > 0) {
                    setStep(3); // Mode "Résultats/Analyse"
                } else {
                    setStep(2); // Mode "Constitution du dossier"
                }
            })
            .catch(() => alert("Erreur chargement du dossier"))
            .finally(() => setLoading(false));
    }, [id]);

    // Surveillance pour basculer en étape 5 après soumission
    useEffect(() => {
        if (request?.statut && ['SUBMITTED', 'IN_REVIEW', 'ACCEPTED', 'REJECTED'].includes(request.statut)) {
            setStep(5);
        }
    }, [request]);

    const refreshData = () => {
        if (!id) return;
        getExemptionRequest(id).then(setRequest);
    };

    // --- GESTION FICHIERS ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUploadContext || !id) return;
        setUploading(true);
        try {
            const fileUrl = await uploadFile(file);
            if (currentUploadContext.type === 'GLOBAL' && currentUploadContext.subType) {
                await addGlobalDocument(id, fileUrl, currentUploadContext.subType, file.name);
            } else if (currentUploadContext.type === 'COURSE' && currentUploadContext.courseId) {
                await addCourseDocument(currentUploadContext.courseId, fileUrl, file.name);
            }
            refreshData();
        } catch (err) { console.error(err); alert("Erreur lors de l'envoi du fichier."); }
        finally { setUploading(false); setCurrentUploadContext(null); if (e.target) e.target.value = ''; }
    };

    const handleDeleteDoc = async (docId: string) => {
        if (!confirm("Supprimer ce document ?")) return;
        try { await deleteDocument(docId); refreshData(); } catch (err) { alert("Impossible de supprimer."); }
    };

    // --- ACTIONS ÉTAPE 2 (COURS) ---
    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        try { await addExternalCourse(id, newCourse); setNewCourse({ etablissement: '', code: '', libelle: '', ects: 0 }); setShowCourseForm(false); refreshData(); } catch (err) { alert("Erreur ajout cours"); }
    };

    const handleAnalyze = async () => {
        if (!id) return;
        const hasGlobalDoc = request?.documents && request.documents.length > 0;
        const allCoursesHaveDoc = request?.externalCourses.every(c => c.hasDocAttached);

        if (!hasGlobalDoc && !allCoursesHaveDoc) {
            toast.error("Veuillez fournir un Bulletin Global OU une preuve pour chaque cours.");
            return;
        }

        setIsAnalyzing(true);
        try {
            await new Promise(r => setTimeout(r, 2000)); // Simulation attente UX
            const updatedReq = await analyzeRequest(id);
            setRequest(updatedReq);
            setStep(3);
        } catch (err) { alert("Erreur lors de l'analyse."); }
        finally { setIsAnalyzing(false); }
    };

    // --- ACTIONS ÉTAPE 3 (ITEMS) ---
    const handleAddManualItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !manualItem.ueCode || manualItem.selectedCourseIds.length === 0) return;
        try {
            const updated = await addManualItem(id, manualItem.ueCode, manualItem.selectedCourseIds);
            setRequest(updated);
            setManualItem({ ueCode: '', selectedCourseIds: [] });
        } catch (err: any) {
            const msg = err.response?.data;
            alert(typeof msg === 'string' ? msg : "Erreur lors de l'ajout.");
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!id || !confirm("Retirer cette demande de dispense ?")) return;
        try { const updated = await deleteItem(itemId); setRequest(updated); } catch (err) { alert("Impossible de supprimer cet élément."); }
    };

    const toggleCourseSelection = (courseId: string) => {
        setManualItem(prev => {
            const exists = prev.selectedCourseIds.includes(courseId);
            return exists
                ? { ...prev, selectedCourseIds: prev.selectedCourseIds.filter(id => id !== courseId) }
                : { ...prev, selectedCourseIds: [...prev.selectedCourseIds, courseId] };
        });
    };

    // --- ACTIONS ÉTAPE 4 (SOUMISSION) ---
    // 1. La fonction qui ouvre juste la fenêtre
    const openSubmitModal = () => {
        setIsConfirmModalOpen(true);
    };

    // 2. La fonction qui fait vraiment l'envoi (appelée par la modale)
    const handleConfirmSubmission = async () => {
        if (!id) return;
        try {
            await submitRequest(id);
            toast.success("Dossier envoyé avec succès !"); // Joli toast vert
            refreshData();
        } catch (err) {
            toast.error("Erreur lors de l'envoi du dossier."); // Joli toast rouge
        }
    };

    // --- VALIDATIONS ---
    const usedCourseIds = new Set(request?.items?.flatMap(item => item.justifyingCourses?.map(c => c.id) || []) || []);
    const orphanCourses = request?.externalCourses.filter(c => !usedCourseIds.has(c.id)) || [];
    const isStep3Valid = (request?.items?.length || 0) > 0 && orphanCourses.length === 0;


    // --- RENDER ---
    if (loading || !request) return <div className="p-12 text-center text-gray-500">Chargement du dossier...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 pb-24">

            {/* Inputs cachés (Upload) */}
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
                <div className="flex justify-between items-end mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dossier : <span className="text-blue-600">{request.sectionNom}</span>
                    </h1>
                    {/* Bouton retour visible uniquement en mode suivi (step 5) */}
                    {step === 5 && (
                        <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-gray-500 hover:text-blue-600 transition">
                            &larr; Retour au tableau de bord
                        </button>
                    )}
                </div>
                {/* La barre de progression ne s'affiche pas en step 5 (Suivi) */}
                {step < 5 && <ProgressBar currentStep={step} />}
            </div>

            {/* --- ÉTAPE 2 : COURS & DOCUMENTS --- */}
            {step === 2 && (
                <div className="space-y-8 animate-fade-in relative min-h-[400px]">

                    {/* --- DÉBUT ANIMATION ANALYSE --- */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-center p-8 transition-all duration-500">
                            <div className="relative mb-6">
                                {/* Effet de "ping" (ondes) derrière le cerveau */}
                                <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-75"></div>
                                <div className="relative bg-white p-4 rounded-full shadow-xl border border-indigo-100">
                                    <BrainCog size={64} className="text-indigo-600 animate-pulse" />
                                </div>
                                {/* Petites étoiles qui tournent pour le côté "Magique/IA" */}
                                <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" size={24} />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Analyse en cours...</h3>
                            <div className="space-y-1 text-gray-500 font-medium">
                                <p className="animate-pulse">Lecture de vos relevés de notes...</p>
                                <p className="animate-pulse delay-75">Comparaison avec le programme ISFCE...</p>
                                <p className="animate-pulse delay-150">Recherche de correspondances...</p>
                            </div>

                            {/* Barre de chargement décorative */}
                            <div className="w-64 h-2 bg-gray-200 rounded-full mt-8 overflow-hidden">
                                <div className="h-full bg-indigo-600 animate-[width_1.5s_ease-in-out_infinite]" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                    )}
                    {/* --- FIN ANIMATION ANALYSE --- */}

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-blue-800">
                        <BookOpen className="shrink-0" />
                        <div>
                            <p className="font-bold">Étape 2 : Constituez votre dossier</p>
                            <p className="text-sm">Pour valider cette étape, vous devez fournir :</p>
                            <ul className="list-disc list-inside text-sm ml-2">
                                <li>La liste de vos cours réussis.</li>
                                <li><strong>Important :</strong> Soit un relevé de notes global (Bulletin), soit une preuve pour chaque cours.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* COLONNE GAUCHE : DOCUMENTS */}
                        <div className="md:col-span-1 space-y-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <FileCheck className="text-orange-600" /> Documents Officiels
                            </h3>
                            <div className="bg-white border p-4 rounded-xl shadow-sm space-y-3">
                                {request.documents.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {request.documents.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-200 group">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText size={14} className="text-gray-500 shrink-0" />
                                                    <a href={doc.urlStockage} target="_blank" rel="noreferrer" className="truncate hover:underline text-blue-600 font-medium">
                                                        {doc.originalFileName || doc.type}
                                                    </a>
                                                </div>
                                                <button onClick={() => handleDeleteDoc(doc.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => { setCurrentUploadContext({ type: 'GLOBAL', subType: 'BULLETIN' }); if (globalDocInputRef.current) globalDocInputRef.current.click(); }}
                                    className="w-full py-3 border-2 border-dashed border-blue-300 bg-blue-50 rounded text-sm text-blue-700 hover:bg-blue-100 transition flex items-center justify-center gap-2 font-medium"
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
                                            {course.programmes && course.programmes.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                    {course.programmes.map(p => (
                                                        <div key={p.id} className="flex items-center gap-2 text-xs bg-gray-50 w-fit px-2 py-1 rounded border">
                                                            <ExternalLink size={10} className="text-gray-400" />
                                                            <a href={p.urlStockage} target="_blank" rel="noreferrer" className="truncate max-w-[150px] hover:underline text-blue-600">{p.originalFileName || "Document"}</a>
                                                            <button onClick={() => handleDeleteDoc(p.id)} className="text-red-500 ml-1"><Trash2 size={12} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <button
                                                onClick={() => { setCurrentUploadContext({ type: 'COURSE', courseId: course.id }); if (courseDocInputRef.current) courseDocInputRef.current.click(); }}
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
                                            <input placeholder="Établissement" className="p-2 border rounded text-sm" required value={newCourse.etablissement} onChange={e => setNewCourse({ ...newCourse, etablissement: e.target.value })} />
                                            <input placeholder="Code" className="p-2 border rounded text-sm" required value={newCourse.code} onChange={e => setNewCourse({ ...newCourse, code: e.target.value })} />
                                            <input placeholder="Intitulé" className="p-2 border rounded text-sm col-span-2" required value={newCourse.libelle} onChange={e => setNewCourse({ ...newCourse, libelle: e.target.value })} />
                                            <input type="number" placeholder="ECTS" className="p-2 border rounded text-sm" required min="1" value={newCourse.ects || ''} onChange={e => setNewCourse({ ...newCourse, ects: parseInt(e.target.value) })} />
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
                            {isAnalyzing ? "Analyse en cours..." : <><BrainCog /> Lancer l'analyse</>}
                        </button>
                    </div>
                </div>
            )}

            {/* --- ÉTAPE 3 : RÉSULTATS & AJOUT MANUEL --- */}
            {step === 3 && (
                <div className="space-y-8 animate-fade-in">

                    {/* RÉSULTATS AUTOMATIQUES */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <BrainCog className="text-indigo-600" /> Résultats de l'analyse
                        </h2>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex gap-3 text-indigo-900 text-sm">
                            <Info className="shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="font-semibold mb-1">Correspondances détectées</p>
                                <p>Le système a identifié ces correspondances. Ces demandes sont pré-remplies, vous pouvez les supprimer si nécessaire.</p>
                            </div>
                        </div>

                        {request.items && request.items.length > 0 ? (
                            <div className="space-y-3">
                                {request.items.map(item => {
                                    const isPending = item.decision === 'PENDING';
                                    const containerClass = isPending ? "bg-orange-50 border-orange-200" : "bg-green-50 border-green-200";
                                    const titleClass = isPending ? "text-orange-900" : "text-green-900";
                                    const badgeClass = isPending ? "bg-orange-200 text-orange-800" : "bg-green-200 text-green-800";

                                    return (
                                        <div key={item.id} className={`border p-4 rounded-lg flex justify-between items-center ${containerClass}`}>
                                            <div>
                                                <div className={`font-bold ${titleClass}`}>{item.ue?.nom} ({item.ue?.code})</div>
                                                <div className="text-sm opacity-80">Via : {item.justifyingCourses?.map(c => c.code).join(', ')}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                                                    {item.decision === 'AUTO_ACCEPTED' ? 'AUTOMATIQUE' : 'MANUEL'}
                                                </span>
                                                <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-full transition"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-gray-100 p-6 rounded-lg text-center text-gray-500 italic">Aucune correspondance automatique. Utilisez le formulaire pour ajouter vos demandes.</div>
                        )}
                    </div>

                    {/* AJOUT MANUEL */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Plus className="text-gray-600" /> Ajouter une demande manuellement</h2>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex gap-3 text-blue-900 text-sm">
                            <Info className="shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="font-semibold mb-1">Comment procéder ?</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-800">
                                    <li>Sélectionnez l'<strong>UE de l'ISFCE</strong> visée.</li>
                                    <li>Cochez les <strong>cours externes</strong> justificatifs.</li>
                                    <li>Si un cours justifie plusieurs UEs, créez une demande par UE.</li>
                                </ul>
                            </div>
                        </div>

                        <form onSubmit={handleAddManualItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">UE demandée</label>
                                <select className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500" value={manualItem.ueCode} onChange={e => setManualItem({ ...manualItem, ueCode: e.target.value })}>
                                    <option value="">-- Sélectionner une UE --</option>
                                    {ues.map(ue => <option key={ue.code} value={ue.code}>{ue.nom} ({ue.code} - {ue.ects} ECTS)</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cours justificatif(s)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                                    {request.externalCourses.map(course => (
                                        <label key={course.id} className="flex items-start gap-3 p-2 hover:bg-white rounded-md cursor-pointer transition border border-transparent hover:border-gray-200">
                                            <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" checked={manualItem.selectedCourseIds.includes(course.id)} onChange={() => toggleCourseSelection(course.id)} />
                                            <div>
                                                <span className="block text-sm font-medium text-gray-900">{course.libelle}</span>
                                                <span className="block text-xs text-gray-500">{course.code} • {course.ects} ECTS</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={!manualItem.ueCode || manualItem.selectedCourseIds.length === 0} className="bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">Ajouter la demande</button>
                            </div>
                        </form>
                    </div>

                    {/* NAVIGATION FIN ÉTAPE 3 */}
                    <div className="flex flex-col gap-4 pt-6 border-t mt-8">
                        {!isStep3Valid && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 text-red-800 text-sm">
                                <AlertTriangle className="shrink-0" />
                                <div>
                                    <p className="font-bold">Impossible de continuer :</p>
                                    <ul className="list-disc list-inside mt-1 space-y-1">
                                        {(!request.items || request.items.length === 0) && <li>Créez au moins une demande.</li>}
                                        {orphanCourses.length > 0 && <li>Cours non utilisés : <strong>{orphanCourses.map(c => c.libelle).join(', ')}</strong>.</li>}
                                    </ul>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition">&larr; Revenir aux cours</button>
                            <button onClick={() => setStep(4)} disabled={!isStep3Valid} className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold shadow-lg transition ${!isStep3Valid ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transform"}`}>
                                Valider et Continuer <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ÉTAPE 4 : RÉCAPITULATIF (AVANT ENVOI) --- */}
            {step === 4 && (
                <div className="animate-fade-in space-y-6">
                    <div className="bg-white shadow-xl border border-gray-200 rounded-sm p-8 max-w-4xl mx-auto text-gray-800">
                        {/* HEADER DOCUMENT */}
                        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                            <div className="flex items-center gap-4">
                                <img src="/images/logo_isfce_original.png" alt="ISFCE" className="h-16 w-auto" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Demande de Dispense</h2>
                                    <p className="text-sm text-gray-500">Année Académique 2024-2025</p>
                                </div>
                            </div>
                            <div className="text-right text-sm">
                                <p className="font-bold text-gray-900">Dossier Réf: {request.id.substring(0, 8).toUpperCase()}</p>
                                <p className="text-gray-500">Date : {new Date().toLocaleDateString('fr-FR')}</p>
                                <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">BROUILLON</div>
                            </div>
                        </div>

                        {/* INFO ETUDIANT */}
                        <div className="grid grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">Demandeur</h3>
                                <p className="font-bold text-lg">{request.etudiant?.nom} {request.etudiant?.prenom}</p>
                                <p className="text-gray-600 text-sm">{request.etudiant?.email}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">Section Demandée</h3>
                                <p className="font-bold text-lg text-indigo-700">{request.sectionNom}</p>
                                <p className="text-gray-600 text-sm">Institut Supérieur de Formation Continue d'Etterbeek</p>
                            </div>
                        </div>

                        {/* TABLEAU Items */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4">Dispenses Sollicitées ({request.items?.length || 0})</h3>
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">UE ISFCE (Cible)</th>
                                    <th className="px-4 py-3">Justificatif(s) Externe(s)</th>
                                    <th className="px-4 py-3 text-right">Crédits</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {request.items?.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-4 font-medium text-gray-900">{item.ue?.nom} <br /><span className="text-xs text-gray-500 font-normal">{item.ue?.code}</span></td>
                                        <td className="px-4 py-4 text-gray-600">{item.justifyingCourses?.map(c => <div key={c.id}>• {c.libelle} <span className="text-xs text-gray-400">({c.etablissement})</span></div>)}</td>
                                        <td className="px-4 py-4 text-right font-mono text-gray-500">{item.ue?.ects} ECTS</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* LISTE PIÈCES JOINTES */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4">Pièces Jointes</h3>
                            <div className="flex flex-wrap gap-3">
                                {request.documents.map(doc => <div key={doc.id} className="flex items-center gap-2 bg-gray-50 border px-3 py-2 rounded text-sm text-gray-600"><FileText size={14} /><span className="truncate max-w-[200px]">{doc.originalFileName || doc.type}</span></div>)}
                                {request.externalCourses.flatMap(c => c.programmes).map(prog => <div key={prog?.id} className="flex items-center gap-2 bg-gray-50 border px-3 py-2 rounded text-sm text-gray-600"><ExternalLink size={14} /><span className="truncate max-w-[200px]">{prog?.originalFileName || "Programme"}</span></div>)}
                            </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
                            <p>Ce document est généré électroniquement. Toute fausse déclaration entraîne l'annulation.</p>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto flex justify-between items-center py-4">
                        <button onClick={() => setStep(3)} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition">Modifier le dossier</button>
                        <div className="flex gap-4 items-center">
                            <button
                                onClick={openSubmitModal} // On appelle l'ouverture de la modale
                                className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-xl hover:bg-green-700 flex items-center gap-2 transform hover:scale-105 transition"
                            >
                                <Save size={20} /> Confirmer et Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ÉTAPE 5 : VUE RÉSULTAT / SUIVI --- */}
            {step === 5 && (
                <div className="animate-fade-in space-y-8 max-w-5xl mx-auto">

                    {/* TIMELINE */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock className="text-blue-600" /> État d'avancement
                        </h2>
                        <div className="relative flex items-center justify-between px-4 md:px-10">
                            <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-100 -z-0"></div>
                            <div className="flex flex-col items-center gap-2 bg-white z-10">
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center border-4 border-white shadow-sm"><CheckCircle size={20} /></div>
                                <span className="text-xs font-bold text-green-700 uppercase">Déposé</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-white z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${request.statut === 'IN_REVIEW' || request.statut === 'ACCEPTED' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}><Search size={20} /></div>
                                <span className={`text-xs font-bold uppercase ${request.statut === 'IN_REVIEW' ? 'text-blue-700 animate-pulse' : 'text-gray-400'}`}>En Analyse</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 bg-white z-10">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${request.statut === 'ACCEPTED' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}><FileCheck size={20} /></div>
                                <span className={`text-xs font-bold uppercase ${request.statut === 'ACCEPTED' ? 'text-green-700' : 'text-gray-400'}`}>Clôturé</span>
                            </div>
                        </div>
                        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-center text-gray-600 border border-gray-100">
                            {request.statut === 'SUBMITTED' && "Votre dossier a été transmis au secrétariat."}
                            {request.statut === 'IN_REVIEW' && "Un coordinateur examine vos demandes."}
                            {request.statut === 'ACCEPTED' && "Analyse terminée. Consultez le détail ci-dessous."}
                        </div>
                    </div>

                    {/* TABLEAU DÉTAILLÉ */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200"><h3 className="font-bold text-gray-800">Détail des décisions par UE</h3></div>
                        <div className="divide-y divide-gray-100">
                            {request.items?.map(item => {
                                let statusIcon = <Clock size={18} className="text-orange-500" />;
                                let statusText = "En attente";
                                let statusClass = "bg-orange-50 text-orange-700 border-orange-100";
                                if (item.decision === 'ACCEPTED' || item.decision === 'AUTO_ACCEPTED') {
                                    statusIcon = <CheckCircle size={18} className="text-green-600" />;
                                    statusText = "Accordé";
                                    statusClass = "bg-green-50 text-green-800 border-green-100";
                                } else if (item.decision === 'REJECTED') {
                                    statusIcon = <XCircle size={18} className="text-red-600" />;
                                    statusText = "Refusé";
                                    statusClass = "bg-red-50 text-red-800 border-red-100";
                                }

                                return (
                                    <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                                        <div className="flex flex-col md:flex-row justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1"><span className="font-bold text-gray-900 text-lg">{item.ue?.nom}</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border">{item.ue?.code}</span></div>
                                                <p className="text-sm text-gray-500 flex items-center gap-2"><ArrowRight size={14} className="text-gray-400" /> Justifié par : <span className="font-medium text-gray-700">{item.justifyingCourses?.map(c => c.libelle).join(', ')}</span></p>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end gap-2">
                                                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${statusClass}`}>{statusIcon}<span className="font-bold text-sm">{statusText}</span></div>
                                                <span className="text-xs text-gray-400">{item.ue?.ects} ECTS</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmSubmission}
                title="Validation définitive"
                message="Êtes-vous sûr de vouloir soumettre votre dossier ? Une fois envoyé, vous ne pourrez plus le modifier ni ajouter de pièces jointes."
            />
        </div>
    );
};