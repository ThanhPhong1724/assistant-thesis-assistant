'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';

interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
}

interface Stats {
    totalUsers: number;
    totalDocuments: number;
    totalProfiles: number;
    recentActivity: number;
}

export default function AdminPage() {
    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuthStore();
    const [stats, setStats] = useState<Stats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Check if user is admin
        if (user?.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }

        loadData();
    }, [isAuthenticated, user, router]);

    const loadData = async () => {
        setLoading(true);
        try {
            // In a real implementation, you would fetch these from API
            // For now, we'll use placeholder data
            setStats({
                totalUsers: 42,
                totalDocuments: 156,
                totalProfiles: 8,
                recentActivity: 23,
            });

            setUsers([
                {
                    id: 1,
                    email: 'admin@thesis.local',
                    fullName: 'Admin User',
                    role: 'ADMIN',
                    createdAt: '2024-01-10',
                },
                {
                    id: 2,
                    email: 'student@thesis.local',
                    fullName: 'Nguyễn Văn Test',
                    role: 'STUDENT',
                    createdAt: '2024-01-15',
                },
            ]);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return null;
    }

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
                        <h1 className="font-semibold text-gray-800">⚙️ Admin Panel</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 text-sm">{user?.fullName}</span>
                        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
                            Thoát
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                title="Total Users"
                                value={stats?.totalUsers || 0}
                                icon="👥"
                                color="blue"
                            />
                            <StatCard
                                title="Documents"
                                value={stats?.totalDocuments || 0}
                                icon="📄"
                                color="green"
                            />
                            <StatCard
                                title="Format Profiles"
                                value={stats?.totalProfiles || 0}
                                icon="🎨"
                                color="purple"
                            />
                            <StatCard
                                title="Recent Activity"
                                value={stats?.recentActivity || 0}
                                icon="⚡"
                                color="orange"
                            />
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-xl border shadow-sm">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Full Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-sm text-gray-800">{u.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-800">{u.fullName}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${u.role === 'ADMIN'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                            }`}
                                                    >
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{u.createdAt}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <button className="text-blue-600 hover:text-blue-800 mr-3">
                                                        Edit
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-800">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* System Info */}
                        <div className="mt-8 bg-white rounded-xl border shadow-sm p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Information</h2>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">Database</span>
                                    <span className="font-medium">PostgreSQL 16</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">Cache</span>
                                    <span className="font-medium">Redis 7</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">Storage</span>
                                    <span className="font-medium">MinIO</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-600">API Version</span>
                                    <span className="font-medium">v1.0.0</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number;
    icon: string;
    color: string;
}) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
    };

    return (
        <div className={`bg-white border rounded-xl p-6 ${colors[color as keyof typeof colors]}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{icon}</span>
                <span className="text-3xl font-bold">{value}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
        </div>
    );
}
