import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect, useState } from 'react';

interface User {
    id: number;
    email: string;
    fullName: string;
    role: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setAuth: (token: string, user: User) => void;
    logout: () => void;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,
            setAuth: (token, user) =>
                set({
                    token,
                    user,
                    isAuthenticated: true,
                }),
            logout: () =>
                set({
                    token: null,
                    user: null,
                    isAuthenticated: false,
                }),
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'thesis-auth',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);

// Hook to wait for hydration
export function useAuthHydration() {
    const [isHydrated, setIsHydrated] = useState(false);
    const hasHydrated = useAuthStore((state) => state._hasHydrated);

    useEffect(() => {
        setIsHydrated(hasHydrated);
    }, [hasHydrated]);

    return isHydrated;
}
