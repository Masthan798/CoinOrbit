import React, { useState, useEffect, useRef } from 'react';
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
        profile_img: ''
    });
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!user) return;
                console.log("FETCHING PROFILE FOR USER ID:", user?.id);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                console.log("SEARCHED ROW DATA:", data);
                if (error && error.code !== 'PGRST116') throw error;
                if (data) {
                    setProfile({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        profile_img: data.profile_img || ''
                    });
                    // Add timestamp to previewUrl to bust cache
                    const url = data.profile_img ? `${data.profile_img}?t=${new Date().getTime()}` : '';
                    setPreviewUrl(url);
                }
            } catch (error) {
                console.error('Error fetching profile:', error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // 1. Check if user is logged in (as recommended)
            const { data: { user: authUser } } = await supabase.auth.getUser();
            console.log("LOGGED IN AUTH USER:", authUser);
            
            if (!authUser) {
                console.error("User not logged in");
                throw new Error("You must be logged in to update your profile");
            }

            console.log("AUTH ID FOR UPDATE:", authUser.id);
            let currentImageUrl = profile.profile_img;

            // 2. Upload to Supabase Storage if a new file is selected
            if (selectedFile) {
                setUploading(true);
                const filePath = `Profiles/${authUser.id}.png`;

                // Upload to bucket: profile_images
                const { error: uploadError } = await supabase.storage
                    .from('profile_images')
                    .upload(filePath, selectedFile, { upsert: true });

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    throw uploadError;
                }

                // Get public URL
                const { data } = supabase.storage
                    .from('profile_images')
                    .getPublicUrl(filePath);

                currentImageUrl = data.publicUrl;
                setUploading(false);
            }

            // 3. Update profiles table in database using UPSERT (SAFE)
            console.log("UPSERTING PROFILE DATA FOR ID:", authUser.id);
            const { error: dbError } = await supabase
                .from('profiles')
                .upsert({ 
                    id: authUser.id,
                    first_name: profile.first_name,
                    last_name: profile.last_name,
                    profile_img: currentImageUrl,
                    updated_at: new Date().toISOString(),
                });

            if (dbError) throw dbError;

            toast.success('Profile updated successfully');
            if (onUpdate) onUpdate();
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(error.message || 'Failed to save profile');
        } finally {
            setSaving(false);
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md bg-[#0d0e12] border border-gray-800 rounded-md shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User size={20} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                        Edit Profile
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-md text-muted-foreground hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="animate-spin text-white" size={32} />
                            <span className="text-sm text-muted-foreground animate-pulse">Fetching profile data...</span>
                        </div>
                    ) : (
                        <>
                            {/* Avatar Upload Section */}
                            <div className="flex flex-col gap-4 mb-6 w-full">
                                <div className="relative group cursor-pointer w-full" onClick={handleUploadClick}>
                                    <div className="w-full h-32 bg-white/[0.02] rounded-md flex flex-col items-center justify-center border-2 border-dashed border-gray-800 hover:border-white/50 transition-all overflow-hidden group/container relative">
                                        {previewUrl ? (
                                            <img 
                                                src={previewUrl} 
                                                alt="Avatar" 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/container:scale-105"
                                                onError={(e) => {
                                                    console.error("🚨 IMAGE LOAD FAILED! Check if your 'profile_images' bucket is set to PUBLIC in Supabase.");
                                                    console.log("Attempted URL:", previewUrl);
                                                }}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <Camera size={40} className="text-gray-700 group-hover/container:text-white transition-colors" />
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Click to upload avatar</span>
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/container:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md">
                                                <Camera size={14} className="text-white" />
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change Image</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] px-1 animate-pulse">
                                    Click box to update avatar
                                </span>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block px-1">First Name</label>
                                    <input
                                        type="text"
                                        value={profile.first_name}
                                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-gray-800 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all shadow-inner"
                                        placeholder="John"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block px-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={profile.last_name}
                                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-gray-800 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all shadow-inner"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-md transition-all uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || uploading}
                                    className="flex-1 px-6 py-3 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold rounded-md transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                >
                                    {(saving || uploading) ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes'}
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
