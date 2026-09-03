import React, { useState, useMemo } from 'react';
import { audioSynth } from '../services/audioSynthesizer';
import { 
  Flame, FileText, ShieldCheck, Sparkles, 
  ArrowUpRight, HeartHandshake, Award, Coins
} from 'lucide-react';
import { KshestraLogo } from './KshestraLogo';

interface DonationPortalProps {
  onInitiateDonation: (amount: number, tierId?: string, tierName?: string) => void;
}

const PRESET_AMOUNTS = [
  { label: '₹1K', value: 1000 },
  { label: '₹2.5K', value: 2500 },
  { label: '₹5K', value: 5000 },
  { label: '₹10K', value: 10000 },
  { label: '₹25K', value: 25000 },
  { label: '₹50K', value: 50000 },
  { label: '₹1 Lakh', value: 100000 },
];

export const DonationPortal: React.FC<DonationPortalProps> = ({ onInitiateDonation }) => {
  const [grantAmount, setGrantAmount] = useState<number>(50000);
  const [inputValue, setInputValue] = useState<string>('50000');
  const [is80GRequested, setIs80GRequested] = useState<boolean>(true);

  // Compute real-world impact metrics dynamically based on grantAmount
  const impactStats = useMemo(() => {
    const amt = grantAmount > 0 ? grantAmount : 0;
    const studioHours = Math.max(0, Math.round(amt / 125));
    const artistsEquipped = Math.max(0, Math.round(amt / 1250));
    const taxSaving = Math.round(amt * 0.5); // 50% deduction under 80G
    return { studioHours, artistsEquipped, taxSaving };
  }, [grantAmount]);

  const handleSelectPreset = (amount: number) => {
    audioSynth.playChime();
    setGrantAmount(amount);
    setInputValue(amount.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputValue(rawVal);
    const parsed = parseInt(rawVal.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setGrantAmount(parsed);
    } else if (rawVal === '') {
      setGrantAmount(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = grantAmount > 0 ? grantAmount : 1000;
    const tierName = `Sanctum Patronage Grant (₹${finalAmount.toLocaleString('en-IN')})`;
    onInitiateDonation(finalAmount, undefined, tierName);
  };

  return (
    <section id="donate-portal" className="py-20 md:py-32 border-b border-[#3A2B27]/15 bg-[#FFF5E9] relative overflow-hidden">
      
      {/* Background Decorative Graphic */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-[0.03] select-none font-gambetta text-[24vw] font-bold text-[#5C1D24] leading-none">
        GRANTS
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-12 relative z-10">
        
        {/* Section Header Masthead */}
        <div className="border-b-2 border-[#3A2B27] pb-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#5C1D24] font-bold tracking-widest uppercase">
              <Flame className="w-4 h-4 text-[#8A8E3E] animate-pulse" />
              <span>PRESERVE THE FIRE · 80G REGISTERED TRUST</span>
            </div>
            <div className="text-[#725C54] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#8A8E3E]" />
              <span>100% DIRECT DISBURSEMENT TO PRODUCTION</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <h2 className="font-gambetta text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#3A2B27] leading-[1.08]">
                Art Asks for Courage, Not Charity
              </h2>
              <p className="font-serif italic text-lg sm:text-2xl text-[#5C1D24] leading-snug max-w-3xl">
                "We do not solicit passive sympathy. We assemble visionary cultural patrons who recognize that free expression requires physical shelter and independent resources."
              </p>
            </div>

            <div className="lg:col-span-4 space-y-2 border-l-2 lg:border-l-0 lg:border-r-2 border-[#5C1D24] pl-4 lg:pl-0 lg:pr-4 py-1 text-xs font-mono text-[#725C54]">
              <div className="text-[#3A2B27] font-bold uppercase tracking-wider">
                Sanctum Endowment Charter
              </div>
              <p>
                Zero administrative overhead from public grants. Every rupee directly funds physical studio hours, equipment loans, and resident artist stipends in Kolkata.
              </p>
            </div>
          </div>
        </div>

        {/* Unified Real-Time Impact Calculator & Grant Inputter */}
        <div className="bg-[#FFFFFF] border-2 border-[#3A2B27] rounded-xs p-6 sm:p-10 shadow-md space-y-8">
          
          {/* Header & Preset Amounts */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3A2B27]/15 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xs bg-[#5C1D24] text-[#FFF5E9] flex items-center justify-center p-2 shadow-xs shrink-0">
                <Coins className="w-full h-full" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#5C1D24]">
                  REAL-TIME IMPACT CALCULATOR
                </span>
                <h3 className="font-gambetta text-2xl sm:text-3xl font-bold text-[#3A2B27]">
                  Grant Impact: ₹{(grantAmount || 0).toLocaleString('en-IN')}
                </h3>
              </div>
            </div>

            {/* Quick-Preset Amount Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono text-[#725C54] mr-1">Quick Select:</span>
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleSelectPreset(preset.value)}
                  data-cursor="pointer"
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xs border transition-all ${
                    grantAmount === preset.value
                      ? 'bg-[#8A8E3E] text-[#FFF5E9] border-[#8A8E3E] shadow-xs'
                      : 'bg-[#FFF5E9] text-[#3A2B27] border-[#3A2B27]/20 hover:border-[#8A8E3E]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Dynamic Impact Visualizer Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FFF5E9] p-5 rounded-xs border border-[#8A8E3E]/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xs bg-[#5C1D24]/10 text-[#5C1D24] flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#8A8E3E]" />
              </div>
              <div>
                <div className="font-gambetta text-2xl sm:text-3xl font-bold text-[#5C1D24]">
                  {impactStats.studioHours}+ Hours
                </div>
                <div className="text-[11px] font-mono text-[#725C54] uppercase font-bold tracking-wider leading-tight mt-0.5">
                  Studio & Production Access
                </div>
              </div>
            </div>

            <div className="bg-[#FFF5E9] p-5 rounded-xs border border-[#8A8E3E]/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xs bg-[#8A8E3E]/15 text-[#8A8E3E] flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6 text-[#8A8E3E]" />
              </div>
              <div>
                <div className="font-gambetta text-2xl sm:text-3xl font-bold text-[#8A8E3E]">
                  {impactStats.artistsEquipped} Creators
                </div>
                <div className="text-[11px] font-mono text-[#725C54] uppercase font-bold tracking-wider leading-tight mt-0.5">
                  Provided Working Materials
                </div>
              </div>
            </div>

            <div className="bg-[#FFF5E9] p-5 rounded-xs border border-[#8A8E3E]/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xs bg-[#8A8E3E]/15 text-[#8A8E3E] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#8A8E3E]" />
              </div>
              <div>
                <div className="font-gambetta text-2xl sm:text-3xl font-bold text-[#8A8E3E]">
                  ₹{impactStats.taxSaving.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] font-mono text-[#725C54] uppercase font-bold tracking-wider leading-tight mt-0.5">
                  80G Tax Exemption (50%)
                </div>
              </div>
            </div>
          </div>

          {/* Grant Amount Inputter Form */}
          <form onSubmit={handleSubmit} className="pt-4 border-t border-[#3A2B27]/15 space-y-6">
            <div className="space-y-2">
              <label htmlFor="grant-amount-input" className="text-xs font-mono uppercase tracking-wider text-[#725C54] font-bold block">
                Grant Amount (INR) — Adjust to any value or click presets above:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch">
                <div className="sm:col-span-8 h-14 flex items-center bg-[#FFF5E9] border-2 border-[#3A2B27]/30 rounded-xs px-4 focus-within:border-[#5C1D24] focus-within:bg-[#FFFFFF] focus-within:ring-1 focus-within:ring-[#5C1D24] transition-colors">
                  <span className="font-serif text-3xl font-bold text-[#5C1D24] mr-3 select-none">₹</span>
                  <input
                    id="grant-amount-input"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 50000"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="w-full text-xl sm:text-2xl font-mono font-bold bg-transparent text-[#3A2B27] placeholder:text-[#725C54]/40 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="w-full h-14 flex items-center gap-2.5 cursor-pointer text-xs font-mono text-[#3A2B27] bg-[#FFF5E9] px-4 rounded-xs border-2 border-[#3A2B27]/30 hover:border-[#5C1D24] transition-colors select-none">
                    <input
                      type="checkbox"
                      checked={is80GRequested}
                      onChange={(e) => setIs80GRequested(e.target.checked)}
                      className="rounded-xs accent-[#5C1D24] w-4 h-4 cursor-pointer"
                    />
                    <FileText className="w-4 h-4 text-[#8A8E3E] shrink-0" />
                    <span className="font-bold">Claim 80G Certificate</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              data-cursor="pointer"
              className="w-full py-4 px-6 text-sm font-mono font-bold uppercase tracking-widest rounded-xs bg-[#5C1D24] hover:bg-[#431319] text-[#FFF5E9] border border-[#3A2B27]/20 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <Flame className="w-4 h-4 text-[#8A8E3E] group-hover:scale-110 transition-transform" />
              <span>Pay Grant Money: ₹{(grantAmount || 0).toLocaleString('en-IN')}</span>
              <ArrowUpRight className="w-4 h-4 text-[#FFF5E9] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </form>

          {/* Footnote Docket */}
          <div className="pt-4 border-t border-[#3A2B27]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#725C54]">
            <div className="flex items-center gap-2">
              <KshestraLogo preferAssetImage className="w-4 h-4 object-contain" />
              <span>Kshestra Cultural Foundation · Registered Section 80G Cultural Trust</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-[#5C1D24]" />
              <span className="text-[#5C1D24] font-bold">100% AUDITED FINANCIAL TRANSPARENCY</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
