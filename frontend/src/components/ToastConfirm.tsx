import React from 'react';
import toast, {type Toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

interface ToastConfirmProps {
    t: Toast; // L'objet toast pour pouvoir le fermer
    message?: string;
    onConfirm: () => void;
}

export const ToastConfirm: React.FC<ToastConfirmProps> = ({ t, message = "Êtes-vous sûr ?", onConfirm }) => {
    return (
        <div className="flex flex-col gap-3 min-w-[280px]">
            {/* En-tête avec Icone */}
            <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                    <Trash2 size={20} />
                </div>
                <div>
                    <p className="font-bold text-gray-800">Confirmation</p>
                    <p className="text-sm text-gray-500">{message}</p>
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2 justify-end mt-2">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                    Annuler
                </button>
                <button
                    onClick={() => {
                        toast.dismiss(t.id);
                        onConfirm();
                    }}
                    className="px-4 py-1.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition"
                >
                    Supprimer
                </button>
            </div>
        </div>
    );
};