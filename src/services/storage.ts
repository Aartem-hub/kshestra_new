import { EventItem, TeamMember, Artwork, GazetteArticle, UserMember, TicketPurchase, DonationRecord } from '../types';
import { INITIAL_EVENTS, INITIAL_GUARDIANS, INITIAL_GALLERY_ITEMS, INITIAL_DISPATCHES } from '../data/initialData';
import { isEmailAdmin } from './authRoles';

const STORAGE_KEYS = {
  EVENTS: 'kshestra_events_v4',
  GUARDIANS: 'kshestra_guardians_v6',
  GALLERY: 'kshestra_gallery_v2',
  DISPATCHES: 'kshestra_dispatches_v2',
  CURRENT_USER: 'kshestra_current_user_v2',
  ALL_USERS: 'kshestra_users_directory_v2',
  DONATIONS: 'kshestra_donations_ledger_v2',
  TICKETS: 'kshestra_tickets_issued_v2',
  AUDIO_PREFERENCES: 'kshestra_audio_prefs_v2',
  NEWSLETTER_SUBSCRIBERS: 'kshestra_newsletter_subscribers_v2'
};

const DEFAULT_ADMIN: UserMember = {
  id: 'usr-admin-01',
  name: 'Tamohan (Trustee Chair)',
  email: 'chairperson@kshestra.com',
  phone: '+91 98300 00192',
  role: 'admin',
  isVerified: true,
  memberSince: 'January 2026',
  city: 'Kolkata, WB',
  bio: 'Founder & Trustee Guardian with administrative stewardship over sanctums, dispatches, and funds.',
  bookmarkedArtworkIds: ['gal-01', 'gal-02', 'gal-03', 'gal-04'],
  ticketPurchases: [],
  donations: [],
  calendarSyncEnabled: true
};

