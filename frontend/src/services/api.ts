import axios from 'axios';
import type {
    Section,
    UEDto,
    UEFullDto,
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
    const response = await api.get<Section[]>('/sections/liste');
    return response.data;
};

export const getUEs = async (): Promise<UEDto[]> => {
    const response = await api.get<UEDto[]>('/ue/liste');
    return response.data;
};

export const getUEDetail = async (code: string): Promise<UEFullDto> => {
    const response = await api.get<UEFullDto>(`/ue/detail/${code}`);
    return response.data;
};

// ————— DEMANDES (CRUD) —————

// Renommé pour correspondre au Dashboard (myRequests)
export const myRequests = async (email: string): Promise<ExemptionRequestDto[]> => {
    const response = await api.get<ExemptionRequestDto[]>(`/exemptions/my-requests?email=${email}`);
    return response.data;
};

export const createExemptionRequest = async (email: string, sectionCode: string): Promise<ExemptionRequestDto> => {
    const response = await api.post<ExemptionRequestDto>('/exemptions/create', { email, sectionCode });
    return response.data;
};

export const getExemptionRequest = async (id: string): Promise<ExemptionRequestFullDto> => {
    const response = await api.get<ExemptionRequestFullDto>(`/exemptions/${id}`);
    return response.data;
};

// Suppression complète d'un brouillon (Utilisé dans Dashboard)
export const deleteDraft = async (requestId: string): Promise<void> => {
    await api.delete(`/exemptions/${requestId}`);
};

// ————— ÉTAPE 2 : REMPLISSAGE (COURS & DOCS) —————

export const addExternalCourse = async (reqId: string, data: { etablissement: string; code: string; libelle: string; ects: number }): Promise<ExternalCourseDto> => {
    const response = await api.post<ExternalCourseDto>(`/exemptions/${reqId}/add-course`, data);
    return response.data;
};

export const addCourseDocument = async (courseId: string, urlStockage: string, originalFileName: string) => {
    const response = await api.post<SupportingDocumentDto>(`/exemptions/course/${courseId}/add-document`, {
        urlStockage,
        originalFileName
    });
    return response.data;
};

export const addGlobalDocument = async (reqId: string, urlStockage: string, type: string, originalFileName: string) => {
    const response = await api.post<SupportingDocumentDto>(`/exemptions/${reqId}/add-document`, {
        urlStockage,
        type,
        originalFileName
    });
    return response.data;
};

// fonction d'upload physique
export const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ url: string }>('/storage/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.url;
};

export const deleteDocument = async (docId: string) => {
    await api.delete(`/exemptions/document/${docId}`);
};

// ————— ÉTAPE 3 : ANALYSE & ITEMS —————

export const analyzeRequest = async (reqId: string): Promise<ExemptionRequestFullDto> => {
    const response = await api.post<ExemptionRequestFullDto>(`/exemptions/${reqId}/analyze`);
    return response.data;
};

export const addManualItem = async (reqId: string, ueCode: string, externalCourseIds: string[]): Promise<ExemptionRequestFullDto> => {
    const response = await api.post<ExemptionRequestFullDto>(`/exemptions/${reqId}/add-manual-item`, {
        ueCode,
        externalCourseIds
    });
    return response.data;
};

// Suppression d'une ligne d'item spécifique (Utilisé dans RequestDetail)
export const deleteItem = async (itemId: string): Promise<ExemptionRequestFullDto> => {
    const response = await api.delete<ExemptionRequestFullDto>(`/exemptions/item/${itemId}`);
    return response.data;
};

// ————— ÉTAPE 4 : SOUMISSION —————

export const submitRequest = async (reqId: string): Promise<ExemptionRequestFullDto> => {
    const response = await api.post<ExemptionRequestFullDto>(`/exemptions/${reqId}/submit`);
    return response.data;
};