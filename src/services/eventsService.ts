import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { EventItem, UserPass, UserReceipt } from '../types';
import { INITIAL_EVENTS } from '../data/initialData';
import { isEmailAdmin } from './authRoles';
import { StorageService } from './storage';

export const EVENTS_COLLECTION = 'events';

/**
 * Maps a Firestore document data object into an application EventItem
 */
export function mapFirestoreToEventItem(id: string, data: any): EventItem {
  const totalSeats = Number(data.totalSeats || data.capacity || 50);
  const availableSeats = typeof data.availableSeats === 'number' 
    ? data.availableSeats 
    : (typeof data.availableTickets === 'number' ? data.availableTickets : totalSeats);
  const isPaid = typeof data.isPaid === 'boolean' 
    ? data.isPaid 
    : (typeof data.price === 'number' && data.price > 0);
  const price = isPaid ? Number(data.price || 0) : 0;

  return {
    id,
    title: data.title || 'Sanctuary Confluence',
    bengaliTitle: data.bengaliTitle || '',
    date: data.date || 'Upcoming',
    isoDate: data.isoDate || '2026-10-10',
    time: data.time || '6:00 PM IST',
    venue: data.venue || 'Kshestra Courtyard, Tollygunge',
    city: data.city || 'Tollygunge, Kolkata',
    price,
    isPaid,
    tier: isPaid ? 'Paid Pass' : 'Free RSVP',
    category: data.category || 'Live Performance & Acoustic Poetry',
    capacity: totalSeats,
    totalSeats,
    availableTickets: availableSeats,
    availableSeats,
    description: data.description || 'Independent artist gathering hosted by Kshestra Cultural Trust.',
    curatorNotes: data.curatorNotes || 'Free entry supported by Kshestra Cultural Trust.',
    featuredArtists: Array.isArray(data.featuredArtists) ? data.featuredArtists : ['Resident Artists'],
    coverImage: data.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    tags: Array.isArray(data.tags) ? data.tags : ['Confluence'],
    isSoldOut: availableSeats <= 0,
    createdAt: data.createdAt || null,
    createdById: data.createdById || null
  };
}

/**
 * Seed initial events to Firestore if collection is empty or initial events are missing
 */
