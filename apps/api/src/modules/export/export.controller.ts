import { Controller, Post, Param, UseGuards, Request, Res, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
    user: {
        id: number;
        email: string;
        fullName: string;
        role: string;
    };
}

@ApiTags('Export')
@Controller('documents/:documentId/export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    @Post('word')
    @ApiOperation({ summary: 'Export document as Word file' })
    async exportWord(
        @Param('documentId', ParseIntPipe) documentId: number,
        @Request() req: AuthenticatedRequest,
        @Res() res: Response,
    ) {
        const buffer = await this.exportService.exportToWord(documentId, req.user.id);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=document-${documentId}.docx`);
        res.send(buffer);
    }
}