export const StorageService = {
  // Events
  getEvents: (): EventItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  },

  saveEvents: (events: EventItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      window.dispatchEvent(new CustomEvent('kshestra_events_updated', { detail: events }));
    } catch {
      // Graceful silent fallback
    }
  },

  addEvent: (event: EventItem) => {
    const events = StorageService.getEvents();
    const updated = [event, ...events];
    StorageService.saveEvents(updated);
    return updated;
  },

  updateEvent: (updatedEvent: EventItem) => {
    const events = StorageService.getEvents();
    const updated = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    StorageService.saveEvents(updated);
    return updated;
  },

  deleteEvent: (eventId: string) => {
    const events = StorageService.getEvents();
    const updated = events.filter(e => e.id !== eventId);
    StorageService.saveEvents(updated);
    return updated;
  },

  // Guardians
  getGuardians: (): TeamMember[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GUARDIANS);
      return data ? JSON.parse(data) : INITIAL_GUARDIANS;
    } catch {
      return INITIAL_GUARDIANS;
    }
  },

  saveGuardians: (team: TeamMember[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.GUARDIANS, JSON.stringify(team));
    } catch {
      // Graceful silent fallback
    }
  },

  // Gallery
  getGallery: (): Artwork[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
      if (!data) return INITIAL_GALLERY_ITEMS;
      const parsed: Artwork[] = JSON.parse(data);
      return parsed.map(item => {
        const init = INITIAL_GALLERY_ITEMS.find(i => i.id === item.id);
        if (init?.eventGallery && !item.eventGallery) {
          return { ...item, eventGallery: init.eventGallery };
        }
        return item;
      });
    } catch {
      return INITIAL_GALLERY_ITEMS;
    }
  },

  saveGallery: (gallery: Artwork[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
      window.dispatchEvent(new CustomEvent('kshestra_gallery_updated', { detail: gallery }));
    } catch {
      // Graceful silent fallback
    }
  },

  // Dispatches
  getDispatches: (): GazetteArticle[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISPATCHES);
      return data ? JSON.parse(data) : INITIAL_DISPATCHES;
    } catch {
      return INITIAL_DISPATCHES;
    }
  },

  saveDispatches: (dispatches: GazetteArticle[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DISPATCHES, JSON.stringify(dispatches));
    } catch {
      // Graceful silent fallback
    }
  },

  // Users & Auth (No default logged in user - clean guest state)
  getCurrentUser: (): UserMember | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: UserMember | null) => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
      window.dispatchEvent(new CustomEvent('kshestra_auth_changed', { detail: user }));
    } catch {
      // Graceful silent fallback
    }
  },

  loginAsAdmin: (): UserMember => {
    StorageService.setCurrentUser(DEFAULT_ADMIN);
    return DEFAULT_ADMIN;
  },

  loginAsMember: (email: string, name?: string): UserMember => {
    const existing = StorageService.getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      StorageService.setCurrentUser(existing);
      return existing;
    }

    const newUser: UserMember = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email: email,
      role: isEmailAdmin(email) ? 'admin' : 'member',
      isVerified: true,
      memberSince: '2026',
      city: 'Kolkata, WB',
      bookmarkedArtworkIds: [],
      ticketPurchases: [],
      donations: [],
      calendarSyncEnabled: true
    };

    const all = StorageService.getAllUsers();
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify([...all, newUser]));
    } catch {
      // Graceful fallback
    }
    StorageService.setCurrentUser(newUser);
    return newUser;
  },

  getAllUsers: (): UserMember[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
      return data ? JSON.parse(data) : [DEFAULT_ADMIN];
    } catch {
      return [DEFAULT_ADMIN];
    }
  },

  logout: () => {
    StorageService.setCurrentUser(null);
  },

  // Tickets
  getTickets: (): TicketPurchase[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTickets: (tickets: TicketPurchase[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch {
      // Graceful silent fallback
    }
  },

  issueTicket: (ticket: TicketPurchase) => {
    try {
      const existing = StorageService.getTickets();
      const updated = [ticket, ...existing];
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(updated));

      // Decrement available tickets on event
      const events = StorageService.getEvents();
      const targetEvent = events.find(e => e.id === ticket.eventId);
      if (targetEvent) {
        targetEvent.availableTickets = Math.max(0, (targetEvent.availableTickets || 0) - ticket.ticketCount);
        StorageService.saveEvents(events);
      }

      // Add to current user if logged in
      const curUser = StorageService.getCurrentUser();
      if (curUser) {
        curUser.ticketPurchases = [ticket, ...(curUser.ticketPurchases || [])];
        StorageService.setCurrentUser(curUser);
      }

      return ticket;
    } catch {
      return ticket;
    }
  },

  // Donations
  getDonations: (): DonationRecord[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DONATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordDonation: (donation: DonationRecord) => {
    try {
      const existing = StorageService.getDonations();
      const updated = [donation, ...existing];
      localStorage.setItem(STORAGE_KEYS.DONATIONS, JSON.stringify(updated));

      // Add to current user if logged in
      const curUser = StorageService.getCurrentUser();
      if (curUser) {
        curUser.donations = [donation, ...(curUser.donations || [])];
        StorageService.setCurrentUser(curUser);
      }

      return donation;
    } catch {
      return donation;
    }
  },

  // Newsletter Subscribers
  addNewsletterSubscriber: (email: string, discipline: string) => {
    try {
      const existing = StorageService.getNewsletterSubscribers();
      if (!existing.some(s => s.email.toLowerCase() === email.toLowerCase())) {
        const updated = [{ email, discipline, subscribedAt: new Date().toISOString() }, ...existing];
        localStorage.setItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS, JSON.stringify(updated));
      }
      return true;
    } catch {
      return false;
    }
  },

  getNewsletterSubscribers: (): { email: string; discipline: string; subscribedAt: string }[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NEWSLETTER_SUBSCRIBERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Bookmarks
  toggleBookmark: (artworkId: string) => {
    const user = StorageService.getCurrentUser();
    if (!user) return false;

    const list = user.bookmarkedArtworkIds || [];
    const exists = list.includes(artworkId);
    user.bookmarkedArtworkIds = exists
      ? list.filter(id => id !== artworkId)
      : [...list, artworkId];

    StorageService.setCurrentUser(user);
    return !exists;
  },

  // Initializer
  init: () => {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.GUARDIANS)) {
        localStorage.setItem(STORAGE_KEYS.GUARDIANS, JSON.stringify(INITIAL_GUARDIANS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) {
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(INITIAL_GALLERY_ITEMS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.DISPATCHES)) {
        localStorage.setItem(STORAGE_KEYS.DISPATCHES, JSON.stringify(INITIAL_DISPATCHES));
      }
    } catch {
      // Silent in-memory fallback
    }
  }
};
