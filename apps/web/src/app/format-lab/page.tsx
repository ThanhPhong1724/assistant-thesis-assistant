'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';

interface FormatProfile {
    id: number;
    code: string;
    name: string;
    description?: string;
    isDefault: boolean;
    school?: { name: string };
    faculty?: { name: string };
    programType?: { name: string };
}

export default function FormatLabPage() {
    const router = useRouter();
    const { isAuthenticated, token, user, logout } = useAuthStore();
    const [profiles, setProfiles] = useState<FormatProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<FormatProfile | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadProfiles();
    }, [isAuthenticated, router]);

    const loadProfiles = async () => {
        try {
            const data = await api.getProfiles();
            setProfiles(data);
            if (data.length > 0 && !selectedProfile) {
                setSelectedProfile(data[0]);
            }
        } catch (error) {
            console.error('Failed to load profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                            ← Dashboard
                        </Link>
                        <span className="text-gray-300">|</span>
                        <h1 className="font-semibold text-gray-800">🎨 Format Lab</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 text-sm">{user?.fullName}</span>
                        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
                            Thoát
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex h-[calc(100vh-57px)]">
                {/* Sidebar - Profile List */}
                <aside className="w-72 bg-white border-r overflow-y-auto">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold text-gray-700">Format Profiles</h2>
                        <p className="text-xs text-gray-500 mt-1">Chọn profile để xem chi tiết</p>
                    </div>
                    {loading ? (
                        <div className="p-4 text-center text-gray-400">Đang tải...</div>
                    ) : (
                        <div className="p-2">
                            {profiles.map((profile) => (
                                <button
                                    key={profile.id}
                                    onClick={() => setSelectedProfile(profile)}
                                    className={`w-full text-left p-3 rounded-lg mb-1 transition ${selectedProfile?.id === profile.id
                                            ? 'bg-blue-50 border border-blue-200'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="font-medium text-sm text-gray-800">{profile.name}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{profile.school?.name}</div>
                                    {profile.isDefault && (
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                            Mặc định
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {selectedProfile ? (
                        <ProfileEditor profile={selectedProfile} token={token!} onUpdate={loadProfiles} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Chọn một Format Profile để xem chi tiết
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

function ProfileEditor({
    profile,
    token,
    onUpdate,
}: {
    profile: FormatProfile;
    token: string;
    onUpdate: () => void;
}) {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('page');

    useEffect(() => {
        loadConfig();
    }, [profile.id]);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const resolved = await api.getProfileResolved(profile.id);
            setConfig(resolved);
        } catch (error) {
            console.error('Failed to load config:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'page', label: 'Trang', icon: '📄' },
        { id: 'styles', label: 'Styles', icon: '🎨' },
        { id: 'numbering', label: 'Đánh số', icon: '🔢' },
        { id: 'toc', label: 'Mục lục', icon: '📑' },
        { id: 'raw', label: 'JSON', icon: '{ }' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border shadow-sm">
                {/* Profile Header */}
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
                    <p className="text-gray-500 mt-1">{profile.description || 'Không có mô tả'}</p>
                    <div className="flex gap-2 mt-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {profile.school?.name}
                        </span>
                        {profile.faculty && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {profile.faculty.name}
                            </span>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b px-6 flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'page' && <PageConfigView config={config?.page} />}
                    {activeTab === 'styles' && <StylesConfigView config={config?.styles} />}
                    {activeTab === 'numbering' && <NumberingConfigView config={config?.numbering} />}
                    {activeTab === 'toc' && <TocConfigView config={config?.toc} />}
                    {activeTab === 'raw' && <RawJsonView config={config} />}
                </div>
            </div>
        </div>
    );
}

function PageConfigView({ config }: { config: any }) {
    if (!config) return <div className="text-gray-400">Không có cấu hình</div>;

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold text-gray-700 mb-3">Kích thước giấy</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Khổ giấy</span>
                        <span className="font-medium">{config.size || 'A4'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Hướng giấy</span>
                        <span className="font-medium">{config.orientation || 'portrait'}</span>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-700 mb-3">Lề trang (cm)</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    {config.margin && (
                        <>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Lề trên</span>
                                <span className="font-medium">{config.margin.top_cm} cm</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Lề dưới</span>
                                <span className="font-medium">{config.margin.bottom_cm} cm</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Lề trái</span>
                                <span className="font-medium">{config.margin.left_cm} cm</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-600">Lề phải</span>
                                <span className="font-medium">{config.margin.right_cm} cm</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function StylesConfigView({ config }: { config: any }) {
    if (!config) return <div className="text-gray-400">Không có cấu hình</div>;

    const styleKeys = Object.keys(config);

    return (
        <div className="space-y-4">
            {styleKeys.map((key) => {
                const style = config[key];
                return (
                    <div key={key} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">{key}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {style.font && (
                                <div>
                                    <span className="text-gray-500">Font:</span>{' '}
                                    <span className="font-medium">{style.font}</span>
                                </div>
                            )}
                            {style.size_pt && (
                                <div>
                                    <span className="text-gray-500">Size:</span>{' '}
                                    <span className="font-medium">{style.size_pt}pt</span>
                                </div>
                            )}
                            {style.bold !== undefined && (
                                <div>
                                    <span className="text-gray-500">Bold:</span>{' '}
                                    <span className="font-medium">{style.bold ? 'Có' : 'Không'}</span>
                                </div>
                            )}
                            {style.italic !== undefined && (
                                <div>
                                    <span className="text-gray-500">Italic:</span>{' '}
                                    <span className="font-medium">{style.italic ? 'Có' : 'Không'}</span>
                                </div>
                            )}
                            {style.align && (
                                <div>
                                    <span className="text-gray-500">Align:</span>{' '}
                                    <span className="font-medium">{style.align}</span>
                                </div>
                            )}
                            {style.line_spacing && (
                                <div>
                                    <span className="text-gray-500">Line spacing:</span>{' '}
                                    <span className="font-medium">{style.line_spacing}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function NumberingConfigView({ config }: { config: any }) {
    if (!config) return <div className="text-gray-400">Không có cấu hình</div>;

    return (
        <div className="space-y-4">
            {Object.entries(config).map(([key, value]: [string, any]) => (
                <div key={key} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2 capitalize">{key}</h4>
                    <div className="text-sm">
                        {value.pattern && (
                            <div className="mb-2">
                                <span className="text-gray-500">Pattern:</span>{' '}
                                <code className="bg-gray-100 px-2 py-1 rounded">{value.pattern}</code>
                            </div>
                        )}
                        {value.example && (
                            <div>
                                <span className="text-gray-500">Ví dụ:</span>{' '}
                                <span className="font-medium">{value.example}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function TocConfigView({ config }: { config: any }) {
    if (!config) return <div className="text-gray-400">Không có cấu hình</div>;

    return (
        <div className="space-y-4">
            <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Cấu hình Mục lục</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500">Tiêu đề:</span>{' '}
                        <span className="font-medium">{config.title || 'MỤC LỤC'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Số cấp hiển thị:</span>{' '}
                        <span className="font-medium">{config.levels?.length || 3}</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Leader:</span>{' '}
                        <span className="font-medium">{config.leader || '...'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RawJsonView({ config }: { config: any }) {
    return (
        <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
            <pre className="text-sm text-green-400 font-mono">
                {JSON.stringify(config, null, 2)}
            </pre>
        </div>
    );
}
