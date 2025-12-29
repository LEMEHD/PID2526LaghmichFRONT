import { Check } from 'lucide-react';

interface ProgressBarProps {
    currentStep: number; // 1, 2, 3 ou 4
}

const STEPS = [
    { num: 1, label: "Création" },
    { num: 2, label: "Mes Cours" },
    { num: 3, label: "Correspondances" },
    { num: 4, label: "Envoi" }
];

export const ProgressBar = ({ currentStep }: ProgressBarProps) => {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* La ligne grise de fond */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />

                {/* La ligne bleue de progression */}
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 -z-10 transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step) => {
                    const isCompleted = step.num < currentStep;
                    const isCurrent = step.num === currentStep;

                    return (
                        <div key={step.num} className="flex flex-col items-center bg-gray-50 px-2 z-10">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' :
                                    isCurrent ? 'bg-white border-blue-600 text-blue-600 shadow-lg scale-110' :
                                        'bg-white border-gray-300 text-gray-400'}
                                `}
                            >
                                {isCompleted ? <Check size={20} /> : <span className="font-bold">{step.num}</span>}
                            </div>
                            <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};