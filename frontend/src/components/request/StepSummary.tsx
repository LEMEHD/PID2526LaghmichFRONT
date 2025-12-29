import React from 'react';
import type { ExemptionRequestFullDto } from '../../types';
import { FileText, ExternalLink, Save } from 'lucide-react';

interface StepSummaryProps {
    request: ExemptionRequestFullDto;
    onEdit: () => void;
    onSubmit: () => void;
}

export const StepSummary: React.FC<StepSummaryProps> = ({ request, onEdit, onSubmit }) => {
    return (
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
                <button onClick={onEdit} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2 hover:bg-gray-100 rounded-lg transition">Modifier le dossier</button>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={onSubmit}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-xl hover:bg-green-700 flex items-center gap-2 transform hover:scale-105 transition"
                    >
                        <Save size={20} /> Confirmer et Envoyer
                    </button>
                </div>
            </div>
        </div>
    );
};