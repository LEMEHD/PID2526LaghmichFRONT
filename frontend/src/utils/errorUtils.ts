import { AxiosError } from 'axios';

/**
 * Extrait un message d'erreur lisible depuis une erreur Axios (Backend Spring Boot).
 * @param error L'objet erreur attrapé dans le catch
 * @param defaultMessage Message de repli si le backend ne renvoie rien de clair
 */
export const getErrorMessage = (error: unknown, defaultMessage: string = "Une erreur est survenue"): string => {
    if (error instanceof AxiosError && error.response) {
        const data = error.response.data;

        // Cas 1 : Le backend renvoie une simple String (ex: ResponseEntity.body("Message"))
        if (typeof data === 'string' && data.trim().length > 0) {
            return data;
        }

        // Cas 2 : Le backend renvoie un objet JSON standard (ex: DefaultErrorAttributes de Spring)
        // Structure souvent : { timestamp, status, error, message: "..." }
        if (typeof data === 'object' && data !== null && 'message' in data) {
            return String((data as any).message);
        }

        // Cas 3 : Erreurs de validation (@Valid) renvoyées sous forme de Map/Objet
        // Structure : { "email": "L'email est invalide", "code": "Code requis" }
        if (typeof data === 'object' && data !== null) {
            // On prend la première erreur disponible pour l'afficher
            const values = Object.values(data);
            if (values.length > 0 && typeof values[0] === 'string') {
                return values[0] as string;
            }
        }
    }

    // Cas 4 : Pas de réponse (Serveur éteint, problème réseau)
    if (error instanceof AxiosError && !error.response) {
        return "Impossible de contacter le serveur. Vérifiez votre connexion.";
    }

    return defaultMessage;
};