let hasAttemptedSeed = false;
export async function seedInitialEventsIfEmpty(): Promise<void> {
  if (hasAttemptedSeed) return;
  hasAttemptedSeed = true;

  try {
    for (const initEvt of INITIAL_EVENTS) {
      const evtRef = doc(db, EVENTS_COLLECTION, initEvt.id);
      const snap = await getDoc(evtRef);
      if (!snap.exists()) {
        const isPaid = initEvt.price > 0;
        await setDoc(evtRef, {
          title: initEvt.title,
          bengaliTitle: initEvt.bengaliTitle || '',
          date: initEvt.date,
          isoDate: initEvt.isoDate,
          time: initEvt.time,
          venue: initEvt.venue,
          city: initEvt.city,
          price: initEvt.price,
          isPaid,
          category: initEvt.category,
          capacity: initEvt.capacity,
          totalSeats: initEvt.capacity,
          availableTickets: initEvt.availableTickets,
          availableSeats: initEvt.availableTickets,
          description: initEvt.description,
          curatorNotes: initEvt.curatorNotes,
          featuredArtists: initEvt.featuredArtists,
          coverImage: initEvt.coverImage,
          tags: initEvt.tags,
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (err) {
    console.warn('Initial events sync notice (using cached events):', err);
  }
}

/**
 * Live subscription to Firestore events collection with fallback to initial data
 */
export function subscribeToEvents(callback: (events: EventItem[]) => void): () => void {
  // Start background seeding if needed
  seedInitialEventsIfEmpty();

  const eventsCol = collection(db, EVENTS_COLLECTION);
  const unsubscribe = onSnapshot(
    eventsCol,
    (snapshot) => {
      if (snapshot.empty) {
        // Fallback to initial events
        callback(INITIAL_EVENTS);
        return;
      }

      const firestoreEvents: EventItem[] = [];
      snapshot.forEach((docSnap) => {
        firestoreEvents.push(mapFirestoreToEventItem(docSnap.id, docSnap.data()));
      });

      // Sort by date or id
      firestoreEvents.sort((a, b) => (a.isoDate || '').localeCompare(b.isoDate || ''));
      
      // Update local storage cache
      try {
        localStorage.setItem('kshestra_events_v4', JSON.stringify(firestoreEvents));
      } catch (e) {
        // ignore storage errors
      }

      callback(firestoreEvents);
    },
    (err) => {
      console.warn('Events onSnapshot error, falling back to local cache:', err);
      callback(StorageService.getEvents());
    }
  );

  return unsubscribe;
}

/**
 * Admin Creation: Adds a gathering event directly to Firestore 'events' collection
 */
export async function createAdminEvent(eventData: {
  title: string;
  date: string;
  time?: string;
  venue: string;
  description: string;
  isPaid: boolean;
  price: number;
  totalSeats: number;
  category?: string;
  coverImage?: string;
}): Promise<EventItem> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Access Clearance Denied: Only authorized trustees may publish gatherings to the sanctuary ledger.');
  }

  const eventId = `evt-ksh-${Date.now()}`;
  const totalSeats = Number(eventData.totalSeats) || 50;
  const isPaid = Boolean(eventData.isPaid);
  const price = isPaid ? Number(eventData.price || 0) : 0;

  const newRecord = {
    title: eventData.title.trim(),
    bengaliTitle: '',
    date: eventData.date.trim(),
    isoDate: '2026-11-14',
    time: eventData.time?.trim() || '6:00 PM IST',
    venue: eventData.venue.trim(),
    city: 'Tollygunge, Kolkata',
    isPaid,
    price,
    category: eventData.category || 'Live Performance & Acoustic Poetry',
    capacity: totalSeats,
    totalSeats,
    availableTickets: totalSeats,
    availableSeats: totalSeats,
    description: eventData.description.trim() || 'Kshestra gathering organized by the Trust.',
    curatorNotes: 'Official Kshestra Sanctuary Confluence.',
    featuredArtists: ['Kshestra Resident Artists'],
    coverImage: eventData.coverImage || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    tags: [isPaid ? 'Paid Pass' : 'Free RSVP', 'Sanctuary Gathering'],
    createdAt: new Date().toISOString(),
    createdById: auth.currentUser?.uid || null
  };

  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await setDoc(docRef, newRecord);

  const mapped = mapFirestoreToEventItem(eventId, newRecord);
  StorageService.addEvent(mapped);
  return mapped;
}

/**
 * Admin Deletion: Removes an event from Firestore
 */
export async function deleteAdminEvent(eventId: string): Promise<void> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Access Clearance Denied: Only authorized trustees may modify gatherings.');
  }
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  await deleteDoc(docRef);
  StorageService.deleteEvent(eventId);
}

/**
 * Atomically book a gathering pass with live inventory decrement in Firestore
 */
export async function bookEventPass(
  event: EventItem,
  buyerDetails: {
    name: string;
    email: string;
    phone?: string;
  }
): Promise<{ pass: UserPass; receipt: UserReceipt }> {
  const user = auth.currentUser;
  
  // Gate check: Real authentication required
  if (!user || !user.uid) {
    throw new Error('Official record-keeping requires verified membership. Please authenticate using Google or Email to secure gathering passes.');
  }

  // Prevent mock / preview logins
  if (user.email === 'resident@kshestra.com' || user.uid.startsWith('usr-')) {
    throw new Error('Official record-keeping requires verified membership. Please authenticate using Google or Email to secure gathering passes.');
  }

  const eventRef = doc(db, EVENTS_COLLECTION, event.id);
  const userRef = doc(db, 'users', user.uid);

  const passId = `pass-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const orderId = `ord-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const isPaid = Boolean(event.isPaid || event.price > 0);
  const price = isPaid ? (event.price || 0) : 0;

  const newPass: UserPass = {
    id: passId,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.date,
    venue: event.venue,
    tier: isPaid ? 'Paid Pass' : 'Free RSVP',
    isPaid,
    price,
    bookedAt: new Date().toISOString(),
    status: 'confirmed',
    ticketCode: `KSH-${event.category?.substring(0, 3)?.toUpperCase() || 'EVT'}-${Math.floor(1000 + Math.random() * 9000)}`,
    buyerName: buyerDetails.name.trim() || user.displayName || 'Resident Creator',
    buyerEmail: buyerDetails.email.trim() || user.email || '',
    eventTime: event.time,
    ticketCount: 1,
    totalAmount: price,
    purchaseDate: new Date().toISOString().split('T')[0]
  };

  const newReceipt: UserReceipt = {
    orderId,
    eventTitle: event.title,
    amount: price,
    date: new Date().toISOString()
  };

  // Run atomic Firestore transaction
  await runTransaction(db, async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    
    let currentAvailable: number;

    if (!eventDoc.exists()) {
      // If doc didn't exist yet, seed it with event.capacity
      const initialCapacity = event.capacity || event.totalSeats || 50;
      currentAvailable = initialCapacity;
      transaction.set(eventRef, {
        title: event.title,
        bengaliTitle: event.bengaliTitle || '',
        date: event.date,
        isoDate: event.isoDate || '2026-10-10',
        time: event.time,
        venue: event.venue,
        city: event.city || 'Tollygunge, Kolkata',
        price,
        isPaid,
        category: event.category,
        capacity: initialCapacity,
        totalSeats: initialCapacity,
        availableTickets: initialCapacity,
        availableSeats: initialCapacity,
        description: event.description,
        curatorNotes: event.curatorNotes || '',
        featuredArtists: event.featuredArtists || [],
        coverImage: event.coverImage || '',
        tags: event.tags || [],
        createdAt: new Date().toISOString()
      });
    } else {
      const data = eventDoc.data();
      currentAvailable = typeof data.availableSeats === 'number'
        ? data.availableSeats
        : (typeof data.availableTickets === 'number' ? data.availableTickets : (data.totalSeats || data.capacity || 50));
    }

    if (currentAvailable <= 0) {
      throw new Error('Gathering at Capacity');
    }

    // Decrement availableSeats
    const updatedSeats = currentAvailable - 1;
    transaction.update(eventRef, {
      availableSeats: updatedSeats,
      availableTickets: updatedSeats
    });

    // Read or initialize user doc
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists()) {
      transaction.set(userRef, {
        name: buyerDetails.name.trim() || user.displayName || 'Resident Creator',
        email: user.email || '',
        location: 'Kolkata, WB',
        residentSince: '2026',
        passes: [newPass],
        receipts: [newReceipt],
        createdAt: new Date().toISOString()
      });
    } else {
      const userData = userDoc.data();
      const existingPasses = Array.isArray(userData.passes) ? userData.passes : [];
      const existingReceipts = Array.isArray(userData.receipts) ? userData.receipts : [];

      transaction.update(userRef, {
        passes: [...existingPasses, newPass],
        receipts: [...existingReceipts, newReceipt]
      });
    }

    // Also persist into subcollections for granular query access
    const passSubRef = doc(db, 'users', user.uid, 'passes', passId);
    const receiptSubRef = doc(db, 'users', user.uid, 'receipts', orderId);
    transaction.set(passSubRef, newPass);
    transaction.set(receiptSubRef, newReceipt);
  });

  // Local storage synchronization for instant UI feedback
  try {
    StorageService.issueTicket({
      id: passId,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      buyerName: newPass.buyerName || '',
      buyerEmail: newPass.buyerEmail || '',
      buyerPhone: buyerDetails.phone || '',
      ticketCount: 1,
      totalAmount: price,
      purchaseDate: new Date().toISOString().split('T')[0],
      ticketCode: newPass.ticketCode || 'KSH-PASS',
      qrData: `KSHESTRA:${passId}:${event.id}`,
      paymentId: orderId,
      status: 'confirmed'
    });
  } catch (e) {
    // ignore
  }

  return { pass: newPass, receipt: newReceipt };
}

