import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/documents.dto';

@Injectable()
export class DocumentsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAllByUser(userId: number) {
        return this.prisma.document.findMany({
            where: { userId, deletedAt: null },
            include: {
                school: { select: { name: true } },
                faculty: { select: { name: true } },
                programType: { select: { name: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findById(id: number, userId: number) {
        const document = await this.prisma.document.findFirst({
            where: { id, userId, deletedAt: null },
            include: {
                school: true,
                faculty: true,
                programType: true,
                formatProfile: true,
            },
        });
        if (!document) {
            throw new NotFoundException('Document not found');
        }
        return document;
    }

    async create(userId: number, dto: CreateDocumentDto) {
        // Create document with initial structure
        const document = await this.prisma.document.create({
            data: {
                userId,
                title: dto.title,
                topicDescription: dto.topicDescription,
                schoolId: dto.schoolId,
                facultyId: dto.facultyId,
                programTypeId: dto.programTypeId,
                formatProfileId: dto.formatProfileId,
                year: dto.year,
            },
        });

        // Create initial document structure
        const documentRoot = await this.prisma.docNode.create({
            data: {
                documentId: document.id,
                position: 0,
                nodeType: 'DOCUMENT_ROOT',
            },
        });

        // Create front, main, back section groups
        await this.prisma.docNode.createMany({
            data: [
                {
                    documentId: document.id,
                    parentId: documentRoot.id,
                    position: 0,
                    nodeType: 'SECTION_GROUP',
                    sectionGroupType: 'FRONT',
                },
                {
                    documentId: document.id,
                    parentId: documentRoot.id,
                    position: 1,
                    nodeType: 'SECTION_GROUP',
                    sectionGroupType: 'MAIN',
                },
                {
                    documentId: document.id,
                    parentId: documentRoot.id,
                    position: 2,
                    nodeType: 'SECTION_GROUP',
                    sectionGroupType: 'BACK',
                },
            ],
        });

        return document;
    }

    async update(id: number, userId: number, dto: UpdateDocumentDto) {
        await this.findById(id, userId); // Verify ownership
        return this.prisma.document.update({
            where: { id },
            data: dto,
        });
    }

    async delete(id: number, userId: number) {
        await this.findById(id, userId); // Verify ownership
        return this.prisma.document.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async lockOutline(id: number, userId: number) {
        await this.findById(id, userId); // Verify ownership
        return this.prisma.document.update({
            where: { id },
            data: { outlineLocked: true, status: 'OUTLINE_LOCKED' },
        });
    }

    async unlockOutline(id: number, userId: number) {
        await this.findById(id, userId);
        return this.prisma.document.update({
            where: { id },
            data: { outlineLocked: false, status: 'DRAFT' },
        });
    }
}
