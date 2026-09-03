import React, { useState } from 'react';
import { UserMember } from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynthesizer';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { X, ArrowRight, Eye, EyeOff, Loader2, Copy, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { KshestraLogo } from './KshestraLogo';

interface MemberAuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserMember) => void;
}

export const MemberAuthModal: React.FC<MemberAuthModalProps> = ({ onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Human-friendly error translation for Firebase auth codes
  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    if (code.includes('auth/unauthorized-domain')) {
      return `This preview domain (${window.location.hostname}) is not authorized in Firebase Console yet. Please add it under Authentication > Settings > Authorized domains, or sign in directly with Email & Password below.`;
    }
    if (
      code.includes('auth/invalid-credential') || 
      code.includes('auth/wrong-password') || 
      code.includes('auth/user-not-found')
    ) {
      return 'Incorrect email or password. Please verify your credentials.';
    }
    if (code.includes('auth/email-already-in-use')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (code.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters.';
    }
    if (code.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (code.includes('auth/popup-closed-by-user')) {
      return 'Google sign-in was closed before completing.';
    }
    if (code.includes('auth/popup-blocked')) {
      return 'Pop-up window was blocked. Please allow pop-ups for this domain.';
    }
    if (code.includes('auth/api-key-not-valid')) {
      return 'Firebase API key is not recognized or domain is restricted in your Firebase project console. Please verify Authentication is enabled in Firebase Console (or use Quick Preview Logins above).';
    }
    if (code.includes('auth/network-request-failed')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    return err?.message || 'Authentication failed. Please try again.';
  };

  // Helper to fetch or initialize Firestore user record
  const syncFirestoreUser = async (firebaseUser: any, customName?: string): Promise<UserMember> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let userData: any = null;

    try {
      const snap = await getDoc(userDocRef);
      if (!snap.exists()) {
        userData = {
          name: customName || firebaseUser.displayName || 'Resident Creator',
          email: firebaseUser.email || '',
          location: 'Kolkata, WB',
          residentSince: '2026',
          passes: [],
          receipts: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, userData);
      } else {
        userData = snap.data();
      }
    } catch (fsErr) {
      console.warn('Firestore sync warning (proceeding with auth user):', fsErr);
      userData = {
        name: customName || firebaseUser.displayName || 'Resident Creator',
        email: firebaseUser.email || '',
        location: 'Kolkata, WB',
        residentSince: '2026',
        passes: [],
        receipts: []
      };
    }

    const member: UserMember = {
      id: firebaseUser.uid,
      name: userData?.name || firebaseUser.displayName || 'Resident Creator',
      email: firebaseUser.email || userData?.email || '',
      role: (firebaseUser.email && firebaseUser.email.includes('admin')) ? 'admin' : 'member',
      isVerified: true,
      memberSince: userData?.residentSince || '2026',
      city: userData?.location || 'Kolkata, WB',
      ticketPurchases: userData?.passes || [],
      donations: userData?.receipts || [],
      calendarSyncEnabled: true
    };

    StorageService.setCurrentUser(member);
    return member;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (authMode === 'signup' && !name.trim()) {
      setErrorMsg('Please enter your full legal or artist name');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) {
          try {
            await updateProfile(cred.user, { displayName: name.trim() });
          } catch (profileErr) {
            console.warn('Profile name update error:', profileErr);
          }
        }
        const member = await syncFirestoreUser(cred.user, name.trim());
        audioSynth.playChime();
        onSuccess(member);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const member = await syncFirestoreUser(cred.user);
        audioSynth.playChime();
        onSuccess(member);
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDomain = async () => {
    try {
      const hostname = window.location.hostname;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(hostname);
      } else {
        const input = document.createElement('input');
        input.value = hostname;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsUnauthorizedDomain(false);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const member = await syncFirestoreUser(cred.user);
      audioSynth.playChime();
      onSuccess(member);
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        console.warn('Google Sign-In domain authorization needed for:', window.location.hostname);
        setIsUnauthorizedDomain(true);
      } else {
        console.error('Google Sign In error:', err);
      }
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAdmin = () => {
    audioSynth.playChime();
    const admin = StorageService.loginAsAdmin();
    onSuccess(admin);
  };

  const handleQuickDemoMember = () => {
    audioSynth.playChime();
    const member = StorageService.loginAsMember('resident@kshestra.com', 'Resident Creator');
    onSuccess(member);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#3A2B27]/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FFF5E9] rounded-sm max-w-md w-full border border-[#3A2B27]/20 shadow-2xl overflow-hidden relative text-[#3A2B27] my-auto"
      >
        {/* Header */}
        <div className="bg-[#F6EADB] text-[#3A2B27] p-5 sm:p-6 flex items-center justify-between border-b border-[#3A2B27]/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#471319] flex items-center justify-center p-1.5 shadow-xs">
              <KshestraLogo variant="white" className="w-full h-full text-[#FFF5E9]" />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#3A2B27]">
                Enter the Sanctuary
              </h3>
              <p className="text-[11px] text-[#725C54] font-mono">
                Kshestra Cultural Identity & Vault Access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            data-cursor="pointer"
            className="p-1.5 hover:bg-[#471319]/10 rounded-sm text-[#3A2B27] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Quick Demo Access Bar */}
          <div className="bg-[#F6EADB] p-3 rounded-sm border border-[#3A2B27]/10 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#725C54]">
              <span>Quick Preview Logins:</span>
              <span className="text-[#471319] font-bold">Demo Ready</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoMember}
                data-cursor="pointer"
                className="px-2.5 py-1.5 text-xs font-semibold rounded-sm bg-[#FFF5E9] hover:bg-[#FFFFFF] text-[#3A2B27] border border-[#3A2B27]/15 transition-colors text-left truncate"
              >
                👤 Resident Creator
              </button>
              <button
                type="button"
                onClick={handleQuickDemoAdmin}
                data-cursor="pointer"
                className="px-2.5 py-1.5 text-xs font-semibold rounded-sm bg-[#FFF5E9] hover:bg-[#FFFFFF] text-[#471319] border border-[#3A2B27]/15 transition-colors text-left truncate"
              >
                🛡️ Trustee Desk
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-[#3A2B27]/15 pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 text-center transition-colors ${
                  authMode === 'signin'
                    ? 'text-[#471319] border-b-2 border-[#471319]'
                    : 'text-[#725C54] hover:text-[#3A2B27]'
                }`}
              >
                Member Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 text-center transition-colors ${
                  authMode === 'signup'
                    ? 'text-[#471319] border-b-2 border-[#471319]'
                    : 'text-[#725C54] hover:text-[#3A2B27]'
                }`}
              >
                New Artist Registration
              </button>
            </div>

            {/* Name field (Only on Registration) */}
            {authMode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] block">
                  Full Legal / Artist Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Suman Sengupta"
                  className="w-full px-3.5 py-2 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#471319] focus:outline-none text-[#3A2B27]"
                />
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] block">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. artist@domain.com"
                className="w-full px-3.5 py-2 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#471319] focus:outline-none text-[#3A2B27]"
              />
            </div>

            {/* Password input field below the Email field */}
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authMode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
                  className="w-full px-3.5 py-2 pr-10 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#471319] focus:outline-none text-[#3A2B27]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  data-cursor="pointer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#725C54] hover:text-[#3A2B27] p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-[#471319]/10 border border-[#471319]/30 rounded-xs">
                <p className="text-xs text-[#471319] font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Submit Button: "Sign In" or "Create Account" */}
            <button
              type="submit"
              disabled={isLoading}
              data-cursor="pointer"
              className="w-full py-3 text-xs font-bold uppercase tracking-wider rounded-sm bg-[#471319] hover:bg-[#471319] text-[#FFF5E9] border border-[#3A2B27]/20 shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#3A2B27]/15 w-full"></div>
              <span className="bg-[#FFF5E9] px-2 text-[10px] font-mono uppercase text-[#725C54] tracking-wider shrink-0">
                or
              </span>
            </div>

            {/* Clean "Continue with Google" Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              data-cursor="pointer"
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-sm bg-[#FFFFFF] hover:bg-[#F6EADB] text-[#3A2B27] border border-[#3A2B27]/20 shadow-2xs transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Unauthorized Domain Helper Card */}
            {isUnauthorizedDomain && (
              <div className="p-3 bg-[#471319]/10 border border-[#471319]/30 rounded-xs space-y-2 text-xs text-[#3A2B27]">
                <div className="flex items-center gap-1.5 font-semibold text-[#471319]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Domain Authorization Needed for Google OAuth</span>
                </div>
                <p className="text-[11px] text-[#725C54] leading-relaxed">
                  Firebase requires your active domain to be added to Authorized Domains for Google Sign-In:
                </p>
                <div className="flex items-center gap-2 bg-[#FFFFFF] p-2 rounded-xs border border-[#3A2B27]/15">
                  <code className="text-[11px] font-mono text-[#3A2B27] truncate flex-1 select-all font-bold">
                    {window.location.hostname}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="px-2.5 py-1 text-[10px] font-mono uppercase bg-[#471319] text-[#FFF5E9] rounded-xs hover:bg-[#471319]/90 transition-colors shrink-0 flex items-center gap-1"
                  >
                    {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDomain ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="text-[10px] font-mono text-[#725C54] space-y-1">
                  <p>1. Open <span className="font-bold text-[#3A2B27]">Firebase Console</span> &gt; project <span className="font-bold text-[#3A2B27]">kshestra-website</span></p>
                  <p>2. Navigate to <span className="font-semibold text-[#3A2B27]">Authentication &gt; Settings &gt; Authorized domains</span></p>
                  <p>3. Click <span className="font-semibold text-[#3A2B27]">Add domain</span> and paste the copied domain</p>
                </div>
                <div className="pt-1.5 text-[11px] text-[#8A8E3E] font-medium border-t border-[#3A2B27]/10">
                  Tip: You can register or sign in immediately using <strong>Email & Password</strong> or the <strong>Quick Preview</strong> buttons above without domain restrictions!
                </div>
              </div>
            )}
          </form>

        </div>
      </motion.div>
    </div>
  );
};
