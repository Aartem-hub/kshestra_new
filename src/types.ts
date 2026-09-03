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
  category: EventCategory;
  capacity: number;
  availableTickets: number;
  description: string;
  curatorNotes: string;
  featuredArtists: string[];
  coverImage: string;
  tags: string[];
  isSoldOut?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  bengaliName?: string;
  role: string;
  bengaliRole?: string;
  bio: string;
  fullBio?: string;
  portrait?: string;
  medium?: string;
  quote?: string;
  exhibitions?: string[];
  awards?: string[];
  socialLinks?: {
    instagram?: string;
    website?: string;
    archive?: string;
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
