import { api } from './api';
import { Incident } from '../types';

interface ClassificationResult {
    type: string;
    code: string;
    priority: string;
    confidence: number;
}

interface TranscriptionResult {
    transcript: string;
    confidence: number;
}

// Speech-to-text
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    return api.upload<TranscriptionResult>('/api/stt', formData);
}

// Classify incident from transcription
export async function classifyIncident(transcription: string): Promise<ClassificationResult> {
    return api.post<ClassificationResult>('/api/classify', { transcription });
}

// Get all incidents
export async function getAllIncidents(): Promise<Incident[]> {
    const response = await api.get<{ incidents: Incident[] }>('/api/incidents');
    return response.incidents;
}

// Create new incident
export async function createIncident(incident: Incident): Promise<Incident> {
    const response = await api.post<{ success: boolean; incident: Incident }>('/api/incidents', { incident });
    return response.incident;
}

// Update incident status
export async function updateIncidentStatus(
    id: string,
    status: 'pending' | 'verified' | 'synced'
): Promise<Incident> {
    const response = await api.patch<{ success: boolean; incident: Incident }>(
        `/api/incidents/${id}/status`,
        { status }
    );
    return response.incident;
}

// Delete incident
export async function deleteIncident(id: string): Promise<void> {
    await api.delete(`/api/incidents/${id}`);
}