/**
 * Cancel a reservation for a free event and atomically return the seat to inventory
 */
export async function cancelEventReservation(
  pass: UserPass,
  uid: string
): Promise<void> {
  if (pass.isPaid || pass.price > 0) {
    throw new Error('Paid entry is non-refundable. Non-cancellable.');
  }

  const eventRef = doc(db, EVENTS_COLLECTION, pass.eventId);
  const userRef = doc(db, 'users', uid);
  const passSubRef = doc(db, 'users', uid, 'passes', pass.id);

  await runTransaction(db, async (transaction) => {
    // 1. Read event doc & increment available seats
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists()) {
      const data = eventDoc.data();
      const currentAvailable = typeof data.availableSeats === 'number'
        ? data.availableSeats
        : (typeof data.availableTickets === 'number' ? data.availableTickets : 0);
      const totalSeats = typeof data.totalSeats === 'number' ? data.totalSeats : (data.capacity || 100);
      const newAvailable = Math.min(totalSeats, currentAvailable + 1);

      transaction.update(eventRef, {
        availableSeats: newAvailable,
        availableTickets: newAvailable
      });
    }

    // 2. Read user doc & mark pass as cancelled
    const userDoc = await transaction.get(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const existingPasses: any[] = Array.isArray(userData.passes) ? userData.passes : [];
      const updatedPasses = existingPasses.map((p) => {
        if (p.id === pass.id) {
          return { ...p, status: 'cancelled' };
        }
        return p;
      });

      transaction.update(userRef, {
        passes: updatedPasses
      });
    }

    // 3. Update subcollection document
    transaction.update(passSubRef, { status: 'cancelled' });
  });

  // Notify listeners locally
  window.dispatchEvent(new CustomEvent('kshestra_pass_cancelled', { detail: { passId: pass.id } }));
}
