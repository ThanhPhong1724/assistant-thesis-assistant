const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
    token?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { token, ...fetchOptions } = options;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Auth
    async register(data: { email: string; password: string; fullName: string }) {
        return this.request<{ accessToken: string; user: any }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async login(data: { email: string; password: string }) {
        return this.request<{ accessToken: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getMe(token: string) {
        return this.request<any>('/auth/me', { token });
    }

    // Organization
    async getSchools() {
        return this.request<any[]>('/schools');
    }

    async getFaculties(schoolId?: number) {
        const query = schoolId ? `?schoolId=${schoolId}` : '';
        return this.request<any[]>(`/faculties${query}`);
    }

    async getProgramTypes() {
        return this.request<any[]>('/program-types');
    }

    // Format Profiles
    async getProfiles(filters?: { schoolId?: number }) {
        const query = filters?.schoolId ? `?schoolId=${filters.schoolId}` : '';
        return this.request<any[]>(`/format-profiles${query}`);
    }

    async getProfile(id: number) {
        return this.request<any>(`/format-profiles/${id}`);
    }

    // Documents
    async getDocuments(token: string) {
        return this.request<any[]>('/documents', { token });
    }

    async getDocument(id: number, token: string) {
        return this.request<any>(`/documents/${id}`, { token });
    }

    async createDocument(data: any, token: string) {
        return this.request<any>('/documents', {
            method: 'POST',
            body: JSON.stringify(data),
            token,
        });
    }

    async updateDocument(id: number, data: any, token: string) {
        return this.request<any>(`/documents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            token,
        });
    }

    async deleteDocument(id: number, token: string) {
        return this.request<any>(`/documents/${id}`, {
            method: 'DELETE',
            token,
        });
    }

    // Nodes
    async getNodes(documentId: number, token: string, scope?: 'full' | 'outline') {
        const query = scope ? `?scope=${scope}` : '';
        return this.request<any[]>(`/documents/${documentId}/nodes${query}`, { token });
    }

    async createNode(documentId: number, data: any, token: string) {
        return this.request<any>(`/documents/${documentId}/nodes`, {
            method: 'POST',
            body: JSON.stringify(data),
            token,
        });
    }

    async updateNode(documentId: number, nodeId: number, data: any, token: string) {
        return this.request<any>(`/documents/${documentId}/nodes/${nodeId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            token,
        });
    }

    async deleteNode(documentId: number, nodeId: number, token: string) {
        return this.request<any>(`/documents/${documentId}/nodes/${nodeId}`, {
            method: 'DELETE',
            token,
        });
    }

    // Export
    async exportWord(documentId: number, token: string) {
        const response = await fetch(`${this.baseUrl}/api/documents/${documentId}/export/word`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    }
}

export const api = new ApiClient(API_URL);
