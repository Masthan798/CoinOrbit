import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Log in
    const signIn = async (email, password) => {
        return await supabase.auth.signInWithPassword({ email, password });
    };

    // Sign up
    const signUp = async (email, password) => {
        return await supabase.auth.signUp({ email, password });
    };

    // Sign out
    const signOut = async () => {
        return await supabase.auth.signOut();
    };

    // Forgot Password
    const forgotPassword = async (email) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
    };

    // Update Password
    const updatePassword = async (newPassword) => {
        return await supabase.auth.updateUser({ password: newPassword });
    };

    // Verify Reset OTP
    const verifyResetOtp = async (email, token) => {
        return await supabase.auth.verifyOtp({
            email,
            token,
            type: 'recovery'
        });
    };

    const value = {
        signUp,
        signIn,
        signOut,
        forgotPassword,
        updatePassword,
        verifyResetOtp,
        user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
