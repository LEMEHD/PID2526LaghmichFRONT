import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExemptionRequest, analyzeRequest, submitRequest, getUEs } from '../services/api';
import type { ExemptionRequestFullDto, UEDto } from '../types';
import { ProgressBar } from '../components/ProgressBar';
import { ConfirmModal } from '../components/ConfirmModal';
import { Sparkles, BrainCog } from 'lucide-react';
import toast from 'react-hot-toast';

// Sous-composants
import { StepCourses } from '../components/request/StepCourses';
import { StepAnalysis } from '../components/request/StepAnalysis';
import { StepSummary } from '../components/request/StepSummary';
import { StepTracking } from '../components/request/StepTracking';
import {getErrorMessage} from "../utils/errorUtils.ts";

export const RequestDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // --- ÉTATS GLOBAUX ---
    const [request, setRequest] = useState<ExemptionRequestFullDto | null>(null);
    const [step, setStep] = useState(2);
    const [loading, setLoading] = useState(true);
    const [ues, setUes] = useState<UEDto[]>([]);

    // États d'action
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // --- CHARGEMENT ---
    useEffect(() => {
        if (!id) return;
        getUEs().then(setUes).catch((err) => toast.error(getErrorMessage(err, "Erreur chargement du dossier")))
        loadRequest();
    }, [id]);

    // Dès que le statut change (ex: après soumission), on force l'étape 5
    useEffect(() => {
        if (request?.statut && ['SUBMITTED', 'IN_REVIEW', 'ACCEPTED', 'REJECTED'].includes(request.statut)) {
            setStep(5);
        }
    }, [request]);

    const loadRequest = () => {
        if (!id) return;
        setLoading(true);
        getExemptionRequest(id)
            .then(data => {
                setRequest(data);
                if (data.statut === 'DRAFT' && data.items && data.items.length > 0 && step < 3) {
                    setStep(3);
                }
            })
            .catch((error) => {
                console.error(error);
                navigate('/404', { replace: true });
            })
            .finally(() => setLoading(false));
    };

    // Rafraichissement silencieux (après une modif)
    const refreshData = () => {
        if (!id) return;
        getExemptionRequest(id).then(setRequest);
    };

    // --- LOGIQUE TRANSVERSE ---
    const handleAnalyze = async () => {
        if (!id || !request) return;

        const hasGlobalDoc = request.documents && request.documents.length > 0;
        const allCoursesHaveDoc = request.externalCourses.every(c => c.hasDocAttached);

        if (!hasGlobalDoc && !allCoursesHaveDoc) {
            toast.error("Manquant : Bulletin Global OU preuve pour chaque cours.");
            return;
        }

        setIsAnalyzing(true);
        try {
            await new Promise(r => setTimeout(r, 2000)); // UX Wait
            const updatedReq = await analyzeRequest(id);
            setRequest(updatedReq);
            setStep(3);
            toast.success("Analyse terminée !");
        } catch (err) {
            toast.error(getErrorMessage(err, "Le moteur d'analyse a rencontré un problème."));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirmSubmission = async () => {
        if (!id) return;
        try {
            await submitRequest(id);
            toast.success("Dossier envoyé avec succès !");
            refreshData(); // Le useEffect passera le step à 5
        } catch (err) {
            toast.error(getErrorMessage(err, "Erreur lors de l'envoi du dossier."));
        }
    };

    if (loading || !request) return <div className="p-12 text-center text-gray-500">Chargement du dossier...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 pb-24">

            {/* EN-TÊTE */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Dossier : <span className="text-blue-600">{request.sectionNom}</span>
                    </h1>
                    {step === 5 && (
                        <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-gray-500 hover:text-blue-600 transition">
                            &larr; Retour au tableau de bord
                        </button>
                    )}
                </div>
                {step < 5 && <ProgressBar currentStep={step} />}
            </div>

            {/* --- ANIMATION ANALYSE (Overlay) --- */}
            {isAnalyzing && (
                <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-all duration-500">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-75"></div>
                        <div className="relative bg-white p-4 rounded-full shadow-xl border border-indigo-100">
                            <BrainCog size={64} className="text-indigo-600 animate-pulse" />
                        </div>
                        <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-bounce" size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Analyse en cours...</h3>
                    <div className="w-64 h-2 bg-gray-200 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-indigo-600 animate-[width_1.5s_ease-in-out_infinite]" style={{ width: '0%' }}></div>
                    </div>
                </div>
            )}

            {/* --- SWITCH DES COMPOSANTS --- */}
            {step === 2 && (
                <StepCourses
                    request={request}
                    isAnalyzing={isAnalyzing}
                    onReload={refreshData}
                    onAnalyze={handleAnalyze}
                />
            )}

            {step === 3 && (
                <StepAnalysis
                    request={request}
                    ues={ues}
                    onReload={refreshData}
                    onBack={() => setStep(2)}
                    onNext={() => setStep(4)}
                />
            )}

            {step === 4 && (
                <StepSummary
                    request={request}
                    onEdit={() => setStep(3)}
                    onSubmit={() => setIsConfirmModalOpen(true)}
                />
            )}

            {step === 5 && (
                <StepTracking request={request} />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmSubmission}
                title="Validation définitive"
                message="Êtes-vous sûr de vouloir soumettre votre dossier ? Une fois envoyé, vous ne pourrez plus le modifier."
            />
        </div>
    );
};