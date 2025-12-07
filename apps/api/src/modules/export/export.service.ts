import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProfilesService } from '../profiles/profiles.service';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    PageOrientation,
    convertMillimetersToTwip,
    Footer,
    PageNumber,
} from 'docx';

@Injectable()
export class ExportService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly profilesService: ProfilesService,
    ) { }

    async exportToWord(documentId: number, userId: number): Promise<Buffer> {
        // Get document with all data
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

        // Get all nodes
        const nodes = await this.prisma.docNode.findMany({
            where: { documentId },
            orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
        });

        // Get resolved format profile config
        const config = await this.profilesService.getResolvedConfig(doc.formatProfileId) as any;

        // Build Word document
        const wordDoc = this.buildWordDocument(doc, nodes, config);

        // Generate buffer
        return Packer.toBuffer(wordDoc);
    }

    private buildWordDocument(doc: any, nodes: any[], config: any): Document {
        const pageConfig = config.page || {};
        const margin = pageConfig.margin || { top_cm: 2.5, bottom_cm: 2.5, left_cm: 3.5, right_cm: 2.0 };

        // Build tree from nodes
        const tree = this.buildTree(nodes);

        // Generate sections
        const sections = this.generateSections(doc, tree, config);

        return new Document({
            sections: [
                {
                    properties: {
                        page: {
                            size: {
                                orientation: PageOrientation.PORTRAIT,
                                width: convertMillimetersToTwip(210),
                                height: convertMillimetersToTwip(297),
                            },
                            margin: {
                                top: convertMillimetersToTwip(margin.top_cm * 10),
                                bottom: convertMillimetersToTwip(margin.bottom_cm * 10),
                                left: convertMillimetersToTwip(margin.left_cm * 10),
                                right: convertMillimetersToTwip(margin.right_cm * 10),
                            },
                        },
                    },
                    footers: {
                        default: new Footer({
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            children: [PageNumber.CURRENT],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    },
                    children: sections,
                },
            ],
        });
    }

    private generateSections(doc: any, tree: any[], config: any): Paragraph[] {
        const paragraphs: Paragraph[] = [];
        const counters = { chapter: 0, section1: 0, section2: 0, figure: 0, table: 0 };

        // Process document root
        const documentRoot = tree.find(n => n.nodeType === 'DOCUMENT_ROOT');
        if (!documentRoot) return paragraphs;

        for (const sectionGroup of documentRoot.children || []) {
            this.processNode(sectionGroup, paragraphs, config, counters, doc);
        }

        return paragraphs;
    }

    private processNode(
        node: any,
        paragraphs: Paragraph[],
        config: any,
        counters: any,
        doc: any,
    ) {
        const styles = config.styles || {};
        const numbering = config.numbering || {};

        switch (node.nodeType) {
            case 'SECTION_GROUP':
                // Process children
                for (const child of node.children || []) {
                    this.processNode(child, paragraphs, config, counters, doc);
                }
                break;

            case 'COVER_PAGE':
                this.generateCoverPage(paragraphs, doc, styles);
                break;

            case 'CHAPTER':
                counters.chapter++;
                counters.section1 = 0;
                counters.section2 = 0;
                counters.figure = 0;
                counters.table = 0;

                const chapterStyle = styles.ChapterHeading || {};
                const chapterPattern = numbering.chapter?.pattern || 'CHƯƠNG {n}';
                const chapterTitle = chapterPattern.replace('{n}', counters.chapter.toString());

                paragraphs.push(
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        alignment: this.getAlignment(chapterStyle.align),
                        spacing: {
                            before: this.ptToTwip(chapterStyle.spacing_before_pt || 24),
                            after: this.ptToTwip(chapterStyle.spacing_after_pt || 24),
                        },
                        children: [
                            new TextRun({
                                text: `${chapterTitle} ${node.contentPlain || ''}`.toUpperCase(),
                                bold: chapterStyle.bold !== false,
                                size: (chapterStyle.size_pt || 14) * 2,
                                font: chapterStyle.font || 'Times New Roman',
                            }),
                        ],
                    }),
                );

                for (const child of node.children || []) {
                    this.processNode(child, paragraphs, config, counters, doc);
                }
                break;

            case 'SECTION':
                const level = node.level || 1;
                if (level === 1) {
                    counters.section1++;
                    counters.section2 = 0;
                } else if (level === 2) {
                    counters.section2++;
                }

                const sectionStyle = styles[`SectionLevel${level}`] || styles.SectionLevel1 || {};
                let sectionNumber = `${counters.chapter}.${counters.section1}`;
                if (level === 2) {
                    sectionNumber = `${counters.chapter}.${counters.section1}.${counters.section2}`;
                }

                paragraphs.push(
                    new Paragraph({
                        heading: level === 1 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
                        alignment: this.getAlignment(sectionStyle.align),
                        spacing: {
                            before: this.ptToTwip(sectionStyle.spacing_before_pt || 6),
                            after: this.ptToTwip(sectionStyle.spacing_after_pt || 12),
                        },
                        children: [
                            new TextRun({
                                text: `${sectionNumber} ${node.contentPlain || ''}`,
                                bold: sectionStyle.bold !== false,
                                italics: sectionStyle.italic === true,
                                size: (sectionStyle.size_pt || 13) * 2,
                                font: sectionStyle.font || 'Times New Roman',
                            }),
                        ],
                    }),
                );

                for (const child of node.children || []) {
                    this.processNode(child, paragraphs, config, counters, doc);
                }
                break;

            case 'PARAGRAPH':
                const bodyStyle = styles.BodyText || {};
                paragraphs.push(
                    new Paragraph({
                        alignment: this.getAlignment(bodyStyle.align || 'justify'),
                        spacing: {
                            before: this.ptToTwip(bodyStyle.spacing_before_pt || 10),
                            after: this.ptToTwip(bodyStyle.spacing_after_pt || 0),
                            line: bodyStyle.line_spacing === 1.5 ? 360 : 240,
                        },
                        children: [
                            new TextRun({
                                text: node.contentPlain || '',
                                size: (bodyStyle.size_pt || 13) * 2,
                                font: bodyStyle.font || 'Times New Roman',
                            }),
                        ],
                    }),
                );
                break;

            default:
                // Process children for other types
                for (const child of node.children || []) {
                    this.processNode(child, paragraphs, config, counters, doc);
                }
        }
    }

    private generateCoverPage(paragraphs: Paragraph[], doc: any, styles: any) {
        // Ministry headers
        paragraphs.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: 'BỘ GIÁO DỤC VÀ ĐÀO TẠO          BỘ NÔNG NGHIỆP VÀ PTNT',
                        bold: true,
                        size: 26,
                        font: 'Times New Roman',
                    }),
                ],
            }),
        );

        paragraphs.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: doc.school?.name?.toUpperCase() || 'TRƯỜNG ĐẠI HỌC THỦY LỢI',
                        bold: true,
                        size: 26,
                        font: 'Times New Roman',
                    }),
                ],
            }),
        );

        // Empty space
        for (let i = 0; i < 5; i++) {
            paragraphs.push(new Paragraph({ children: [] }));
        }

        // Title
        paragraphs.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: doc.title?.toUpperCase() || 'TÊN ĐỀ TÀI',
                        bold: true,
                        size: 28,
                        font: 'Times New Roman',
                    }),
                ],
            }),
        );

        // Empty space
        for (let i = 0; i < 3; i++) {
            paragraphs.push(new Paragraph({ children: [] }));
        }

        // Document type
        paragraphs.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: 'ĐỒ ÁN TỐT NGHIỆP',
                        bold: true,
                        size: 28,
                        font: 'Times New Roman',
                    }),
                ],
            }),
        );

        // Empty space before footer
        for (let i = 0; i < 10; i++) {
            paragraphs.push(new Paragraph({ children: [] }));
        }

        // Location and year
        paragraphs.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: `HÀ NỘI, NĂM ${doc.year || new Date().getFullYear()}`,
                        bold: true,
                        size: 26,
                        font: 'Times New Roman',
                    }),
                ],
            }),
        );
    }

    private getAlignment(align?: string) {
        switch (align) {
            case 'center': return AlignmentType.CENTER;
            case 'right': return AlignmentType.RIGHT;
            case 'justify': return AlignmentType.JUSTIFIED;
            default: return AlignmentType.LEFT;
        }
    }

    private ptToTwip(pt: number): number {
        return pt * 20;
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
