'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useAuthHydration } from '@/stores/auth';
import { api } from '@/lib/api';
import { ContentEditor } from '@/components/editor/content-editor';

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
    const isHydrated = useAuthHydration();
    const { isAuthenticated, token, user, logout } = useAuthStore();
    const [document, setDocument] = useState<Document | null>(null);
    const [nodes, setNodes] = useState<DocNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [editorContent, setEditorContent] = useState('');

    const documentId = parseInt(params.id);

    useEffect(() => {
        if (!isHydrated) return;
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadDocument();
    }, [isHydrated, isAuthenticated, router, documentId]);

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

    const handleNodeSelect = (nodeId: number, content: string) => {
        setSelectedNodeId(nodeId);
        setEditorContent(content || '');
    };

    const handleSaveContent = useCallback(async () => {
        if (!token || !selectedNodeId) return;
        try {
            await api.updateNode(documentId, selectedNodeId, {
                contentPlain: editorContent.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
            }, token);
            // Reload to get updated tree
            loadDocument();
        } catch (error) {
            console.error('Failed to save:', error);
        }
    }, [token, selectedNodeId, editorContent, documentId]);

    const getSelectedNode = (): DocNode | null => {
        if (!selectedNodeId) return null;
        return findNode(nodes, selectedNodeId);
    };

    if (!isHydrated || !isAuthenticated || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!document) {
        return null;
    }

    const selectedNode = getSelectedNode();

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
                <aside className="w-80 bg-white border-r overflow-y-auto flex-shrink-0">
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
                        selectedNodeId={selectedNodeId}
                        onSelect={handleNodeSelect}
                    />
                </aside>

                {/* Content Area */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-8">
                        {selectedNode ? (
                            <>
                                <div className="mb-6 pb-4 border-b">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                                        {selectedNode.nodeType === 'CHAPTER' ? 'Chương' : 'Mục'}
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-800 mt-1">
                                        {selectedNode.contentPlain || 'Chưa có tiêu đề'}
                                    </h2>
                                </div>
                                <ContentEditor
                                    content={editorContent}
                                    onChange={setEditorContent}
                                    onSave={handleSaveContent}
                                    placeholder="Bắt đầu viết nội dung cho mục này..."
                                />
                            </>
                        ) : (
                            <div className="text-center text-gray-400 py-20">
                                <div className="text-6xl mb-4">📝</div>
                                <p className="text-lg">Chọn một mục từ đề cương để bắt đầu viết</p>
                                <p className="text-sm mt-2">Hoặc thêm chương mới từ sidebar bên trái</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

function findNode(nodes: DocNode[], id: number): DocNode | null {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNode(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

function OutlineTree({
    nodes,
    documentId,
    token,
    onUpdate,
    selectedNodeId,
    onSelect,
}: {
    nodes: DocNode[];
    documentId: number;
    token: string;
    onUpdate: () => void;
    selectedNodeId: number | null;
    onSelect: (nodeId: number, content: string) => void;
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
                    selectedNodeId={selectedNodeId}
                    onSelect={onSelect}
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
    selectedNodeId,
    onSelect,
}: {
    node: DocNode;
    depth: number;
    documentId: number;
    token: string;
    onUpdate: () => void;
    selectedNodeId: number | null;
    onSelect: (nodeId: number, content: string) => void;
}) {
    const [expanded, setExpanded] = useState(true);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = depth * 16 + 8;
    const isSelected = selectedNodeId === node.id;

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

    const handleClick = () => {
        onSelect(node.id, node.contentPlain || '');
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Xóa mục này và tất cả nội dung bên trong?')) return;
        try {
            await api.deleteNode(documentId, node.id, token);
            onUpdate();
        } catch (error) {
            console.error('Failed to delete node:', error);
        }
    };

    const handleAddSection = async () => {
        setShowAddMenu(false);
        try {
            const existingSections = node.children?.filter((n) => n.nodeType === 'SECTION') || [];
            await api.createNode(documentId, {
                parentId: node.id,
                position: existingSections.length,
                nodeType: 'SECTION',
                level: node.nodeType === 'CHAPTER' ? 1 : 2,
                contentPlain: `Mục mới`,
            }, token);
            onUpdate();
        } catch (error) {
            console.error('Failed to add section:', error);
        }
    };

    // Only show chapters and sections
    if (!['CHAPTER', 'SECTION'].includes(node.nodeType)) return null;

    return (
        <div>
            <div
                onClick={handleClick}
                className={`flex items-center gap-2 py-2 px-2 rounded cursor-pointer group transition ${isSelected
                    ? 'bg-blue-50 border-l-2 border-blue-600'
                    : 'hover:bg-gray-50'
                    }`}
                style={{ paddingLeft }}
            >
                {hasChildren ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        className="text-gray-400 hover:text-gray-600 w-4"
                    >
                        {expanded ? '▼' : '▶'}
                    </button>
                ) : (
                    <div className="w-4" />
                )}
                <span>{getIcon()}</span>
                <span className={`flex-1 text-sm truncate ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                    {getLabel()}
                </span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                    {node.nodeType === 'CHAPTER' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowAddMenu(!showAddMenu);
                            }}
                            className="text-blue-400 hover:text-blue-600 text-xs"
                            title="Thêm mục con"
                        >
                            ➕
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        className="text-red-400 hover:text-red-600 text-xs"
                        title="Xóa"
                    >
                        🗑
                    </button>
                </div>
            </div>

            {/* Add section popup */}
            {showAddMenu && (
                <div className="ml-10 mb-2">
                    <button
                        onClick={handleAddSection}
                        className="text-xs text-blue-600 hover:text-blue-800 py-1 px-2 bg-blue-50 rounded"
                    >
                        + Thêm mục trong chương này
                    </button>
                </div>
            )}

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
                                selectedNodeId={selectedNodeId}
                                onSelect={onSelect}
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
