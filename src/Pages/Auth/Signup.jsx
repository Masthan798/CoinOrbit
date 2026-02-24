import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import AuthBackground from '../../Components/common/AuthBackground';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters long');
        }

        setLoading(true);

        try {
            const { error } = await signUp(email, password);
            if (error) throw error;
            toast.success('Registration successful! Please check your email.');
            navigate('/login');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-main flex items-center justify-center p-4 overflow-hidden font-outfit overscroll-none">
            <AuthBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="bg-card backdrop-blur-xl border border-soft rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                    <div className="text-center mb-8 sm:mb-10">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-muted text-xs sm:text-sm">Join CoinOrbit and start your crypto journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted ml-1 font-semibold">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 h-5 text-muted group-focus-within:text-white transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-transparent border border-soft rounded-xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-white text-sm sm:text-base focus:outline-none focus:border-white/20 transition-all font-sans"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted ml-1 font-semibold">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 h-5 text-muted group-focus-within:text-white transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-transparent border border-soft rounded-xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-white text-sm sm:text-base focus:outline-none focus:border-white/20 transition-all font-sans"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 h-5" /> : <Eye className="w-4 h-4 sm:w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted ml-1 font-semibold">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 h-5 text-muted group-focus-within:text-white transition-colors" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-transparent border border-soft rounded-xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-10 sm:pr-12 text-white text-sm sm:text-base focus:outline-none focus:border-white/20 transition-all font-sans"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 h-5" /> : <Eye className="w-4 h-4 sm:w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-card border border-soft text-white font-bold py-3 sm:py-3.5 rounded-xl hover:bg-hover-soft hover:border-white/20 transition-all shadow-lg flex items-center justify-center gap-2 mt-2 sm:mt-4 text-sm sm:text-base"
                        >
                            {loading ? (
                                <div className="w-4 h-4 sm:w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Sign Up
                                    <ArrowRight className="w-4 h-4 sm:w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-muted text-xs sm:text-sm mt-8 sm:mt-10">
                        Already have an account?{' '}
                        <Link to="/login" className="text-white hover:underline font-semibold transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
