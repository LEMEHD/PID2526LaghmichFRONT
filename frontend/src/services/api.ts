import axios from 'axios';
import type {
    Section,
    UEDto,
    UEFullDto, // <--- AJOUTÉ ICI (C'était l'erreur)
    ExemptionRequestDto,
    ExemptionRequestFullDto,
    ExternalCourseDto,
    SupportingDocumentDto
} from '../types';

// Instance Axios de base
export const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
});

// ————— SECTIONS & UEs —————

export const getSections = async (): Promise<Section[]> => {
    // SectionControllerRest: @GetMapping("liste")
    const response = await api.get<Section[]>('/sections/liste');
    return response.data;
};

export const getUEs = async (): Promise<UEDto[]> => {
    // UEControllerRest: @GetMapping("liste")
    const response = await api.get<UEDto[]>('/ue/liste');
    return response.data;
};

export const getUEDetail = async (code: string): Promise<UEFullDto> => {
    // UEControllerRest: @GetMapping("/detail/{code}")
    const response = await api.get<UEFullDto>(`/ue/detail/${code}`);
    return response.data;
};

// ————— DEMANDES (CRUD) —————

export const getStudentRequests = async (email: string): Promise<ExemptionRequestDto[]> => {
    // ExemptionControllerRest: @GetMapping("/my-requests")
    const response = await api.get<ExemptionRequestDto[]>(`/exemptions/my-requests?email=${email}`);
    return response.data;
};

export const createExemptionRequest = async (email: string, sectionCode: string): Promise<ExemptionRequestDto> => {
    // ExemptionControllerRest: @PostMapping("/create")
    const response = await api.post<ExemptionRequestDto>('/exemptions/create', { email, sectionCode });
    return response.data;
};

export const getExemptionRequest = async (id: string): Promise<ExemptionRequestFullDto> => {
    // ExemptionControllerRest: @GetMapping("/{reqId}")
    const response = await api.get<ExemptionRequestFullDto>(`/exemptions/${id}`);
    return response.data;
};

export const deleteRequest = async (requestId: string): Promise<void> => {
    // ExemptionControllerRest: @DeleteMapping("/{reqId}")
    await api.delete(`/exemptions/${requestId}`);
};

// ————— ÉTAPE 2 : REMPLISSAGE (COURS & DOCS) —————

export const addExternalCourse = async (reqId: string, data: { etablissement: string; code: string; libelle: string; ects: number }): Promise<ExternalCourseDto> => {
    // ExemptionControllerRest: @PostMapping("/{reqId}/add-course")
    const response = await api.post<ExternalCourseDto>(`/exemptions/${reqId}/add-course`, data);
    return response.data;
};

export const addCourseDocument = async (courseId: string, urlStockage: string, originalFileName: string) => {
    const response = await api.post<SupportingDocumentDto>(`/exemptions/course/${courseId}/add-document`, {
        urlStockage,
        originalFileName // <--- Ajout
    });
    return response.data;
};

export const addGlobalDocument = async (reqId: string, urlStockage: string, type: string, originalFileName: string) => {
    const response = await api.post<SupportingDocumentDto>(`/exemptions/${reqId}/add-document`, {
        urlStockage,
        type,
        originalFileName // <--- Ajout
    });
    return response.data;
};

// fonction d'upload physique
export const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Backend: StorageControllerRest -> @PostMapping("/upload")
    const response = await api.post<{ url: string }>('/storage/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data', // Indispensable pour l'upload
        },
    });
    return response.data.url;
};

export const deleteDocument = async (docId: string) => {
    await api.delete(`/exemptions/document/${docId}`);
};

// ————— ÉTAPE 3 : ANALYSE & ITEMS —————

export const analyzeRequest = async (reqId: string): Promise<ExemptionRequestFullDto> => {
    // ExemptionControllerRest: @PostMapping("/{reqId}/analyze")
    const response = await api.post<ExemptionRequestFullDto>(`/exemptions/${reqId}/analyze`);
    return response.data;
};

export const addManualItem = async (reqId: string, ueCode: string, externalCourseIds: string[]): Promise<ExemptionRequestFullDto> => {
    // ExemptionControllerRest: @PostMapping("/{reqId}/add-manual-item")
    const response = await api.post<ExemptionRequestFullDto>(`/exemptions/${reqId}/add-manual-item`, {
        ueCode,
        externalCourseIds
    });
    return response.data;
};

// ————— ÉTAPE 4 : SOUMISSION —————

export const submitRequest = async (reqId: string): Promise<ExemptionRequestFullDto> => {
    // ExemptionControllerRest: @PostMapping("/{reqId}/submit")
    const response = await api.post<ExemptionRequestFullDto>(`/exemptions/${reqId}/submit`);
    return response.data;
};