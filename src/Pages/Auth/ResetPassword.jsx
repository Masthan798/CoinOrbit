import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, Eye, EyeOff, Hash, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AuthBackground from '../../Components/common/AuthBackground';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyResetOtp, updatePassword } = useAuth();

    const [step, setStep] = useState(1); // 1: Verify OTP, 2: Reset Password
    const [otp, setOtp] = useState(new Array(8).fill(""));
    const inputRefs = useRef([]);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const email = location.state?.email || '';

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (element.value !== "" && index < 7) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpValue = otp.join("");
        if (otpValue.length < 8) {
            return toast.error("Please enter the full 8-digit code");
        }

        setLoading(true);

        try {
            const { error } = await verifyResetOtp(email, otpValue);
            if (error) throw error;

            toast.success('Code verified successfully!');
            setStep(2);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters long');
        }

        setLoading(true);

        try {
            const { error } = await updatePassword(password);
            if (error) throw error;

            toast.success('Password updated successfully!');
            navigate('/', { replace: true });
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
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Verify Code</h1>
                                    <p className="text-muted text-xs sm:text-sm">We've sent an 8-digit code to <span className="text-white font-medium">{email}</span></p>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="block text-center text-[10px] sm:text-xs uppercase tracking-wider text-muted font-semibold">Verification Code</label>
                                        <div className="flex justify-center flex-wrap gap-1.5 sm:gap-2">
                                            {otp.map((data, index) => (
                                                <input
                                                    key={index}
                                                    type="text"
                                                    maxLength="1"
                                                    ref={(el) => (inputRefs.current[index] = el)}
                                                    value={data}
                                                    onChange={(e) => handleOtpChange(e.target, index)}
                                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                                    onFocus={(e) => e.target.select()}
                                                    className="w-8 h-10 sm:w-10 sm:h-12 bg-transparent border border-soft rounded-lg text-center text-white text-base sm:text-lg font-bold focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-card border border-soft text-white font-bold py-3 sm:py-3.5 rounded-xl hover:bg-hover-soft hover:border-white/20 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 sm:w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Verify Code
                                                <ArrowRight className="w-4 h-4 sm:w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <div className="flex justify-center mb-2">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Secure Your Account</h1>
                                    <p className="text-muted text-xs sm:text-sm">Verification successful. Set your new password below.</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] sm:text-xs uppercase tracking-wider text-muted ml-1 font-semibold">New Password</label>
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
                                        className="w-full bg-card border border-soft text-white font-bold py-3 sm:py-3.5 rounded-xl hover:bg-hover-soft hover:border-white/20 transition-all shadow-lg flex items-center justify-center gap-2 mt-2 text-sm sm:text-base"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 sm:w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Reset Password
                                                <ArrowRight className="w-4 h-4 sm:w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
