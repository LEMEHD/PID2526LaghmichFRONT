// --- ENUMS ---
export type StatutDemande = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'PARTIALLY_ACCEPTED' | 'ACCEPTED' | 'REJECTED';
export type DecisionItem = 'PENDING' | 'AUTO_ACCEPTED' | 'NEEDS_REVIEW' | 'ACCEPTED' | 'REJECTED';

// --- SECTIONS ---
export interface Section {
    code: string;
    nom: string; // Correction : c'est bien "nom", pas "name"
}

// --- UE (CATALOGUE) ---
export interface AcquisDto {
    num: number;
    acquis: string;
    pourcentage: number;
}

export interface UEDto {
    code: string;
    ref: string;
    nom: string;
    nbPeriodes: number;
    ects: number;
    prgm: string;
}

export interface UEFullDto extends UEDto {
    acquis: AcquisDto[];
}

// --- ETUDIANT ---
export interface StudentDto {
    id: number;
    email: string;
    prenom: string;
    nom: string;
}

// --- DOSSIER ---
export interface ExemptionRequestDto {
    id: string; // UUID = string
    etudiant?: StudentDto;
    sectionCode: string;
    sectionNom: string;
    statut: StatutDemande;
    createdAt?: string;
    updatedAt?: string;
}

// --- DOCUMENTS ---
export interface SupportingDocumentDto {
    id: string;
    type: string;
    urlStockage: string;
    originalFileName?: string; // <--- AJOUTÉ : Pour l'affichage du nom
}

// --- COURS EXTERNES ---
export interface ExternalCourseDto {
    id: string;
    etablissement: string;
    code: string;
    libelle: string;
    ects: number;
    urlProgramme?: string;
    hasDocAttached?: boolean;
    programmes?: SupportingDocumentDto[]; // <--- AJOUTÉ : Pour la liste des preuves
}

// --- ITEM (LIGNE DE DISPENSE) ---
export interface ExemptionItemDto {
    id: string;
    ue: UEDto;
    decision: DecisionItem;
    noteAccordee?: number;
    totalEctsMatches: boolean;
    justifyingCourses?: ExternalCourseDto[];
}

// --- DETAIL COMPLET ---
export interface ExemptionRequestFullDto extends ExemptionRequestDto {
    externalCourses: ExternalCourseDto[];
    documents: SupportingDocumentDto[];
    items: ExemptionItemDto[];
}