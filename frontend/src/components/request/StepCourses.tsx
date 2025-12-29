import React, { useState, useRef } from 'react';
import {
    addExternalCourse, addCourseDocument, addGlobalDocument, uploadFile, deleteDocument
} from '../../services/api'; // Adapte le chemin si besoin
import type { ExemptionRequestFullDto } from '../../types';
import {
    Plus, Upload, FileText, Trash2, ExternalLink, BookOpen, BrainCog, FileCheck, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import {getErrorMessage} from "../../utils/errorUtils.ts";
import {ToastConfirm} from "../ToastConfirm.tsx";

interface StepCoursesProps {
    request: ExemptionRequestFullDto;
    isAnalyzing: boolean;
    onReload: () => void; // Pour rafraîchir les données du parent
    onAnalyze: () => void; // Pour lancer l'analyse
}

export const StepCourses: React.FC<StepCoursesProps> = ({ request, isAnalyzing, onReload, onAnalyze }) => {
    // États locaux (plus besoin de polluer le parent)
    const [newCourse, setNewCourse] = useState({ etablissement: '', code: '', libelle: '', ects: 0 });
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Refs pour l'upload
    const globalDocInputRef = useRef<HTMLInputElement>(null);
    const courseDocInputRef = useRef<HTMLInputElement>(null);
    const [currentUploadContext, setCurrentUploadContext] = useState<{ type: 'GLOBAL' | 'COURSE', subType?: string, courseId?: string } | null>(null);

    // --- GESTION FICHIERS ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUploadContext) return;

        setUploading(true);
        try {
            const fileUrl = await uploadFile(file);
            if (currentUploadContext.type === 'GLOBAL' && currentUploadContext.subType) {
                await addGlobalDocument(request.id, fileUrl, currentUploadContext.subType, file.name);
            } else if (currentUploadContext.type === 'COURSE' && currentUploadContext.courseId) {
                await addCourseDocument(currentUploadContext.courseId, fileUrl, file.name);
            }
            toast.success("Document ajouté !");
            onReload();
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, "Erreur lors de l'envoi du fichier."));
        } finally {
            setUploading(false);
            setCurrentUploadContext(null);
            if (e.target) e.target.value = '';
        }
    };

    const handleDeleteDoc = (docId: string) => {
        // On lance la notification interactive
        toast((t) => (
            <ToastConfirm
                t={t}
                message="Supprimer définitivement ce document ?"
                onConfirm={async () => {
                    const loadingToast = toast.loading("Suppression du document...");

                    try {
                        await deleteDocument(docId);

                        // Succès
                        toast.success("Document supprimé", { id: loadingToast });
                        onReload(); // Rafraîchit la liste des fichiers
                    } catch (err) {
                        // Erreur
                        toast.error(getErrorMessage(err, "Impossible de supprimer le document."), { id: loadingToast });
                    }
                }}
            />
        ), {
            // Style de la carte de confirmation
            duration: 5000,
            style: {
                background: '#fff',
                padding: '16px',
                borderRadius: '16px',
                border: '1px solid #f3f4f6',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }
        });
    };

    // --- AJOUT COURS ---
    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addExternalCourse(request.id, newCourse);
            setNewCourse({ etablissement: '', code: '', libelle: '', ects: 0 });
            setShowCourseForm(false);
            toast.success("Cours ajouté avec succès");
            onReload();
        } catch (err) {
            toast.error(getErrorMessage(err, "Erreur lors de l'ajout du cours"));
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative min-h-[400px]">
            {/* INPUTS CACHÉS */}
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

            {/* INFO BOX */}
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
                            onClick={() => { setCurrentUploadContext({ type: 'GLOBAL', subType: 'BULLETIN' }); globalDocInputRef.current?.click(); }}
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
                                        onClick={() => { setCurrentUploadContext({ type: 'COURSE', courseId: course.id }); courseDocInputRef.current?.click(); }}
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
                    onClick={onAnalyze}
                    disabled={isAnalyzing || request.externalCourses.length === 0}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-all"
                >
                    {isAnalyzing ? "Analyse en cours..." : <><BrainCog /> Lancer l'analyse</>}
                </button>
            </div>
        </div>
    );
};