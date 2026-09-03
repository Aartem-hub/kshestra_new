import React, { useState } from 'react';
import { EventItem, TicketPurchase, DonationRecord } from '../types';
import { StorageService } from '../services/storage';
import { generateGoogleCalendarUrl, downloadICSFile } from '../services/calendarSync';
import { audioSynth } from '../services/audioSynthesizer';
import { 
  X, 
  ShieldCheck, 
  Ticket, 
  Flame, 
  CalendarPlus, 
  Download, 
  Check, 
  QrCode, 
  CreditCard,
  Sparkles,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { KshestraLogo } from './KshestraLogo';

interface RazorpayModalProps {
  mode: 'ticket' | 'donation';
  event?: EventItem;
  donationAmount?: number;
  donationTierName?: string;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  mode,
  event,
  donationAmount = 2500,
  donationTierName,
  onClose,
  onSuccess
}) => {
  const currentUser = StorageService.getCurrentUser();

  // Ticket Form State
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>(currentUser?.name || '');
  const [buyerEmail, setBuyerEmail] = useState<string>(currentUser?.email || '');
  const [buyerPhone, setBuyerPhone] = useState<string>(currentUser?.phone || '+91 98301 22489');

  // Donation Form State
  const [donorName, setDonorName] = useState<string>(currentUser?.name || '');
  const [donorEmail, setDonorEmail] = useState<string>(currentUser?.email || '');
  const [panNumber, setPanNumber] = useState<string>('ABCDE1234F');
  const [request80G, setRequest80G] = useState<boolean>(true);

  // Status
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedPurchase, setCompletedPurchase] = useState<TicketPurchase | null>(null);
  const [completedDonation, setCompletedDonation] = useState<DonationRecord | null>(null);

  const totalAmount = mode === 'ticket' 
    ? (event ? event.price * ticketCount : 0) 
    : donationAmount;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5C1D24', '#8A8E3E', '#FFF5E9', '#8A8E3E']
      });
    } catch {}
  };

  const handleProcessPayment = () => {
    if (!buyerName && !donorName) {
      alert('Please provide your name for pass registration.');
      return;
    }
    if (!buyerEmail && !donorEmail) {
      alert('Please provide your email address for dispatch notifications.');
      return;
    }

    setIsProcessing(true);
    audioSynth.playChime();

    setTimeout(() => {
      const paymentId = 'pay_RPZ' + Math.floor(100000000 + Math.random() * 900000000);

      if (mode === 'ticket' && event) {
        const ticketCode = `KSH-${event.category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newTicket: TicketPurchase = {
          id: `tkt-${Date.now()}`,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventVenue: `${event.venue}, ${event.city}`,
          buyerName: buyerName || currentUser?.name || 'Sanctum Patron',
          buyerEmail: buyerEmail || currentUser?.email || 'patron@kshestra.com',
          buyerPhone,
          ticketCount,
          totalAmount,
          purchaseDate: new Date().toISOString().split('T')[0],
          ticketCode,
          qrData: `KSHESTRA-PASS:${ticketCode}|NAME:${buyerName}|EVT:${event.id}`,
          paymentId,
          status: 'confirmed'
        };

        StorageService.issueTicket(newTicket);
        setCompletedPurchase(newTicket);
        setIsProcessing(false);
        triggerConfetti();
        onSuccess(newTicket);
      } else {
        const newDonation: DonationRecord = {
          id: `don-${Date.now()}`,
          donorName: donorName || currentUser?.name || 'Sanctum Patron',
          donorEmail: donorEmail || currentUser?.email || 'patron@kshestra.com',
          amount: totalAmount,
          currency: 'INR',
          tierName: donationTierName || `Sanctum Contribution (₹${totalAmount})`,
          date: new Date().toISOString().split('T')[0],
          is80GRequested: request80G,
          panNumber: request80G ? panNumber : undefined,
          paymentId,
          status: 'completed'
        };

        StorageService.recordDonation(newDonation);
        setCompletedDonation(newDonation);
        setIsProcessing(false);
        triggerConfetti();
        onSuccess(newDonation);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#3A2B27]/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#FFF5E9] rounded-sm max-w-lg w-full border border-[#3A2B27]/20 shadow-2xl overflow-hidden relative text-[#3A2B27]"
      >
        {/* Header */}
        <div className="bg-[#F6EADB] text-[#3A2B27] p-6 flex items-center justify-between border-b border-[#3A2B27]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xs bg-[#FFF5E9] border border-[#3A2B27]/20 flex items-center justify-center p-1 shadow-xs shrink-0">
              <img 
                src="/assets/Kshestra Logo PNG.png" 
                alt="Kshestra Foundation Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#3A2B27]">
                {mode === 'ticket' ? 'Sanctum Gathering Pass' : 'Support the Kshestra Flame'}
              </h3>
              <p className="text-[11px] text-[#725C54] font-mono">
                Kshestra Cultural Trust (80G Non-Profit)
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

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Completed State */}
          {completedPurchase && (
            <div className="space-y-6 text-center py-2">
              <div className="w-12 h-12 bg-[#8A8E3E]/10 text-[#8A8E3E] rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif-display text-2xl font-bold text-[#3A2B27]">
                  Seat Reserved & Pass Issued
                </h4>
                <p className="text-xs text-[#725C54] font-mono">
                  Pass Reference: {completedPurchase.ticketCode}
                </p>
              </div>

              {/* Visual Archival Ticket Preview */}
              <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#3A2B27]/20 text-left space-y-3 shadow-xs">
                <div className="flex justify-between items-start border-b border-[#3A2B27]/10 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xs bg-[#FFF5E9] border border-[#3A2B27]/15 flex items-center justify-center p-0.5 shrink-0">
                      <img src="/assets/Kshestra Logo PNG.png" alt="Kshestra Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C1D24]">Kshestra Sanctuary Entry</span>
                      <h5 className="font-serif font-bold text-sm text-[#3A2B27]">{completedPurchase.eventTitle}</h5>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-[#5C1D24]">
                    {completedPurchase.ticketCount} Pass(es)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#725C54]">
                  <div>
                    <span className="text-[9px] uppercase text-[#725C54]/70 block">Time & Date</span>
                    <span className="text-[#3A2B27] font-semibold">{completedPurchase.eventDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-[#725C54]/70 block">Holder</span>
                    <span className="text-[#3A2B27] font-semibold">{completedPurchase.buyerName}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-[#8A8E3E] font-mono bg-[#FFF5E9] p-2 rounded-sm flex items-center justify-between">
                  <span>Digital Pass Added to Member Sanctuary Vault</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8A8E3E]" />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  data-cursor="pointer"
                  className="w-full py-3 text-xs font-bold uppercase rounded-sm bg-[#5C1D24] text-[#FFF5E9] hover:bg-[#431319]"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {completedDonation && (
            <div className="space-y-6 text-center py-2">
              <div className="w-12 h-12 bg-[#5C1D24]/10 text-[#5C1D24] rounded-full flex items-center justify-center mx-auto">
                <Flame className="w-6 h-6 text-[#5C1D24]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif-display text-2xl font-bold text-[#3A2B27]">
                  Thank You for Supporting the Flame
                </h4>
                <p className="text-xs text-[#725C54] font-mono">
                  Receipt: {completedDonation.paymentId} · 80G Tax Exemption Applied
                </p>
              </div>

              <div className="bg-[#FFFFFF] p-5 rounded-sm border border-[#3A2B27]/20 text-left space-y-2 text-xs">
                <div className="flex justify-between font-bold text-[#3A2B27]">
                  <span>Contribution Amount</span>
                  <span className="text-[#5C1D24]">₹{completedDonation.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#725C54]">
                  <span>Tier / Grant</span>
                  <span>{completedDonation.tierName}</span>
                </div>
                <div className="flex justify-between text-[#725C54]">
                  <span>Donor</span>
                  <span>{completedDonation.donorName}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                data-cursor="pointer"
                className="w-full py-3 text-xs font-bold uppercase rounded-sm bg-[#5C1D24] text-[#FFF5E9] hover:bg-[#431319]"
              >
                Return to Sanctuary
              </button>
            </div>
          )}

          {/* Form Mode */}
          {!completedPurchase && !completedDonation && (
            <div className="space-y-5">
              
              {mode === 'ticket' && event && (
                <div className="bg-[#F6EADB] p-4 rounded-sm border border-[#3A2B27]/10 space-y-1">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5C1D24]">
                    {event.category}
                  </div>
                  <h4 className="font-serif-display text-base font-bold text-[#3A2B27]">
                    {event.title}
                  </h4>
                  <p className="text-xs text-[#725C54] font-mono">
                    {event.date} · {event.venue}
                  </p>
                </div>
              )}

              {mode === 'donation' && (
                <div className="bg-[#F6EADB] p-4 rounded-sm border border-[#3A2B27]/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#5C1D24] font-bold block">Sanctuary Fellowship</span>
                    <span className="font-serif font-bold text-base text-[#3A2B27]">{donationTierName || 'Cultural Grant'}</span>
                  </div>
                  <div className="font-serif text-2xl font-bold text-[#5C1D24]">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              {/* User Details */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={mode === 'ticket' ? buyerName : donorName}
                    onChange={(e) => mode === 'ticket' ? setBuyerName(e.target.value) : setDonorName(e.target.value)}
                    placeholder="e.g. Suman Sengupta"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#5C1D24] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] block">
                    Email for Pass & Dispatches
                  </label>
                  <input
                    type="email"
                    value={mode === 'ticket' ? buyerEmail : donorEmail}
                    onChange={(e) => mode === 'ticket' ? setBuyerEmail(e.target.value) : setDonorEmail(e.target.value)}
                    placeholder="e.g. suman@domain.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#5C1D24] focus:outline-none"
                  />
                </div>

                {mode === 'ticket' && event && event.price > 0 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] block">
                      Number of Seats
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={ticketCount}
                        onChange={(e) => setTicketCount(parseInt(e.target.value, 10))}
                        className="px-3.5 py-2.5 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#5C1D24] focus:outline-none"
                      >
                        <option value={1}>1 Seat (₹{event.price * 1})</option>
                        <option value={2}>2 Seats (₹{event.price * 2})</option>
                        <option value={3}>3 Seats (₹{event.price * 3})</option>
                        <option value={4}>4 Seats (₹{event.price * 4})</option>
                      </select>
                      <span className="text-xs text-[#725C54] font-mono">
                        Total: <strong className="text-[#5C1D24]">₹{totalAmount}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Razorpay Simulation Disclaimer */}
              <div className="flex items-center justify-between text-[11px] text-[#725C54] bg-[#FFF5E9] p-2.5 rounded-sm border border-[#3A2B27]/10 font-mono">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  <span>Encrypted Razorpay Gateway</span>
                </span>
                <span>Direct Trust Credit</span>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProcessPayment}
                disabled={isProcessing}
                data-cursor="pointer"
                className="w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm bg-[#5C1D24] hover:bg-[#431319] text-[#FFF5E9] border border-[#3A2B27]/20 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Securing Reservation...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Confirm & Pay ₹{totalAmount}</span>
                  </>
                )}
              </button>

            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
