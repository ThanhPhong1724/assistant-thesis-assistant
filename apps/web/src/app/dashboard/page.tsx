'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useAuthHydration } from '@/stores/auth';
import { api } from '@/lib/api';

interface Document {
    id: number;
    title: string;
    status: string;
    year: number;
    updatedAt: string;
    school: { name: string };
    faculty: { name: string };
    programType: { name: string };
}

export default function DashboardPage() {
    const router = useRouter();
    const isHydrated = useAuthHydration();
    const { isAuthenticated, user, token, logout } = useAuthStore();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewDocModal, setShowNewDocModal] = useState(false);

    useEffect(() => {
        if (!isHydrated) return;
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadDocuments();
    }, [isHydrated, isAuthenticated, router]);

    const loadDocuments = async () => {
        if (!token) return;
        try {
            const docs = await api.getDocuments(token);
            setDocuments(docs);
        } catch (error) {
            console.error('Failed to load documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            DRAFT: 'bg-gray-100 text-gray-700',
            OUTLINE_LOCKED: 'bg-yellow-100 text-yellow-700',
            IN_PROGRESS: 'bg-blue-100 text-blue-700',
            COMPLETED: 'bg-green-100 text-green-700',
        };
        const labels: Record<string, string> = {
            DRAFT: 'Bản nháp',
            OUTLINE_LOCKED: 'Đã khóa đề cương',
            IN_PROGRESS: 'Đang viết',
            COMPLETED: 'Hoàn thành',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="text-2xl">📚</span>
                        <span className="text-xl font-bold text-gray-800">Thesis Assistant</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Xin chào, {user?.fullName}</span>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded-lg hover:bg-gray-50"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tài liệu của tôi</h1>
                        <p className="text-gray-600 mt-1">Quản lý đồ án, luận văn của bạn</p>
                    </div>
                    <button
                        onClick={() => setShowNewDocModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <span>+</span> Tạo tài liệu mới
                    </button>
                </div>

                {/* Documents Grid */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                        <p className="text-gray-500 mt-4">Đang tải...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có tài liệu nào</h3>
                        <p className="text-gray-500 mb-6">Bắt đầu bằng cách tạo một đồ án/luận văn mới</p>
                        <button
                            onClick={() => setShowNewDocModal(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Tạo tài liệu đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documents.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/documents/${doc.id}`}
                                className="bg-white rounded-xl border p-5 hover:shadow-lg transition group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 line-clamp-2">
                                        {doc.title}
                                    </h3>
                                    {getStatusBadge(doc.status)}
                                </div>
                                <p className="text-sm text-gray-500 mb-2">{doc.school?.name}</p>
                                <p className="text-sm text-gray-500">{doc.faculty?.name}</p>
                                <div className="mt-4 pt-3 border-t flex justify-between text-xs text-gray-400">
                                    <span>{doc.programType?.name}</span>
                                    <span>{doc.year}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* New Document Modal */}
            {showNewDocModal && (
                <NewDocumentModal
                    onClose={() => setShowNewDocModal(false)}
                    onCreated={() => {
                        setShowNewDocModal(false);
                        loadDocuments();
                    }}
                />
            )}
        </div>
    );
}

function NewDocumentModal({
    onClose,
    onCreated,
}: {
    onClose: () => void;
    onCreated: () => void;
}) {
    const { token } = useAuthStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [schools, setSchools] = useState<any[]>([]);
    const [faculties, setFaculties] = useState<any[]>([]);
    const [programTypes, setProgramTypes] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        topicDescription: '',
        schoolId: '',
        facultyId: '',
        programTypeId: '',
        formatProfileId: '',
        year: new Date().getFullYear(),
    });

    useEffect(() => {
        loadFormData();
    }, []);

    useEffect(() => {
        if (formData.schoolId) {
            loadFaculties(parseInt(formData.schoolId));
            loadProfiles(parseInt(formData.schoolId));
        }
    }, [formData.schoolId]);

    const loadFormData = async () => {
        try {
            const [schoolsData, programTypesData] = await Promise.all([
                api.getSchools(),
                api.getProgramTypes(),
            ]);
            setSchools(schoolsData);
            setProgramTypes(programTypesData);

            // Auto-select first school if exists
            if (schoolsData.length > 0) {
                setFormData(prev => ({ ...prev, schoolId: schoolsData[0].id.toString() }));
            }
            if (programTypesData.length > 0) {
                setFormData(prev => ({ ...prev, programTypeId: programTypesData[0].id.toString() }));
            }
        } catch (error) {
            console.error('Failed to load form data:', error);
        }
    };

    const loadFaculties = async (schoolId: number) => {
        try {
            const data = await api.getFaculties(schoolId);
            setFaculties(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, facultyId: data[0].id.toString() }));
            }
        } catch (error) {
            console.error('Failed to load faculties:', error);
        }
    };

    const loadProfiles = async (schoolId: number) => {
        try {
            const data = await api.getProfiles({ schoolId });
            setProfiles(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, formatProfileId: data[0].id.toString() }));
            }
        } catch (error) {
            console.error('Failed to load profiles:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setLoading(true);
        try {
            const doc = await api.createDocument({
                title: formData.title,
                topicDescription: formData.topicDescription,
                schoolId: parseInt(formData.schoolId),
                facultyId: parseInt(formData.facultyId),
                programTypeId: parseInt(formData.programTypeId),
                formatProfileId: parseInt(formData.formatProfileId),
                year: formData.year,
            }, token);

            router.push(`/documents/${doc.id}`);
        } catch (error) {
            console.error('Failed to create document:', error);
            alert('Không thể tạo tài liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Tạo tài liệu mới</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên đề tài <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="VD: Ứng dụng Machine Learning trong..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả đề tài
                        </label>
                        <textarea
                            value={formData.topicDescription}
                            onChange={(e) => setFormData({ ...formData, topicDescription: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={3}
                            placeholder="Mô tả ngắn gọn về đề tài..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trường</label>
                            <select
                                value={formData.schoolId}
                                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value, facultyId: '' })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {schools.map((school) => (
                                    <option key={school.id} value={school.id}>{school.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khoa</label>
                            <select
                                value={formData.facultyId}
                                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {faculties.map((faculty) => (
                                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài liệu</label>
                            <select
                                value={formData.programTypeId}
                                onChange={(e) => setFormData({ ...formData, programTypeId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {programTypes.map((pt) => (
                                    <option key={pt.id} value={pt.id}>{pt.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Năm</label>
                            <input
                                type="number"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Format chuẩn</label>
                        <select
                            value={formData.formatProfileId}
                            onChange={(e) => setFormData({ ...formData, formatProfileId: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {profiles.map((profile) => (
                                <option key={profile.id} value={profile.id}>{profile.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.title}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Đang tạo...' : 'Tạo tài liệu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
