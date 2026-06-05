import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/utils/Axios';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import type { CredentialResponse } from '@react-oauth/google';
import {
    normalizePakistaniMobile,
    PAKISTANI_MOBILE_HINT,
} from '@/utils/phone';

type AuthMode = 'signup' | 'login' | 'forgot';

export default function QuickAuthModal() {
    const { isQuickAuthModalOpen, setQuickAuthModalOpen, login: storeLogin, isAuthenticated } = useAuthStore();
    const { googleAuth, isGoogleAuthing, googleAuthError } = useAuth();
    const [mode, setMode] = useState<AuthMode>('signup');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const error = localError || (googleAuthError ? (googleAuthError as any).response?.data?.message || "Google authentication failed" : null);

    // Close modal automatically when authenticated (handles Google auth success)
    useEffect(() => {
        if (isAuthenticated && isQuickAuthModalOpen) {
            setQuickAuthModalOpen(false);
        }
    }, [isAuthenticated, isQuickAuthModalOpen, setQuickAuthModalOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isQuickAuthModalOpen) {
            setEmail('');
            setPhone('');
            setPassword('');
            setOtp('');
            setIsOtpSent(false);
            setIsOtpVerified(false);
            setLocalError(null);
            setMode('signup');
        }
    }, [isQuickAuthModalOpen]);

    // Automatically verify OTP when 6 digits are entered (signup only)
    useEffect(() => {
        if (mode === 'signup' && otp.length === 6 && !isOtpVerified) {
            handleVerifyOtp();
        }
    }, [otp, mode, isOtpVerified]);

    if (!isQuickAuthModalOpen) return null;

    const handleSendOtp = async () => {
        try {
            setIsLoading(true);
            setLocalError(null);

            const normalizedPhone = normalizePakistaniMobile(phone);

            if (!normalizedPhone) {
                setLocalError(PAKISTANI_MOBILE_HINT);
                return;
            }

            await api.post('/auth/register', { email, password, phone: normalizedPhone });
            setIsOtpSent(true);
        } catch (err: any) {
            setLocalError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            setIsLoading(true);
            setLocalError(null);
            const response = await api.post('/auth/verify-otp', { email, otp });
            const { user, token } = response.data;
            setIsOtpVerified(true);
            storeLogin(user, token);
            setQuickAuthModalOpen(false);
        } catch (err: any) {
            setLocalError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isOtpVerified) {
            setLocalError('Please verify your OTP before continuing');
            return;
        }

        setQuickAuthModalOpen(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setLocalError(null);
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data;
            storeLogin(user, token);
            setQuickAuthModalOpen(false);
        } catch (err: any) {
            setLocalError(err.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            googleAuth(credentialResponse);
        }
    };

    const handleGoogleError = () => {
        setLocalError("Google authentication failed");
    };

    const title =
        mode === 'signup'
            ? 'Join the Workshop'
            : mode === 'login'
              ? 'Welcome Back'
              : 'Reset Password';

    const subtitle =
        mode === 'signup'
            ? 'Quick registration to start shopping'
            : mode === 'login'
              ? 'Sign in to access your cart'
              : 'Verify your email and set a new password';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest-moss/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-oatmeal w-full max-w-md rounded-[2.5rem] shadow-medium overflow-hidden border border-white/50 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-forest-moss tracking-tight">
                                {title}
                            </h3>
                            <p className="text-[11px] font-bold text-forest-moss/60 uppercase tracking-widest">
                                {subtitle}
                            </p>
                        </div>
                        <button
                            onClick={() => setQuickAuthModalOpen(false)}
                            className="size-10 rounded-full bg-white flex items-center justify-center text-forest-moss hover:bg-red-50 hover:text-red-500 transition-all shadow-soft"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {mode === 'forgot' ? (
                        <ForgotPasswordForm
                            variant="modal"
                            onSuccess={() => {
                                setMode('login');
                                setLocalError(null);
                            }}
                            onBack={() => setMode('login')}
                        />
                    ) : (
                        <>
                            {error && (
                                <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100 animate-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={mode === 'signup' ? handleSignup : handleLogin} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-white px-5 py-3.5 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setLocalError(null);
                                            }}
                                        />
                                    </div>

                                    {mode === 'signup' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Pakistani Phone</label>
                                            <div className="relative flex items-center">
                                                <input
                                                    required
                                                    disabled={isLoading || isOtpSent || isOtpVerified}
                                                    type="tel"
                                                    inputMode="tel"
                                                    className="w-full bg-white pl-5 pr-12 py-3.5 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                                    placeholder="+923001234567"
                                                    value={phone}
                                                    onChange={(e) => {
                                                        setPhone(e.target.value);
                                                        setLocalError(null);
                                                    }}
                                                />
                                                <span className="material-symbols-outlined absolute right-5 text-forest-moss/30 text-[18px] pointer-events-none">phone</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center ml-4 mr-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light">Password</label>
                                            {mode === 'login' && (
                                                <button
                                                    type="button"
                                                    onClick={() => setMode('forgot')}
                                                    className="text-[10px] font-black text-clay hover:text-clay-soft uppercase tracking-widest"
                                                >
                                                    Forgot?
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            required
                                            type="password"
                                            className="w-full bg-white px-5 py-3.5 rounded-full border border-forest-moss/10 focus:outline-none focus:ring-2 focus:ring-clay/50 transition-all font-bold text-sm"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>

                                    {mode === 'signup' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-forest-moss-light ml-4">Verification Code</label>
                                            <div className="relative flex items-center">
                                                <input
                                                    disabled={!isOtpSent || isOtpVerified}
                                                    type="text"
                                                    maxLength={6}
                                                    className={`w-full bg-white pl-5 pr-[100px] py-3.5 rounded-full border transition-all font-bold text-sm tracking-[0.5em] text-left ${isOtpVerified ? 'border-green-500 bg-green-50 text-green-600' : 'border-forest-moss/10 focus:ring-2 focus:ring-clay/50'}`}
                                                    placeholder="000000"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                                />
                                                <div className="absolute right-2 flex items-center">
                                                    {!isOtpVerified ? (
                                                        <button
                                                            type="button"
                                                            disabled={!email || !password || !phone || isLoading || isOtpSent}
                                                            onClick={handleSendOtp}
                                                            className="bg-clay text-white px-3 py-1.5 rounded-full text-[10px] font-black hover:bg-clay-soft disabled:opacity-50 disabled:bg-forest-moss/10 disabled:text-forest-moss/40 uppercase tracking-widest transition-all shadow-sm"
                                                        >
                                                            {isOtpSent ? 'Sent' : 'Get OTP'}
                                                        </button>
                                                    ) : (
                                                        <span className="material-symbols-outlined font-bold text-green-500 mr-2">check_circle</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    disabled={isLoading || isGoogleAuthing || (mode === 'signup' && !isOtpVerified)}
                                    type="submit"
                                    className="w-full bg-forest-moss text-white py-4 rounded-full font-black text-sm hover:bg-forest-moss-light transition-all shadow-medium uppercase tracking-widest mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Processing...' : (mode === 'signup' ? 'Create Account' : 'Sign In')}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-forest-moss/5"></div>
                                <span className="flex-shrink-0 mx-4 text-[10px] font-black uppercase tracking-[0.2em] text-forest-moss/40">
                                    Or continue with
                                </span>
                                <div className="flex-grow border-t border-forest-moss/5"></div>
                            </div>

                            {/* Google Login Button */}
                            <GoogleLoginButton
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                disabled={isLoading || isGoogleAuthing}
                            />

                            <div className="pt-2 text-center border-t border-forest-moss/5">
                                <button
                                    type="button"
                                    onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                                    className="text-xs font-bold text-forest-moss-light hover:text-forest-moss transition-colors"
                                >
                                    {mode === 'signup' ? (
                                        <>Already signed up? <span className="text-clay font-black">Login</span></>
                                    ) : (
                                        <>Don't have an account? <span className="text-clay font-black">Register</span></>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
