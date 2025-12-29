import React from 'react';
import type { ExemptionRequestFullDto } from '../../types';
import { Clock, CheckCircle, Search, FileCheck, ArrowRight, XCircle } from 'lucide-react';

interface StepTrackingProps {
    request: ExemptionRequestFullDto;
}

export const StepTracking: React.FC<StepTrackingProps> = ({ request }) => {
    return (
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
    );
};