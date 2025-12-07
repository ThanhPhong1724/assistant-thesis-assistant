import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNodeDto, UpdateNodeDto, BulkUpdateNodesDto } from './dto/nodes.dto';

@Injectable()
export class NodesService {
    constructor(private readonly prisma: PrismaService) { }

    // Verify document ownership
    private async verifyDocumentOwnership(documentId: number, userId: number) {
        const document = await this.prisma.document.findFirst({
            where: { id: documentId, userId, deletedAt: null },
        });
        if (!document) {
            throw new NotFoundException('Document not found');
        }
        return document;
    }

    // Get all nodes for a document as tree
    async getTree(documentId: number, userId: number) {
        await this.verifyDocumentOwnership(documentId, userId);

        const nodes = await this.prisma.docNode.findMany({
            where: { documentId },
            orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
        });

        // Build tree structure
        return this.buildTree(nodes);
    }

    // Get outline nodes only (chapters and sections)
    async getOutline(documentId: number, userId: number) {
        await this.verifyDocumentOwnership(documentId, userId);

        const nodes = await this.prisma.docNode.findMany({
            where: {
                documentId,
                nodeType: { in: ['DOCUMENT_ROOT', 'SECTION_GROUP', 'CHAPTER', 'SECTION'] },
            },
            orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
        });

        return this.buildTree(nodes);
    }

    // Get children of a specific node
    async getChildren(documentId: number, nodeId: number, userId: number) {
        await this.verifyDocumentOwnership(documentId, userId);

        return this.prisma.docNode.findMany({
            where: { documentId, parentId: nodeId },
            orderBy: { position: 'asc' },
        });
    }

    // Create a new node
    async create(documentId: number, userId: number, dto: CreateNodeDto) {
        await this.verifyDocumentOwnership(documentId, userId);

        return this.prisma.docNode.create({
            data: {
                documentId,
                parentId: dto.parentId,
                position: dto.position,
                nodeType: dto.nodeType as 'CHAPTER' | 'SECTION' | 'PARAGRAPH' | 'LIST' | 'LIST_ITEM' | 'TABLE' | 'FIGURE' | 'EQUATION' | 'REFERENCE_LIST' | 'REFERENCE_ITEM' | 'DOCUMENT_ROOT' | 'SECTION_GROUP' | 'GENERATED_BLOCK' | 'COVER_PAGE',
                sectionGroupType: dto.sectionGroupType as 'FRONT' | 'MAIN' | 'BACK' | undefined,
                level: dto.level,
                semanticRole: dto.semanticRole,
                contentPlain: dto.contentPlain,
                dataJson: dto.dataJson as object | undefined,
                origin: 'USER',
            },
        });
    }

    // Update a node
    async update(documentId: number, nodeId: number, userId: number, dto: UpdateNodeDto) {
        await this.verifyDocumentOwnership(documentId, userId);

        const node = await this.prisma.docNode.findFirst({
            where: { id: nodeId, documentId },
        });
        if (!node) {
            throw new NotFoundException('Node not found');
        }

        return this.prisma.docNode.update({
            where: { id: nodeId },
            data: {
                position: dto.position,
                contentPlain: dto.contentPlain,
                inlineJson: dto.inlineJson as object | undefined,
                dataJson: dto.dataJson as object | undefined,
                semanticRole: dto.semanticRole,
                styleKeyOverride: dto.styleKeyOverride,
            },
        });
    }

    // Delete a node and its children
    async delete(documentId: number, nodeId: number, userId: number) {
        await this.verifyDocumentOwnership(documentId, userId);

        const node = await this.prisma.docNode.findFirst({
            where: { id: nodeId, documentId },
        });
        if (!node) {
            throw new NotFoundException('Node not found');
        }

        // Delete node and all descendants (cascade is set in schema)
        await this.prisma.docNode.delete({ where: { id: nodeId } });

        return { deleted: true };
    }

    // Bulk update nodes (for drag & drop reordering)
    async bulkUpdate(documentId: number, userId: number, dto: BulkUpdateNodesDto) {
        await this.verifyDocumentOwnership(documentId, userId);

        const updates = dto.nodes.map((node) =>
            this.prisma.docNode.update({
                where: { id: node.id },
                data: {
                    parentId: node.parentId,
                    position: node.position,
                    contentPlain: node.contentPlain,
                    level: node.level,
                },
            }),
        );

        await this.prisma.$transaction(updates);

        return { updated: dto.nodes.length };
    }

    // Build tree from flat list
    private buildTree(nodes: unknown[]) {
        const nodeMap = new Map<number, { id: number; parentId: number | null; children: unknown[] }>();
        const roots: unknown[] = [];

        // First pass: create map
        (nodes as { id: number; parentId: number | null }[]).forEach((node) => {
            nodeMap.set(node.id, { ...node, children: [] });
        });

        // Second pass: build tree
        (nodes as { id: number; parentId: number | null }[]).forEach((node) => {
            const nodeWithChildren = nodeMap.get(node.id);
            if (node.parentId && nodeMap.has(node.parentId)) {
                nodeMap.get(node.parentId)!.children.push(nodeWithChildren);
            } else if (!node.parentId) {
                roots.push(nodeWithChildren);
            }
        });

        return roots;
    }
}
