import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface AiMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface AiResponse {
    content: string;
    provider: string;
    model: string;
    tokensUsed?: number;
}

interface AiProvider {
    name: string;
    available: boolean;
    generate: (messages: AiMessage[], options?: AiOptions) => Promise<AiResponse>;
}

interface AiOptions {
    maxTokens?: number;
    temperature?: number;
    provider?: string;
}

@Injectable()
export class AiService {
    private providers: Map<string, AiProvider> = new Map();

    constructor(private readonly configService: ConfigService) {
        this.initializeProviders();
    }

    private initializeProviders() {
        // Groq (Free tier available)
        const groqKey = this.configService.get<string>('GROQ_API_KEY');
        if (groqKey) {
            this.providers.set('groq', {
                name: 'Groq',
                available: true,
                generate: async (messages, options) => this.callGroq(messages, groqKey, options),
            });
        }

        // Gemini (Free tier available)
        const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (geminiKey) {
            this.providers.set('gemini', {
                name: 'Google Gemini',
                available: true,
                generate: async (messages, options) => this.callGemini(messages, geminiKey, options),
            });
        }

        // OpenRouter (multiple models)
        const openRouterKey = this.configService.get<string>('OPENROUTER_API_KEY');
        if (openRouterKey) {
            this.providers.set('openrouter', {
                name: 'OpenRouter',
                available: true,
                generate: async (messages, options) => this.callOpenRouter(messages, openRouterKey, options),
            });
        }

        // Ollama (Local)
        const ollamaUrl = this.configService.get<string>('OLLAMA_BASE_URL');
        if (ollamaUrl) {
            this.providers.set('ollama', {
                name: 'Ollama (Local)',
                available: true,
                generate: async (messages, options) => this.callOllama(messages, ollamaUrl, options),
            });
        }

        // OpenAI (Paid)
        const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (openaiKey) {
            this.providers.set('openai', {
                name: 'OpenAI',
                available: true,
                generate: async (messages, options) => this.callOpenAI(messages, openaiKey, options),
            });
        }
    }

    getAvailableProviders(): string[] {
        return Array.from(this.providers.entries())
            .filter(([, p]) => p.available)
            .map(([name]) => name);
    }

    async generate(messages: AiMessage[], options?: AiOptions): Promise<AiResponse> {
        // Priority order: groq > gemini > ollama > openrouter > openai
        const priority = ['groq', 'gemini', 'ollama', 'openrouter', 'openai'];

        let providerName = options?.provider;
        if (!providerName) {
            for (const name of priority) {
                if (this.providers.has(name) && this.providers.get(name)!.available) {
                    providerName = name;
                    break;
                }
            }
        }

        if (!providerName || !this.providers.has(providerName)) {
            throw new Error('No AI provider available. Please configure at least one AI provider.');
        }

        const provider = this.providers.get(providerName)!;
        return provider.generate(messages, options);
    }

    // Suggest outline for a thesis topic
    async suggestOutline(topic: string, programType: string): Promise<string> {
        const messages: AiMessage[] = [
            {
                role: 'system',
                content: `Bạn là chuyên gia hỗ trợ sinh viên Việt Nam viết đồ án/luận văn. 
Hãy gợi ý cấu trúc đề cương (các chương và mục) phù hợp với đề tài.
Trả lời bằng tiếng Việt, format markdown với heading và bullet points.`,
            },
            {
                role: 'user',
                content: `Đề tài: ${topic}\nLoại tài liệu: ${programType}\n\nHãy gợi ý cấu trúc đề cương phù hợp.`,
            },
        ];

        const response = await this.generate(messages, { temperature: 0.7 });
        return response.content;
    }

    // Suggest content for a section
    async suggestContent(sectionTitle: string, context: string): Promise<string> {
        const messages: AiMessage[] = [
            {
                role: 'system',
                content: `Bạn là trợ lý viết đồ án/luận văn cho sinh viên Việt Nam.
Hãy viết nội dung cho phần được yêu cầu với văn phong học thuật, chính xác.
Trả lời bằng tiếng Việt.`,
            },
            {
                role: 'user',
                content: `Tiêu đề mục: ${sectionTitle}\n\nBối cảnh: ${context}\n\nHãy viết nội dung cho mục này.`,
            },
        ];

        const response = await this.generate(messages, { temperature: 0.6 });
        return response.content;
    }

    // Rewrite content with academic style
    async rewriteAcademic(content: string): Promise<string> {
        const messages: AiMessage[] = [
            {
                role: 'system',
                content: `Bạn là chuyên gia chỉnh sửa văn bản học thuật tiếng Việt.
Hãy viết lại đoạn văn với văn phong học thuật chuyên nghiệp, rõ ràng, mạch lạc.
Giữ nguyên ý nghĩa nhưng cải thiện cách diễn đạt.`,
            },
            {
                role: 'user',
                content: `Hãy viết lại đoạn văn sau với văn phong học thuật:\n\n${content}`,
            },
        ];

        const response = await this.generate(messages, { temperature: 0.4 });
        return response.content;
    }

    // Call Groq API
    private async callGroq(messages: AiMessage[], apiKey: string, options?: AiOptions): Promise<AiResponse> {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-70b-versatile',
                messages,
                max_tokens: options?.maxTokens || 2000,
                temperature: options?.temperature || 0.7,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Groq API error');
        }

        return {
            content: data.choices[0].message.content,
            provider: 'groq',
            model: 'llama-3.1-70b-versatile',
            tokensUsed: data.usage?.total_tokens,
        };
    }

    // Call Gemini API
    private async callGemini(messages: AiMessage[], apiKey: string, options?: AiOptions): Promise<AiResponse> {
        const content = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: content }] }],
                    generationConfig: {
                        maxOutputTokens: options?.maxTokens || 2000,
                        temperature: options?.temperature || 0.7,
                    },
                }),
            }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Gemini API error');
        }

        return {
            content: data.candidates[0].content.parts[0].text,
            provider: 'gemini',
            model: 'gemini-1.5-flash',
        };
    }

    // Call OpenRouter API
    private async callOpenRouter(messages: AiMessage[], apiKey: string, options?: AiOptions): Promise<AiResponse> {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://thesis-assistant.local',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.1-8b-instruct:free',
                messages,
                max_tokens: options?.maxTokens || 2000,
                temperature: options?.temperature || 0.7,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'OpenRouter API error');
        }

        return {
            content: data.choices[0].message.content,
            provider: 'openrouter',
            model: 'llama-3.1-8b-instruct',
            tokensUsed: data.usage?.total_tokens,
        };
    }

    // Call Ollama (Local)
    private async callOllama(messages: AiMessage[], baseUrl: string, options?: AiOptions): Promise<AiResponse> {
        const response = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                messages,
                stream: false,
                options: {
                    temperature: options?.temperature || 0.7,
                },
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Ollama API error');
        }

        return {
            content: data.message.content,
            provider: 'ollama',
            model: data.model || 'llama3',
        };
    }

    // Call OpenAI API
    private async callOpenAI(messages: AiMessage[], apiKey: string, options?: AiOptions): Promise<AiResponse> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages,
                max_tokens: options?.maxTokens || 2000,
                temperature: options?.temperature || 0.7,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'OpenAI API error');
        }

        return {
            content: data.choices[0].message.content,
            provider: 'openai',
            model: 'gpt-4o-mini',
            tokensUsed: data.usage?.total_tokens,
        };
    }
}
