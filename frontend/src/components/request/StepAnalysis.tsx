import React, { useState } from 'react';
import { addManualItem, deleteItem } from '../../services/api';
import type { ExemptionRequestFullDto, UEDto } from '../../types';
import {
    BrainCog, Info, Trash2, Plus, AlertTriangle, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import {getErrorMessage} from "../../utils/errorUtils.ts";

interface StepAnalysisProps {
    request: ExemptionRequestFullDto;
    ues: UEDto[];
    onReload: () => void;
    onBack: () => void;
    onNext: () => void;
}

export const StepAnalysis: React.FC<StepAnalysisProps> = ({ request, ues, onReload, onBack, onNext }) => {
    const [manualItem, setManualItem] = useState({ ueCode: '', selectedCourseIds: [] as string[] });

    // Validation
    const usedCourseIds = new Set(request.items?.flatMap(item => item.justifyingCourses?.map(c => c.id) || []) || []);
    const orphanCourses = request.externalCourses.filter(c => !usedCourseIds.has(c.id)) || [];
    const isStepValid = (request.items?.length || 0) > 0 && orphanCourses.length === 0;

    const handleAddManualItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualItem.ueCode || manualItem.selectedCourseIds.length === 0) return;
        try {
            await addManualItem(request.id, manualItem.ueCode, manualItem.selectedCourseIds);
            setManualItem({ ueCode: '', selectedCourseIds: [] });
            toast.success("Demande ajoutée !");
            onReload();
        } catch (err) {
            toast.error(getErrorMessage(err, "Erreur lors de l'ajout manuel."));
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (!confirm("Retirer cette demande de dispense ?")) return;
        try {
            await deleteItem(itemId);
            toast.success("Demande retirée");
            onReload();
        } catch (err) {
            toast.error(getErrorMessage(err, "Impossible de supprimer cet élément."));
        }
    };

    const toggleCourseSelection = (courseId: string) => {
        setManualItem(prev => {
            const exists = prev.selectedCourseIds.includes(courseId);
            return exists
                ? { ...prev, selectedCourseIds: prev.selectedCourseIds.filter(id => id !== courseId) }
                : { ...prev, selectedCourseIds: [...prev.selectedCourseIds, courseId] };
        });
    };

    return (
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
                {!isStepValid && (
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
                    <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition">&larr; Revenir aux cours</button>
                    <button onClick={onNext} disabled={!isStepValid} className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold shadow-lg transition ${!isStepValid ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transform"}`}>
                        Valider et Continuer <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};