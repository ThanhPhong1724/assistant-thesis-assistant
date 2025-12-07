import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
    user: { id: number; email: string; fullName: string; role: string };
}

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Get('providers')
    @ApiOperation({ summary: 'Get available AI providers' })
    getProviders() {
        return {
            providers: this.aiService.getAvailableProviders(),
        };
    }

    @Post('suggest-outline')
    @ApiOperation({ summary: 'Suggest outline for a thesis topic' })
    async suggestOutline(
        @Body() body: { topic: string; programType: string },
        @Request() req: AuthenticatedRequest,
    ) {
        const content = await this.aiService.suggestOutline(body.topic, body.programType);
        return { content };
    }

    @Post('suggest-content')
    @ApiOperation({ summary: 'Suggest content for a section' })
    async suggestContent(
        @Body() body: { sectionTitle: string; context: string },
        @Request() req: AuthenticatedRequest,
    ) {
        const content = await this.aiService.suggestContent(body.sectionTitle, body.context);
        return { content };
    }

    @Post('rewrite-academic')
    @ApiOperation({ summary: 'Rewrite content with academic style' })
    async rewriteAcademic(
        @Body() body: { content: string },
        @Request() req: AuthenticatedRequest,
    ) {
        const result = await this.aiService.rewriteAcademic(body.content);
        return { content: result };
    }

    @Post('generate')
    @ApiOperation({ summary: 'Generate AI response with custom prompt' })
    async generate(
        @Body() body: { messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>; provider?: string },
        @Request() req: AuthenticatedRequest,
    ) {
        const response = await this.aiService.generate(body.messages, { provider: body.provider });
        return response;
    }
}
