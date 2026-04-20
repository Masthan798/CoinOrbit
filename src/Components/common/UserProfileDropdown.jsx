import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Wallet, ShieldCheck, ChevronRight, Edit3 } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileEditModal from './ProfileEditModal';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const UserProfileDropdown = ({ onClose }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);

    const fetchProfile = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        if (data) setProfileData(data);
    };

    // const { data: { user } } = await supabase.auth.getUser();

    console.log("USER ID:", user.id);

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const menuItems = [
        { icon: <Wallet size={16} />, label: 'My Portfolio', path: '/myportfolio' },
        { icon: <Settings size={16} />, label: 'Settings', path: '/settings' },
        { icon: <ShieldCheck size={16} />, label: 'Security', path: '/security' },
    ];

    const handleSignOut = async () => {
        await signOut();
        onClose();
        navigate('/login');
    };

    // Mock profile completion
    const completionPercentage = 75;
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (completionPercentage / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 bg-[#0d0e12] border border-gray-800 rounded-md shadow-2xl z-[110]"
        >
            <div className="relative overflow-hidden rounded-md">
                {/* User Header */}
                <div className="p-5 border-b border-gray-800 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                            {/* Circular Progress */}
                            <svg className="w-14 h-14 transform -rotate-90">
                                <circle
                                    cx="28"
                                    cy="28"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="transparent"
                                    className="text-gray-800"
                                />
                                <circle
                                    cx="28"
                                    cy="28"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    className="text-white transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-400 rounded-md flex items-center justify-center shadow-neutral-900 overflow-hidden">
                                    {profileData?.profile_img ? (
                                        <img src={profileData.profile_img} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-black" />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white truncate">
                                    {profileData?.first_name ? `${profileData.first_name} ${profileData.last_name || ''}` : (user?.email?.split('@')[0] || 'User')}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditModalOpen(true);
                                    }}
                                    className="p-1.5 hover:bg-white/10 rounded-md text-muted-foreground hover:text-white transition-all shadow-white/5 shadow-inner"
                                    title="Edit Profile"
                                >
                                    <Edit3 size={14} />
                                </button>
                            </div>
                            <span className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-black">
                                Level 5 Explorer
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 p-2 bg-white/[0.03] rounded-md border border-white/[0.05]">
                        <div className="flex justify-between items-center text-[10px] mb-1">
                            <span className="text-muted-foreground font-bold">Profile Completion</span>
                            <span className="text-white font-black">{completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${completionPercentage}%` }}
                                className="bg-white h-full shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                navigate(item.path);
                                onClose();
                            }}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/[0.05] rounded-md transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/[0.03] rounded-md text-muted-foreground group-hover:text-black group-hover:bg-white transition-colors">
                                    {item.icon}
                                </div>
                                <span className="text-sm font-semibold text-muted-foreground group-hover:text-white transition-colors">
                                    {item.label}
                                </span>
                            </div>
                            <ChevronRight size={14} className="text-gray-700 group-hover:text-white transition-colors" />
                        </button>
                    ))}
                </div>

                {/* Logout Footer */}
                <div className="p-2 bg-white/[0.02] border-t border-gray-800">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-all duration-200"
                    >
                        <div className="p-2 bg-red-500/10 rounded-md">
                            <LogOut size={16} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wider">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <ProfileEditModal
                        user={user}
                        onClose={() => setIsEditModalOpen(false)}
                        onUpdate={fetchProfile}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UserProfileDropdown;
