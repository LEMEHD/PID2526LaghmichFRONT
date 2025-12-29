// Ajout de cette ligne pour ignorer l'erreur de Fast Refresh sur l'export du hook
// eslint-disable-next-line react-refresh/only-export-components
import React, { createContext, useContext, useState } from 'react';
import type { StudentDto } from '../types';
import toast from "react-hot-toast";

interface AuthContextType {
    user: StudentDto | null;
    signIn: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // CORRECTION 1 : Lazy Initialization
    // On lit le localStorage directement dans la valeur initiale du useState.
    // Cela ne s'exécute qu'une seule fois au montage, sans effet de bord.
    const [user, setUser] = useState<StudentDto | null>(() => {
        const savedUser = localStorage.getItem('mock_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const signIn = () => {
        const mockUser: StudentDto = {
            id: 99,
            email: "mehdi.laghmich@student.isfce.be",
            prenom: "Mehdi",
            nom: "Laghmich"
        };

        setUser(mockUser);
        localStorage.setItem('mock_user', JSON.stringify(mockUser));
        console.log("🔐 [Mock Auth] Connexion réussie !");

        toast.success(`Heureux de vous revoir, ${mockUser.prenom} !`);

    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('mock_user');
        console.log("🔒 [Mock Auth] Déconnexion.");

        toast("À bientôt !", { icon: '👋' });
    };

    return (
        <AuthContext.Provider value={{ user, signIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// L'erreur ESLint concernait cet export non-composant
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};