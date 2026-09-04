import React, { useState } from 'react';
import { EventItem, TicketPurchase, DonationRecord } from '../types';
import { StorageService } from '../services/storage';
import { generateGoogleCalendarUrl, downloadICSFile } from '../services/calendarSync';
import { audioSynth } from '../services/audioSynthesizer';
import { auth } from '../firebase';
import { bookEventPass } from '../services/eventsService';
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
  FileCheck,
  AlertCircle,
  LogIn
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
  onOpenAuth?: (notice?: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  mode,
  event,
  donationAmount = 2500,
  donationTierName,
  onClose,
  onSuccess,
  onOpenAuth
}) => {
  const currentUser = StorageService.getCurrentUser();
  const firebaseUser = auth.currentUser;

  // Ticket Form State
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [buyerName, setBuyerName] = useState<string>(
    currentUser?.name || firebaseUser?.displayName || ''
  );
  const [buyerEmail, setBuyerEmail] = useState<string>(
    currentUser?.email || firebaseUser?.email || ''
  );
  const [buyerPhone, setBuyerPhone] = useState<string>(currentUser?.phone || '+91 98301 22489');

  // Donation Form State
  const [donorName, setDonorName] = useState<string>(
    currentUser?.name || firebaseUser?.displayName || ''
  );
  const [donorEmail, setDonorEmail] = useState<string>(
    currentUser?.email || firebaseUser?.email || ''
  );
  const [panNumber, setPanNumber] = useState<string>('ABCDE1234F');
  const [request80G, setRequest80G] = useState<boolean>(true);

  // Status
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [completedPurchase, setCompletedPurchase] = useState<TicketPurchase | null>(null);
  const [completedDonation, setCompletedDonation] = useState<DonationRecord | null>(null);

  const isSoldOut = Boolean(
    mode === 'ticket' && 
    event && 
    (
      event.isSoldOut || 
      (typeof event.availableSeats === 'number' && event.availableSeats <= 0) ||
      (typeof event.availableTickets === 'number' && event.availableTickets <= 0)
    )
  );

  const totalAmount = mode === 'ticket' 
    ? (event ? (event.price || 0) * ticketCount : 0) 
    : donationAmount;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#471319', '#8A8E3E', '#FFF5E9', '#8A8E3E']
      });
    } catch {}
  };

  const handleProcessPayment = async () => {
    setBookingError(null);

    if (isSoldOut) {
      setBookingError('Gathering at Capacity');
      return;
    }

    if (!buyerName && !donorName) {
      setBookingError('Please provide your name for pass registration.');
      return;
    }
    if (!buyerEmail && !donorEmail) {
      setBookingError('Please provide your email address for dispatch notifications.');
      return;
    }

    if (mode === 'ticket' && event) {
      // Gate check: Verified auth
      const currentFb = auth.currentUser;
      if (!currentFb || !currentFb.uid) {
        setBookingError('Official record-keeping requires verified membership. Please authenticate using Google or Email to secure gathering passes.');
        return;
      }

      if (currentFb.email === 'resident@kshestra.com' || currentFb.uid.startsWith('usr-')) {
        setBookingError('Instant Resident Creator Session is available for exploring the prototype, but cannot be used to decrement live sanctuary capacity. Please authenticate using Google or Email to secure gathering passes.');
        return;
      }
    }

    setIsProcessing(true);
    audioSynth.playChime();

    if (mode === 'ticket' && event) {
      try {
        const { pass } = await bookEventPass(event, {
          name: buyerName || 'Resident Creator',
          email: buyerEmail || 'patron@kshestra.com',
          phone: buyerPhone
        });

        const newTicket: TicketPurchase = {
          id: pass.id,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventVenue: `${event.venue}, ${event.city}`,
          buyerName: pass.buyerName || buyerName,
          buyerEmail: pass.buyerEmail || buyerEmail,
          buyerPhone,
          ticketCount,
          totalAmount,
          purchaseDate: pass.purchaseDate || new Date().toISOString().split('T')[0],
          ticketCode: pass.ticketCode || 'KSH-PASS',
          qrData: `KSHESTRA-PASS:${pass.ticketCode}|NAME:${buyerName}|EVT:${event.id}`,
          paymentId: pass.id,
          status: 'confirmed'
        };

        setCompletedPurchase(newTicket);
        setIsProcessing(false);
        triggerConfetti();
        onSuccess(newTicket);
      } catch (err: any) {
        setIsProcessing(false);
        const msg = err?.message || 'Failed to complete reservation';
        if (msg.includes('Gathering at Capacity')) {
          setBookingError('Gathering at Capacity');
        } else {
          setBookingError(msg);
        }
      }
      return;
    }

    // Donation Flow
    setTimeout(() => {
      const paymentId = 'pay_RPZ' + Math.floor(100000000 + Math.random() * 900000000);
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
    }, 900);
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
            className="p-1.5 hover:bg-[#471319]/10 rounded-sm text-[#3A2B27] transition-colors"
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
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#471319]">Kshestra Sanctuary Entry</span>
                      <h5 className="font-serif font-bold text-sm text-[#3A2B27]">{completedPurchase.eventTitle}</h5>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-[#471319]">
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
                  className="w-full py-3 text-xs font-bold uppercase rounded-sm bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {completedDonation && (
            <div className="space-y-6 text-center py-2">
              <div className="w-12 h-12 bg-[#471319]/10 text-[#471319] rounded-full flex items-center justify-center mx-auto">
                <Flame className="w-6 h-6 text-[#471319]" />
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
                  <span className="text-[#471319]">₹{completedDonation.amount.toLocaleString('en-IN')}</span>
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
                className="w-full py-3 text-xs font-bold uppercase rounded-sm bg-[#471319] text-[#FFF5E9] hover:bg-[#471319]"
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
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#471319]">
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
                    <span className="text-[10px] font-mono uppercase text-[#471319] font-bold block">Sanctuary Fellowship</span>
                    <span className="font-serif font-bold text-base text-[#3A2B27]">{donationTierName || 'Cultural Grant'}</span>
                  </div>
                  <div className="font-serif text-2xl font-bold text-[#471319]">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              {/* User Details */}
              <div className="space-y-3">
                {/* Booking Notice / Error Banner */}
                {bookingError && (
                  <div className="bg-[#471319]/10 border border-[#471319]/30 rounded-sm p-3.5 space-y-2 text-xs text-[#3A2B27]">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#471319] mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] uppercase font-bold text-[#471319] tracking-wider block">
                          Reservation Notice
                        </span>
                        <p className="font-sans leading-relaxed text-[#3A2B27]">
                          {bookingError}
                        </p>
                      </div>
                    </div>
                    {onOpenAuth && bookingError.includes('verified membership') && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenAuth(bookingError);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#471319] text-[#FFF5E9] font-mono text-[10px] uppercase font-bold tracking-wider rounded-xs hover:bg-[#3A2B27] transition-colors"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Authenticate with Google / Email</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={mode === 'ticket' ? buyerName : donorName}
                    onChange={(e) => mode === 'ticket' ? setBuyerName(e.target.value) : setDonorName(e.target.value)}
                    placeholder="e.g. Suman Sengupta"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#471319] focus:outline-none"
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
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#471319] focus:outline-none"
                  />
                </div>

                {mode === 'ticket' && event && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#725C54] block">
                      Number of Seats
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        value={ticketCount}
                        onChange={(e) => setTicketCount(parseInt(e.target.value, 10))}
                        disabled={isSoldOut}
                        className="px-3.5 py-2.5 text-xs bg-[#FFFFFF] border border-[#3A2B27]/20 rounded-sm focus:border-[#471319] focus:outline-none disabled:opacity-50"
                      >
                        <option value={1}>1 Seat {event.price > 0 ? `(₹${event.price * 1})` : '(Free Pass)'}</option>
                        <option value={2}>2 Seats {event.price > 0 ? `(₹${event.price * 2})` : '(Free Pass)'}</option>
                        <option value={3}>3 Seats {event.price > 0 ? `(₹${event.price * 3})` : '(Free Pass)'}</option>
                        <option value={4}>4 Seats {event.price > 0 ? `(₹${event.price * 4})` : '(Free Pass)'}</option>
                      </select>
                      <span className="text-xs text-[#725C54] font-mono">
                        Total: <strong className="text-[#471319]">{totalAmount === 0 ? 'Free (Trust Sponsored)' : `₹${totalAmount}`}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gateway / Sanctuary Trust Disclaimer */}
              <div className="flex items-center justify-between text-[11px] text-[#725C54] bg-[#FFF5E9] p-2.5 rounded-sm border border-[#3A2B27]/10 font-mono">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8A8E3E]" />
                  <span>{totalAmount === 0 ? 'Trust Sponsored Pass' : 'Encrypted Razorpay Gateway'}</span>
                </span>
                <span>{totalAmount === 0 ? 'Tollygunge Sanctum' : 'Direct Trust Credit'}</span>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProcessPayment}
                disabled={isProcessing || isSoldOut}
                data-cursor="pointer"
                className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm border transition-all shadow-md flex items-center justify-center gap-2 ${
                  isSoldOut
                    ? 'bg-[#3A2B27]/20 text-[#725C54] border-[#3A2B27]/20 cursor-not-allowed'
                    : 'bg-[#471319] hover:bg-[#3A2B27] text-[#FFF5E9] border-[#3A2B27]/20'
                }`}
              >
                {isProcessing ? (
                  <span>Securing Reservation...</span>
                ) : isSoldOut ? (
                  <span>Gathering at Capacity</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>{mode === 'ticket' && totalAmount === 0 ? 'Confirm Free Pass Reservation' : `Confirm & Pay ₹${totalAmount}`}</span>
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
