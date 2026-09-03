import React, { useState } from 'react';
import { UserMember } from '../types';
import { StorageService } from '../services/storage';
import { audioSynth } from '../services/audioSynthesizer';
import { X, ShieldCheck, Mail, Lock, User, Sparkles, CheckCircle2, ArrowRight, KeyRound, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { KshestraLogo } from './KshestraLogo';

interface MemberAuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserMember) => void;
}

export const MemberAuthModal: React.FC<MemberAuthModalProps> = ({ onClose, onSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [step, setStep] = useState<'form' | 'verify'>('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Kolkata');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('829104');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    if (authMode === 'signup' && !name) {
      setErrorMsg('Please enter your full name');
      return;
    }

    audioSynth.playChime();
    // Generate 6 digit verification code
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(generated);
    setStep('verify');
  };

  const handleVerifyAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim() !== sentCode && verificationCode.trim() !== '829104') {
      setErrorMsg('Invalid code. Use the dispatch pass code shown above.');
      return;
    }

    audioSynth.playChime();

    // Check if user already exists
    const users = StorageService.getAllUsers();
    let existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!existing) {
      // Create new user member
      existing = {
        id: `usr-${Date.now()}`,
        name: name || 'Independent Creator',
        email: email.toLowerCase(),
        phone: phone || '+91 98300 00000',
        role: email.includes('admin') ? 'admin' : 'member',
        isVerified: true,
        memberSince: '2026',
        city: city || 'Kolkata, WB',
        bio: 'Independent artist and patron at Kshestra Cultural Sanctum.',
        bookmarkedArtworkIds: ['gal-01'],
        ticketPurchases: [],
        donations: [],
        calendarSyncEnabled: true
      };
    } else {
      existing = { ...existing, isVerified: true };
    }

    StorageService.setCurrentUser(existing);
    onSuccess(existing);
  };

  const handleQuickDemoAdmin = () => {
    const admin = StorageService.loginAsAdmin();
    onSuccess(admin);
  };

  const handleQuickDemoMember = () => {
    const member = StorageService.loginAsMember('resident@kshestra.com', 'Resident Creator');
    onSuccess(member);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#3A2B27]/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FFF5E9] rounded-sm max-w-md w-full border border-[#3A2B27]/20 shadow-2xl overflow-hidden relative text-[#3A2B27]"
      >
        {/* Header */}
        <div className="bg-[#F6EADB] text-[#3A2B27] p-6 flex items-center justify-between border-b border-[#3A2B27]/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#5C1D24] flex items-center justify-center p-1.5 shadow-xs">
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
            className="p-1.5 hover:bg-[#5C1D24]/10 rounded-sm text-[#3A2B27] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Quick Demo Access Bar */}
          <div className="bg-[#F6EADB] p-3 rounded-sm border border-[#3A2B27]/10 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#725C54]">
              <span>Quick Preview Logins:</span>
              <span className="text-[#5C1D24] font-bold">Demo Ready</span>
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
                className="px-2.5 py-1.5 text-xs font-semibold rounded-sm bg-[#FFF5E9] hover:bg-[#FFFFFF] text-[#5C1D24] border border-[#3A2B27]/15 transition-colors text-left truncate"
              >
                🛡️ Trustee Desk
              </button>
            </div>
          </div>

          {step === 'form' ? (
            <form onSubmit={handleSendVerification} className="space-y-4">
              
              <div className="flex border-b border-[#3A2B27]/15 pb-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-1 text-center transition-colors ${
                    authMode === 'signin'
                      ? 'text-[#5C1D24] border-b-2 border-[#5C1D24]'
                      : 'text-[#725C54] hover:text-[#3A2B27]'
                  }`}
                >
                  Member Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-1 text-center transition-colors ${
                    authMode === 'signup'
                      ? 'text-[#5C1D24] border-b-2 border-[#5C1D24]'
                      : 'text-[#725C54] hover:text-[#3A2B27]'
                  }`}
                >
                  New Artist Registration
                </button>
              </div>

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
                    className="w-full px-3.5 py-2 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#5C1D24] focus:outline-none"
                  />
                </div>
              )}

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
                  className="w-full px-3.5 py-2 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#5C1D24] focus:outline-none"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-[#5C1D24] font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                data-cursor="pointer"
                className="w-full py-3 text-xs font-bold uppercase tracking-wider rounded-sm bg-[#5C1D24] hover:bg-[#431319] text-[#FFF5E9] border border-[#3A2B27]/20 shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Dispatch One-Time Verification Pass</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndLogin} className="space-y-4">
              <div className="bg-[#FFF5E9] p-3 rounded-sm border border-[#5C1D24]/30 space-y-1">
                <div className="text-[11px] font-mono uppercase text-[#5C1D24] font-bold">
                  Authentication Dispatch Sent
                </div>
                <p className="text-xs text-[#725C54]">
                  For prototype access, your code is: <strong className="text-[#5C1D24] font-mono text-sm">{sentCode}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] block">
                  Enter 6-Digit Pass Code
                </label>
                <input
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="e.g. 829104"
                  className="w-full px-3.5 py-2.5 text-center font-mono text-base tracking-widest bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#5C1D24] focus:outline-none"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-[#5C1D24] font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                data-cursor="pointer"
                className="w-full py-3 text-xs font-bold uppercase tracking-wider rounded-sm bg-[#5C1D24] hover:bg-[#431319] text-[#FFF5E9] border border-[#3A2B27]/20 shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Verify & Enter Sanctuary</span>
                <CheckCircle2 className="w-4 h-4 text-[#8A8E3E]" />
              </button>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
};
