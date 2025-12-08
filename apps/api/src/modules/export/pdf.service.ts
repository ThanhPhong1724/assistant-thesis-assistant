import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';
import { ExportService } from '../export/export.service';

@Injectable()
export class PdfService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly profilesService: ProfilesService,
        private readonly exportService: ExportService,
    ) { }

    async exportToPdf(documentId: number, userId: number): Promise<Buffer> {
        // First export to Word
        const wordBuffer = await this.exportService.exportToWord(documentId, userId);

        // In a production environment, you would use a service like:
        // - LibreOffice headless (libreoffice --headless --convert-to pdf)
        // - Gotenberg (Docker container for document conversion)
        // - CloudConvert API
        // - Aspose.Words

        // For this implementation, we'll provide a placeholder that returns
        // instructions for implementing PDF conversion

        // TODO: Implement actual PDF conversion
        // Example using Gotenberg:
        // const response = await fetch('http://gotenberg:3000/forms/libreoffice/convert', {
        //   method: 'POST',
        //   body: formData with word file
        // });
        // return response.buffer();

        throw new Error(
            'PDF export requires additional setup. Please configure one of: ' +
            'LibreOffice headless, Gotenberg, or CloudConvert API. ' +
            'For now, please export to Word first, then convert using Microsoft Word or LibreOffice.',
        );
    }

    // Alternative: Generate PDF directly using a library like pdfkit or puppeteer
    async exportToPdfDirect(documentId: number, userId: number): Promise<Buffer> {
        const doc = await this.prisma.document.findFirst({
            where: { id: documentId, userId, deletedAt: null },
            include: {
                school: true,
                faculty: true,
                formatProfile: true,
            },
        });

        if (!doc) {
            throw new NotFoundException('Document not found');
        }

        const nodes = await this.prisma.docNode.findMany({
            where: { documentId },
            orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
        });

        const config = await this.profilesService.getResolvedConfig(doc.formatProfileId);

        // TODO: Implement PDF generation using pdfkit or puppeteer
        // This would involve:
        // 1. Creating a PDF document
        // 2. Applying page settings from config
        // 3. Rendering nodes with proper formatting
        // 4. Adding headers/footers
        // 5. Generating table of contents
        // 6. Returning the PDF buffer

        throw new Error('Direct PDF generation not yet implemented. Use Word export instead.');
    }
}
