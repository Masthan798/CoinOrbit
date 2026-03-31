import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Camera, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const ProfileEditModal = ({ user, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        avatar_url: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!user) return;
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                if (data) {
                    setProfile({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        avatar_url: data.avatar_url || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...profile,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            toast.success('Profile updated successfully');
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-[#0d0e12] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User size={20} className="text-emerald-500" />
                        Edit Profile
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="animate-spin text-emerald-500" size={32} />
                            <span className="text-sm text-muted-foreground animate-pulse">Fetching profile data...</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center gap-4 mb-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-dashed border-gray-700 group-hover:border-emerald-500 transition-colors overflow-hidden">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={32} className="text-gray-600 group-hover:text-emerald-500 transition-colors" />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 cursor-pointer rounded-full">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">Avatar URL (External link)</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block px-1">First Name</label>
                                    <input
                                        type="text"
                                        value={profile.first_name}
                                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block px-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={profile.last_name}
                                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block px-1">Avatar URL</label>
                                    <input
                                        type="text"
                                        value={profile.avatar_url}
                                        onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                        placeholder="https://example.com/photo.jpg"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold rounded-xl transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default ProfileEditModal;
