import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, onAuthStateChange, signInWithGoogle, signOut as supabaseSignOut, getCurrentUser } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<{ data: any; error: any }>;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {

                // Get the full URL to check for OAuth tokens
                const fullUrl = window.location.href;
                const hash = window.location.hash;

                // Check for access_token in URL (OAuth callback)
                if (fullUrl.includes('access_token=')) {

                    // Extract tokens from URL
                    // Tokens can be in the hash part after the route
                    const tokenPart = hash.includes('access_token=')
                        ? hash.substring(hash.indexOf('access_token='))
                        : fullUrl.substring(fullUrl.indexOf('access_token='));

                    const params = new URLSearchParams(tokenPart);
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');


                    if (accessToken) {
                        // Set the session manually with the tokens
                        const { data, error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken || '',
                        });

                        if (error) {
                            console.error('❌ Error setting session:', error);
                        } else if (data.session) {
                            setUser(data.session.user);

                            // Clean up URL - redirect to dashboard
                            window.history.replaceState({}, document.title, window.location.pathname + '#/dashboard');
                        }
                    }
                } else {
                    // No OAuth callback, check for existing session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        setUser(session.user);
                    }
                }
            } catch (error) {
                console.error('Error in initAuth:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = onAuthStateChange((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        const { error } = await supabaseSignOut();
        if (error) {
            console.error('Error signing out:', error);
        } else {
            setUser(null);
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        signInWithGoogle,
        signOut: handleSignOut,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
