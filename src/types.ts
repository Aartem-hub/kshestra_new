export type EventCategory = 
  | 'Live Performance & Acoustic Poetry' 
  | 'Masterclass & Creative Technology' 
  | 'Filmmaking & Matchmaking Lab' 
  | 'Exhibition' 
  | 'Workshop' 
  | 'Baul & Sound' 
  | 'Symposium' 
  | 'Residency' 
  | 'Printmaking'
  | string;

export interface EventItem {
  id: string;
  title: string;
  bengaliTitle?: string;
  date: string;
  isoDate: string; // YYYY-MM-DD
  time: string;
  venue: string;
  city: string;
  price: number; // INR
  isPaid?: boolean;
  category: EventCategory;
  capacity: number;
  totalSeats?: number;
  availableTickets: number;
  availableSeats?: number;
  tier?: string;
  description: string;
  curatorNotes: string;
  featuredArtists: string[];
  coverImage: string;
  tags: string[];
  isSoldOut?: boolean;
  createdAt?: any;
  createdById?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  bengaliName?: string;
  role: string;
  title?: string;
  bengaliRole?: string;
  bio: string;
  fullBio?: string;
  portrait?: string;
  portraitImage?: string;
  medium?: string;
  quote?: string;
  achievements?: string[];
  exhibitions?: string[];
  awards?: string[];
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    x?: string;
    linkedin?: string;
    website?: string;
    archive?: string;
    [key: string]: string | undefined;
  };
}

export interface Artwork {
  id: string;
  title: string;
  bengaliTitle?: string;
  artist: string;
  bengaliArtist?: string;
  year?: string;
  medium?: string;
  dimensions?: string;
  image: string;
  description: string;
  provenance: string;
  category: 'Performing Arts' | 'Cinema' | 'Visual Arts' | 'Literature & Theatre' | 'Linocut' | 'Terracotta' | 'Wash Painting' | 'Mixed Media' | 'Sculpture' | 'Textile' | string;
  patronageStatus?: 'Archived' | 'Seeking Patronage' | 'Permanent Collection';
  patronageAmount?: number;
  eventGallery?: {
    eventName: string;
    date?: string;
    venue?: string;
    description?: string;
    images: Array<{ url: string; caption: string; tag?: string }>;
    videos: Array<{ url: string; poster?: string; title: string; duration?: string; description?: string }>;
  };
}

export interface GazetteArticle {
  id: string;
  title: string;
  bengaliTitle?: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  issueNumber: string;
  category: 'Cultural Commentary' | 'Craft & Production Lab' | 'Modern Toolsets' | 'Critical Theory' | 'Archival Study' | 'Artist Dialogue' | 'Bengal Modernism' | string;
  excerpt: string;
  content: string[];
  body?: string;
  markdown?: string;
  coverImage?: string;
  tags?: string[];
}

export interface DonationTier {
  id: string;
  name: string;
  bengaliName?: string;
  amount: number;
  description: string;
  benefits: string[];
  highlight?: boolean;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  tierId?: string;
  tierName?: string;
  date: string;
  is80GRequested: boolean;
  panNumber?: string;
  paymentId: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface TicketPurchase {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  ticketCount: number;
  totalAmount: number;
  purchaseDate: string;
  ticketCode: string;
  qrData: string;
  paymentId: string;
  status: 'confirmed' | 'cancelled';
}

export interface UserMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'member' | 'admin';
  isVerified: boolean;
  memberSince: string;
  city?: string;
  bio?: string;
  bookmarkedArtworkIds?: string[];
  ticketPurchases?: TicketPurchase[];
  donations?: DonationRecord[];
  calendarSyncEnabled?: boolean;
}

export interface UserPass {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  tier: 'Free RSVP' | 'Paid Pass' | string;
  isPaid: boolean;
  price: number;
  bookedAt: string;
  status: 'confirmed' | 'cancelled';
  ticketCode?: string;
  buyerName?: string;
  buyerEmail?: string;
  eventTime?: string;
  ticketCount?: number;
  totalAmount?: number;
  purchaseDate?: string;
}

export interface UserReceipt {
  orderId: string;
  eventTitle: string;
  amount: number;
  date: string;
}

export interface GrantRecord {
  id: string;
  applicantName: string;
  email: string;
  submissionDate: string;
  proposedProject: string;
  discipline: string;
  requestedAmount: number;
  status: 'Pending Review' | 'Approved' | 'Disbursed' | 'Declined';
  curatorNotes?: string;
  createdAt?: string;
}

export interface BlogRecord {
  id: string;
  title: string;
  slug?: string;
  author: string;
  publishDate: string;
  excerpt: string;
  body: string;
  content?: string;
  coverImage?: string;
  tags?: string[];
  status: 'Draft' | 'Published';
  readTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArchiveRecord {
  id: string;
  title: string;
  conclaveYear: string;
  conclaveDate?: string;
  chapter: string;
  retrospectiveEssay: string;
  primaryImage: string;
  galleryImages?: string[];
  curators?: string[];
  featuredArtists?: string[];
  mediaEmbedUrl?: string;
  createdAt?: string;
}
