import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://emnnzmjgkshysccmuahd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbm56bWpna3NoeXNjY211YWhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODI5MDEsImV4cCI6MjA4MTE1ODkwMX0.Z1LCcMKEp6_SLZLgTxOyXO2NdsmAfgLk1UrYCTKPRsE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin emails - these users get Pro access automatically
export const ADMIN_EMAILS = [
    'reynar_sepol@hotmail.com',
];

// Check if user is admin
export const isAdminUser = (email?: string | null): boolean => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};

// Auth Helper Functions
export const signInWithGoogle = async () => {
    // Redirect to transactions after login
    const redirectUrl = `${window.location.origin}/#/transactions`;
    console.log('Google OAuth redirect URL:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUrl,
            queryParams: {
                prompt: 'select_account', // Force account selection every time
            }
        }
    });
    return { data, error };
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

// Email/Password Sign Up
export const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${window.location.origin}/#/`
        }
    });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

export const onAuthStateChange = (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user ?? null);
    });
};
