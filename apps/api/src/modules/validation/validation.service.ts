import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';

interface ValidationIssue {
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    location?: string;
}

interface ValidationResult {
    valid: boolean;
    score: number; // 0-100
    issues: ValidationIssue[];
    summary: {
        errors: number;
        warnings: number;
        infos: number;
    };
}

@Injectable()
export class ValidationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly profilesService: ProfilesService,
    ) { }

    async validateDocument(documentId: number, userId: number): Promise<ValidationResult> {
        // Get document with profile
        const doc = await this.prisma.document.findFirst({
            where: { id: documentId, userId, deletedAt: null },
            include: { formatProfile: true },
        });

        if (!doc) {
            throw new Error('Document not found');
        }

        // Get nodes
        const nodes = await this.prisma.docNode.findMany({
            where: { documentId },
            orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
        });

        // Get resolved config
        const config = await this.profilesService.getResolvedConfig(doc.formatProfileId);

        // Run validation checks
        const issues: ValidationIssue[] = [];

        // 1. Structure validation
        issues.push(...this.validateStructure(nodes));

        // 2. Style validation
        issues.push(...this.validateStyles(nodes, config));

        // 3. Numbering validation
        issues.push(...this.validateNumbering(nodes, config));

        // 4. Content validation
        issues.push(...this.validateContent(nodes));

        // Calculate score
        const errors = issues.filter(i => i.type === 'error').length;
        const warnings = issues.filter(i => i.type === 'warning').length;
        const infos = issues.filter(i => i.type === 'info').length;

        const score = Math.max(0, 100 - (errors * 10 + warnings * 5 + infos * 1));

        return {
            valid: errors === 0,
            score,
            issues,
            summary: { errors, warnings, infos },
        };
    }

    private validateStructure(nodes: any[]): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const tree = this.buildTree(nodes);

        // Check for document root
        const docRoot = tree.find(n => n.nodeType === 'DOCUMENT_ROOT');
        if (!docRoot) {
            issues.push({
                type: 'error',
                category: 'Structure',
                message: 'Thiếu DOCUMENT_ROOT node',
            });
            return issues;
        }

        // Check for MAIN section group
        const mainGroup = docRoot.children?.find(n => n.sectionGroupType === 'MAIN');
        if (!mainGroup) {
            issues.push({
                type: 'error',
                category: 'Structure',
                message: 'Thiếu phần MAIN (nội dung chính)',
            });
        } else {
            // Check for at least one chapter
            const chapters = mainGroup.children?.filter(n => n.nodeType === 'CHAPTER') || [];
            if (chapters.length === 0) {
                issues.push({
                    type: 'warning',
                    category: 'Structure',
                    message: 'Chưa có chương nào trong phần nội dung chính',
                });
            }

            // Check chapter numbering
            chapters.forEach((chapter, index) => {
                if (!chapter.contentPlain || !chapter.contentPlain.includes(`${index + 1}`)) {
                    issues.push({
                        type: 'warning',
                        category: 'Structure',
                        message: `Chương ${index + 1} có thể chưa được đánh số đúng`,
                        location: `Chương: ${chapter.contentPlain || 'Không có tiêu đề'}`,
                    });
                }
            });
        }

        return issues;
    }

    private validateStyles(nodes: any[], config: any): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const styles = config.styles || {};

        // Check if required styles are defined
        const requiredStyles = ['ChapterHeading', 'SectionLevel1', 'BodyText'];
        requiredStyles.forEach(styleName => {
            if (!styles[styleName]) {
                issues.push({
                    type: 'info',
                    category: 'Styles',
                    message: `Style "${styleName}" chưa được định nghĩa trong format profile`,
                });
            }
        });

        return issues;
    }

    private validateNumbering(nodes: any[], config: any): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const numbering = config.numbering || {};

        // Check chapter numbering pattern
        if (!numbering.chapter || !numbering.chapter.pattern) {
            issues.push({
                type: 'info',
                category: 'Numbering',
                message: 'Chưa định nghĩa pattern đánh số cho chương',
            });
        }

        return issues;
    }

    private validateContent(nodes: any[]): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        // Check for empty content
        const contentNodes = nodes.filter(n => ['PARAGRAPH', 'SECTION', 'CHAPTER'].includes(n.nodeType));
        const emptyNodes = contentNodes.filter(n => !n.contentPlain || n.contentPlain.trim().length === 0);

        if (emptyNodes.length > 0) {
            issues.push({
                type: 'warning',
                category: 'Content',
                message: `Có ${emptyNodes.length} mục chưa có nội dung`,
            });
        }

        // Check minimum content length for chapters
        const chapters = nodes.filter(n => n.nodeType === 'CHAPTER');
        chapters.forEach(chapter => {
            const chapterContent = this.getChapterContent(chapter, nodes);
            const wordCount = chapterContent.split(/\s+/).length;

            if (wordCount < 100) {
                issues.push({
                    type: 'info',
                    category: 'Content',
                    message: `Chương "${chapter.contentPlain}" có ít nội dung (${wordCount} từ)`,
                    location: chapter.contentPlain,
                });
            }
        });

        return issues;
    }

    private getChapterContent(chapter: any, allNodes: any[]): string {
        const descendants = this.getDescendants(chapter.id, allNodes);
        return descendants
            .filter(n => n.nodeType === 'PARAGRAPH')
            .map(n => n.contentPlain || '')
            .join(' ');
    }

    private getDescendants(parentId: number, allNodes: any[]): any[] {
        const children = allNodes.filter(n => n.parentId === parentId);
        const descendants = [...children];

        children.forEach(child => {
            descendants.push(...this.getDescendants(child.id, allNodes));
        });

        return descendants;
    }

    private buildTree(nodes: any[]) {
        const nodeMap = new Map();
        const roots: any[] = [];

        nodes.forEach((node) => {
            nodeMap.set(node.id, { ...node, children: [] });
        });

        nodes.forEach((node) => {
            const nodeWithChildren = nodeMap.get(node.id);
            if (node.parentId && nodeMap.has(node.parentId)) {
                nodeMap.get(node.parentId).children.push(nodeWithChildren);
            } else if (!node.parentId) {
                roots.push(nodeWithChildren);
            }
        });

        return roots;
    }
}
