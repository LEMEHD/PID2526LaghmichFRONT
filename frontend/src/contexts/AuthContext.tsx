import { createContext, useContext, useState, type ReactNode } from 'react';

// On ajoute l'email qui servira de clé d'identification pour le backend
const MOCK_STUDENT = {
    id: 1,
    prenom: "Jean",
    nom: "Dupont",
    email: "jean.dupont@student.isfce.org" // <--- Indispensable pour votre backend
};

const AuthContext = createContext({ user: MOCK_STUDENT });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user] = useState(MOCK_STUDENT);
    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);