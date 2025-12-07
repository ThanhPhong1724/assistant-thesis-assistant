'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';

interface DocNode {
    id: number;
    parentId: number | null;
    position: number;
    nodeType: string;
    sectionGroupType?: string;
    level?: number;
    contentPlain?: string;
    children?: DocNode[];
}

interface Document {
    id: number;
    title: string;
    status: string;
    outlineLocked: boolean;
    school: { name: string };
    faculty: { name: string };
    formatProfile: { name: string };
}

export default function DocumentPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { isAuthenticated, token, user, logout } = useAuthStore();
    const [document, setDocument] = useState<Document | null>(null);
    const [nodes, setNodes] = useState<DocNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const documentId = parseInt(params.id);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadDocument();
    }, [isAuthenticated, router, documentId]);

    const loadDocument = async () => {
        if (!token) return;
        try {
            const [doc, tree] = await Promise.all([
                api.getDocument(documentId, token),
                api.getNodes(documentId, token, 'full'),
            ]);
            setDocument(doc);
            setNodes(tree);
        } catch (error) {
            console.error('Failed to load document:', error);
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleExportWord = async () => {
        if (!token) return;
        setExporting(true);
        try {
            const blob = await api.exportWord(documentId, token);
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = `${document?.title || 'document'}.docx`;
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Xuất file thất bại. Vui lòng thử lại.');
        } finally {
            setExporting(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!isAuthenticated || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!document) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                            ← Quay lại
                        </Link>
                        <span className="text-gray-300">|</span>
                        <h1 className="font-semibold text-gray-800 truncate max-w-md">{document.title}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportWord}
                            disabled={exporting}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {exporting ? (
                                <>
                                    <span className="animate-spin">⏳</span> Đang xuất...
                                </>
                            ) : (
                                <>📄 Xuất Word</>
                            )}
                        </button>
                        <span className="text-gray-600 text-sm">{user?.fullName}</span>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                        >
                            Thoát
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex-1 flex">
                {/* Sidebar - Outline */}
                <aside className="w-80 bg-white border-r overflow-y-auto">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="font-semibold text-gray-700">Đề cương</h2>
                        <AddNodeButton
                            documentId={documentId}
                            token={token!}
                            onAdded={loadDocument}
                        />
                    </div>
                    <OutlineTree
                        nodes={nodes}
                        documentId={documentId}
                        token={token!}
                        onUpdate={loadDocument}
                    />
                </aside>

                {/* Content Area */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-8">
                        <div className="text-center text-gray-400 py-20">
                            <div className="text-6xl mb-4">📝</div>
                            <p className="text-lg">Chọn một mục từ đề cương để bắt đầu viết</p>
                            <p className="text-sm mt-2">Hoặc thêm chương mới từ sidebar bên trái</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function OutlineTree({
    nodes,
    documentId,
    token,
    onUpdate,
}: {
    nodes: DocNode[];
    documentId: number;
    token: string;
    onUpdate: () => void;
}) {
    // Find MAIN section group and render its children
    const documentRoot = nodes[0];
    if (!documentRoot) return <div className="p-4 text-gray-400">Đang tải...</div>;

    const mainGroup = documentRoot.children?.find((n) => n.sectionGroupType === 'MAIN');

    return (
        <div className="p-2">
            {mainGroup?.children?.map((node) => (
                <OutlineNode
                    key={node.id}
                    node={node}
                    depth={0}
                    documentId={documentId}
                    token={token}
                    onUpdate={onUpdate}
                />
            ))}
            {(!mainGroup?.children || mainGroup.children.length === 0) && (
                <div className="p-4 text-center text-gray-400 text-sm">
                    Chưa có chương nào. Nhấn + để thêm chương mới.
                </div>
            )}
        </div>
    );
}

function OutlineNode({
    node,
    depth,
    documentId,
    token,
    onUpdate,
}: {
    node: DocNode;
    depth: number;
    documentId: number;
    token: string;
    onUpdate: () => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = depth * 16 + 8;

    const getIcon = () => {
        if (node.nodeType === 'CHAPTER') return '📖';
        if (node.nodeType === 'SECTION') return depth === 0 ? '📑' : '📄';
        return '📝';
    };

    const getLabel = () => {
        if (node.nodeType === 'CHAPTER') return node.contentPlain || 'Chương mới';
        if (node.nodeType === 'SECTION') return node.contentPlain || 'Mục mới';
        return node.contentPlain || 'Nội dung';
    };

    const handleDelete = async () => {
        if (!confirm('Xóa mục này và tất cả nội dung bên trong?')) return;
        try {
            await api.deleteNode(documentId, node.id, token);
            onUpdate();
        } catch (error) {
            console.error('Failed to delete node:', error);
        }
    };

    // Only show chapters and sections
    if (!['CHAPTER', 'SECTION'].includes(node.nodeType)) return null;

    return (
        <div>
            <div
                className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer group"
                style={{ paddingLeft }}
            >
                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-gray-400 hover:text-gray-600 w-4"
                    >
                        {expanded ? '▼' : '▶'}
                    </button>
                )}
                {!hasChildren && <div className="w-4" />}
                <span>{getIcon()}</span>
                <span className="flex-1 text-sm text-gray-700 truncate">{getLabel()}</span>
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs"
                >
                    🗑
                </button>
            </div>
            {expanded && hasChildren && (
                <div>
                    {node.children!
                        .filter((n) => ['CHAPTER', 'SECTION'].includes(n.nodeType))
                        .map((child) => (
                            <OutlineNode
                                key={child.id}
                                node={child}
                                depth={depth + 1}
                                documentId={documentId}
                                token={token}
                                onUpdate={onUpdate}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}

function AddNodeButton({
    documentId,
    token,
    onAdded,
}: {
    documentId: number;
    token: string;
    onAdded: () => void;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [adding, setAdding] = useState(false);

    const handleAddChapter = async () => {
        setAdding(true);
        try {
            // First get nodes to find MAIN section group
            const tree = await api.getNodes(documentId, token, 'full');
            const docRoot = tree[0];
            const mainGroup = docRoot?.children?.find((n: DocNode) => n.sectionGroupType === 'MAIN');

            if (!mainGroup) {
                alert('Không tìm thấy section group');
                return;
            }

            const existingChapters = mainGroup.children?.filter((n: DocNode) => n.nodeType === 'CHAPTER') || [];
            const chapterNumber = existingChapters.length + 1;

            await api.createNode(documentId, {
                parentId: mainGroup.id,
                position: existingChapters.length,
                nodeType: 'CHAPTER',
                contentPlain: `Chương ${chapterNumber}`,
            }, token);

            onAdded();
        } catch (error) {
            console.error('Failed to add chapter:', error);
            alert('Không thể thêm chương. Vui lòng thử lại.');
        } finally {
            setAdding(false);
            setShowMenu(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                disabled={adding}
            >
                {adding ? '...' : '+'}
            </button>
            {showMenu && (
                <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-lg py-1 min-w-[140px] z-10">
                    <button
                        onClick={handleAddChapter}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                    >
                        📖 Thêm Chương
                    </button>
                </div>
            )}
        </div>
    );
}
