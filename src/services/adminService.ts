import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { GrantRecord, BlogRecord, ArchiveRecord, UserPass } from '../types';
import { isEmailAdmin } from './authRoles';
import { INITIAL_DISPATCHES } from '../data/initialData';
import { KSHESTRA_BLOG_ENTRIES } from '../data/kshestraBlogs';

export const GRANTS_COLLECTION = 'grants';
export const BLOGS_COLLECTION = 'blogs';
export const ARCHIVES_COLLECTION = 'archives';
export const USERS_COLLECTION = 'users';

const INITIAL_GRANTS: GrantRecord[] = [
  {
    id: 'grt-101',
    applicantName: 'Abir Sengupta',
    email: 'abir.sengupta@residency.in',
    submissionDate: '2026-08-12',
    proposedProject: 'Folk Instrument Sound Archive: Preserving vanishing Baul Dotara acoustic sessions',
    discipline: 'Sound & Oral History',
    requestedAmount: 25000,
    status: 'Disbursed',
    curatorNotes: 'First tranche released. High curatorial value for open-source library.',
    createdAt: '2026-08-12T10:30:00Z'
  },
  {
    id: 'grt-102',
    applicantName: 'Priyanka Mitra',
    email: 'priyanka.mitra@craftlab.org',
    submissionDate: '2026-08-20',
    proposedProject: 'Vernacular Clay Typography & Terracotta Relief Installation in Tollygunge',
    discipline: 'Visual Arts & Sculpture',
    requestedAmount: 18000,
    status: 'Approved',
    curatorNotes: 'Approved by Curatorial Committee. Materials procurement voucher issued.',
    createdAt: '2026-08-20T14:15:00Z'
  },
  {
    id: 'grt-103',
    applicantName: 'Debashis Roy',
    email: 'debashis.films@kolkatacinema.com',
    submissionDate: '2026-08-29',
    proposedProject: 'Rivers of Sundarbans: 16mm Regional Docu-Short on climate resilience',
    discipline: 'Cinema & Documentary',
    requestedAmount: 45000,
    status: 'Pending Review',
    curatorNotes: 'Awaiting rough cut treatment and equipment hire schedule from applicant.',
    createdAt: '2026-08-29T09:00:00Z'
  },
  {
    id: 'grt-104',
    applicantName: 'Tanvi Mukherjee',
    email: 'tanvi.textiles@bengalcraft.in',
    submissionDate: '2026-09-02',
    proposedProject: 'Organic Indigo & Madder Dye Preservation Workshops for Grassroots Weavers',
    discipline: 'Indigenous Craft & Weaving',
    requestedAmount: 15000,
    status: 'Pending Review',
    curatorNotes: 'Under review by Vireshwar (Treasurer). High community impact.',
    createdAt: '2026-09-02T11:45:00Z'
  }
];

const INITIAL_ARCHIVES: ArchiveRecord[] = [
  {
    id: 'arc-2024-01',
    title: 'Kolkata Winter Conclave 2024: The Unfinished Work',
    conclaveYear: '2024',
    conclaveDate: 'December 14–16, 2024',
    chapter: 'Kolkata Sanctum 2024',
    retrospectiveEssay: 'Our inaugural multi-disciplinary conclave brought together 120 grassroots printmakers, filmmakers, and folk instrumentalists over three chilly winter nights at the Tollygunge Courtyard. Over twenty unfinished prototypes were shared without ego, resulting in three enduring collaborative production partnerships.',
    primaryImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80'
    ],
    curators: ['Oindrila', 'Dr. Arnab Sen', 'Sayan'],
    featuredArtists: ['Anirban Roy', 'Moumita Sen', 'Kolkata Acoustic Collective'],
    mediaEmbedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    createdAt: '2024-12-20T10:00:00Z'
  },
  {
    id: 'arc-2025-01',
    title: 'Bhoomi: Indigenous Clay & Vernacular Sculpture Retrospective',
    conclaveYear: '2025',
    conclaveDate: 'March 22–24, 2025',
    chapter: 'Kumartuli Chapter 2025',
    retrospectiveEssay: 'An immersive 48-hour hands-on residency embedded directly within the ancestral clay studios of North Kolkata. Resident creators learned mineral pigment extraction and unglazed terracotta firing techniques, challenging the boundaries between ritual idol-making and contemporary public art installations.',
    primaryImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1569074187119-c87815b476da?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
    ],
    curators: ['Oindrila', 'Vireshwar'],
    featuredArtists: ['Kumartuli Guild Masters', 'Priyanka Mitra', 'Sneha Paul'],
    mediaEmbedUrl: 'https://soundcloud.com',
    createdAt: '2025-03-28T12:00:00Z'
  },
  {
    id: 'arc-2025-02',
    title: 'Celluloid Shadows: Regional Cinema & Color Grading Conclave',
    conclaveYear: '2025',
    conclaveDate: 'July 18–19, 2025',
    chapter: 'Tollygunge Studio Conclave 2025',
    retrospectiveEssay: 'Focused entirely on demystifying post-production workflows for independent Bengali and Eastern regional filmmakers. Participants collaborated in 4K editing and live audio mastering suites, analyzing slow-cinema pacing and the emotional resonance of natural light.',
    primaryImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'
    ],
    curators: ['Debashis Roy', 'Shubhadeep'],
    featuredArtists: ['Kolkata Indie Cutters', 'Bitan Banerjee'],
    mediaEmbedUrl: 'https://vimeo.com',
    createdAt: '2025-07-22T14:30:00Z'
  }
];

// Helper to seed collections if first-time initialized
let hasSeededGrants = false;
let hasSeededBlogs = false;
let hasSeededArchives = false;

/* =========================================================================
   1. GRANTS LEDGER MANAGEMENT
   ========================================================================= */

export async function fetchGrants(): Promise<GrantRecord[]> {
  try {
    const grantsCol = collection(db, GRANTS_COLLECTION);
    const snap = await getDocs(grantsCol);
    if (snap.empty && !hasSeededGrants) {
      hasSeededGrants = true;
      // Seed initial grants
      const seeded: GrantRecord[] = [];
      for (const item of INITIAL_GRANTS) {
        await setDoc(doc(db, GRANTS_COLLECTION, item.id), item);
        seeded.push(item);
      }
      return seeded;
    }
    const results: GrantRecord[] = [];
    snap.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...docSnap.data() } as GrantRecord);
    });
    return results.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
  } catch (err) {
    console.warn('Error querying Firestore grants, using local records:', err);
    return INITIAL_GRANTS;
  }
}

export function subscribeToGrants(onUpdate: (grants: GrantRecord[]) => void): () => void {
  try {
    const grantsCol = collection(db, GRANTS_COLLECTION);
    return onSnapshot(grantsCol, (snap) => {
      if (snap.empty && !hasSeededGrants) {
        hasSeededGrants = true;
        INITIAL_GRANTS.forEach(async (item) => {
          await setDoc(doc(db, GRANTS_COLLECTION, item.id), item);
        });
        onUpdate(INITIAL_GRANTS);
        return;
      }
      const list: GrantRecord[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as GrantRecord);
      });
      list.sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());
      onUpdate(list);
    }, (err) => {
      console.warn('Grants subscription failed, using fallback:', err);
      onUpdate(INITIAL_GRANTS);
    });
  } catch {
    onUpdate(INITIAL_GRANTS);
    return () => {};
  }
}

export async function createGrantRecord(grantData: Omit<GrantRecord, 'id' | 'createdAt'>): Promise<GrantRecord> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to log grants.');
  }

  const id = `grt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const fullRecord: GrantRecord = {
    ...grantData,
    id,
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, GRANTS_COLLECTION, id), fullRecord);
  return fullRecord;
}

export async function updateGrantStatus(
  grantId: string, 
  status: GrantRecord['status'], 
  curatorNotes?: string
): Promise<void> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to update grant statuses.');
  }

  const docRef = doc(db, GRANTS_COLLECTION, grantId);
  const payload: any = { status };
  if (curatorNotes !== undefined) {
    payload.curatorNotes = curatorNotes;
  }
  await updateDoc(docRef, payload);
}

export async function deleteGrantRecord(grantId: string): Promise<void> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to delete grant records.');
  }
  await deleteDoc(doc(db, GRANTS_COLLECTION, grantId));
}

/* =========================================================================
   2. CHRONICLES & BLOG MANAGEMENT
   ========================================================================= */

export async function fetchBlogs(): Promise<BlogRecord[]> {
  try {
    const blogsCol = collection(db, BLOGS_COLLECTION);
    const snap = await getDocs(blogsCol);
    if (snap.empty && !hasSeededBlogs) {
      hasSeededBlogs = true;
      const seeded: BlogRecord[] = [];
      for (const blog of KSHESTRA_BLOG_ENTRIES) {
        await setDoc(doc(db, BLOGS_COLLECTION, blog.id), blog);
        seeded.push(blog);
      }
      return seeded;
    }
    const results: BlogRecord[] = [];
    snap.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...docSnap.data() } as BlogRecord);
    });
    return results.sort((a, b) => (b.publishDate || b.createdAt || '').localeCompare(a.publishDate || a.createdAt || ''));
  } catch (err) {
    console.warn('Error querying blogs, fallback to initial:', err);
    return KSHESTRA_BLOG_ENTRIES;
  }
}

export async function seedAllBlogEntries(overwrite = false): Promise<number> {
  let count = 0;
  for (const blog of KSHESTRA_BLOG_ENTRIES) {
    const docRef = doc(db, BLOGS_COLLECTION, blog.id);
    const snap = await getDoc(docRef);
    if (!snap.exists() || overwrite) {
      await setDoc(docRef, blog, { merge: !overwrite });
      count++;
    }
  }
  return count;
}

export function subscribeToBlogs(onUpdate: (blogs: BlogRecord[]) => void): () => void {
  try {
    const blogsCol = collection(db, BLOGS_COLLECTION);
    return onSnapshot(blogsCol, async (snap) => {
      if (snap.empty && !hasSeededBlogs) {
        hasSeededBlogs = true;
        for (const blog of KSHESTRA_BLOG_ENTRIES) {
          await setDoc(doc(db, BLOGS_COLLECTION, blog.id), blog);
        }
      }
      const list: BlogRecord[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as BlogRecord);
      });
      // Fallback if list is empty
      if (list.length === 0) {
        list.push(...KSHESTRA_BLOG_ENTRIES);
      }
      list.sort((a, b) => (b.publishDate || b.createdAt || '').localeCompare(a.publishDate || a.createdAt || ''));
      onUpdate(list);
    }, (err) => {
      console.warn('Blogs subscription error:', err);
      onUpdate(KSHESTRA_BLOG_ENTRIES);
    });
  } catch {
    onUpdate(KSHESTRA_BLOG_ENTRIES);
    return () => {};
  }
}

export async function createBlogRecord(blogData: Omit<BlogRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogRecord> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to publish dispatches.');
  }

  const id = `dsp-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();
  const slug = blogData.slug || blogData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || id;

  const record: BlogRecord = {
    ...blogData,
    id,
    slug,
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, BLOGS_COLLECTION, id), record);
  return record;
}

export async function updateBlogRecord(blogId: string, updatedData: Partial<BlogRecord>): Promise<void> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to edit dispatches.');
  }

  const docRef = doc(db, BLOGS_COLLECTION, blogId);
  await setDoc(docRef, {
    ...updatedData,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function deleteBlogRecord(blogId: string): Promise<void> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to delete dispatches.');
  }
  await deleteDoc(doc(db, BLOGS_COLLECTION, blogId));
}

/* =========================================================================
   3. THE LIVING ARCHIVE MANAGEMENT (Past Gatherings)
   ========================================================================= */

export async function fetchArchives(): Promise<ArchiveRecord[]> {
  try {
    const archivesCol = collection(db, ARCHIVES_COLLECTION);
    const snap = await getDocs(archivesCol);
    if (snap.empty && !hasSeededArchives) {
      hasSeededArchives = true;
      const seeded: ArchiveRecord[] = [];
      for (const item of INITIAL_ARCHIVES) {
        await setDoc(doc(db, ARCHIVES_COLLECTION, item.id), item);
        seeded.push(item);
      }
      return seeded;
    }
    const results: ArchiveRecord[] = [];
    snap.forEach((docSnap) => {
      results.push({ id: docSnap.id, ...docSnap.data() } as ArchiveRecord);
    });
    return results.sort((a, b) => (b.conclaveYear || '').localeCompare(a.conclaveYear || ''));
  } catch (err) {
    console.warn('Error querying archives, using fallback:', err);
    return INITIAL_ARCHIVES;
  }
}

export function subscribeToArchives(onUpdate: (archives: ArchiveRecord[]) => void): () => void {
  try {
    const archivesCol = collection(db, ARCHIVES_COLLECTION);
    return onSnapshot(archivesCol, (snap) => {
      if (snap.empty && !hasSeededArchives) {
        hasSeededArchives = true;
        INITIAL_ARCHIVES.forEach(async (item) => {
          await setDoc(doc(db, ARCHIVES_COLLECTION, item.id), item);
        });
        onUpdate(INITIAL_ARCHIVES);
        return;
      }
      const list: ArchiveRecord[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ArchiveRecord);
      });
      list.sort((a, b) => (b.conclaveYear || '').localeCompare(a.conclaveYear || ''));
      onUpdate(list);
    }, (err) => {
      console.warn('Archives subscription error:', err);
      onUpdate(INITIAL_ARCHIVES);
    });
  } catch {
    onUpdate(INITIAL_ARCHIVES);
    return () => {};
  }
}

export async function createArchiveRecord(archiveData: Omit<ArchiveRecord, 'id' | 'createdAt'>): Promise<ArchiveRecord> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to inscribe archives.');
  }

  const id = `arc-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const record: ArchiveRecord = {
    ...archiveData,
    id,
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, ARCHIVES_COLLECTION, id), record);
  return record;
}

export async function updateArchiveRecord(archiveId: string, updatedData: Partial<ArchiveRecord>): Promise<void> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to edit archives.');
  }

  const docRef = doc(db, ARCHIVES_COLLECTION, archiveId);
  await setDoc(docRef, updatedData, { merge: true });
}

export async function deleteArchiveRecord(archiveId: string): Promise<void> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to delete archives.');
  }
  await deleteDoc(doc(db, ARCHIVES_COLLECTION, archiveId));
}

/* =========================================================================
   4. RESIDENT CREATOR & USER PROFILE MANAGEMENT
   ========================================================================= */

export async function updateUserProfile(
  uid: string, 
  updates: {
    name?: string;
    residentSince?: string;
    location?: string;
    role?: string;
  }
): Promise<void> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to edit resident creators.');
  }

  const userRef = doc(db, USERS_COLLECTION, uid);
  await setDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export async function fetchUserPasses(uid: string): Promise<UserPass[]> {
  try {
    // 1. Try fetching from subcollection
    const passesCol = collection(db, USERS_COLLECTION, uid, 'passes');
    const snap = await getDocs(passesCol);
    if (!snap.empty) {
      const list: UserPass[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as UserPass));
      return list;
    }

    // 2. Fallback to passes array in user document
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (Array.isArray(data.passes)) {
        return data.passes;
      }
    }
    return [];
  } catch (err) {
    console.warn('Error querying passes for user', uid, err);
    return [];
  }
}

export async function revokeUserPass(uid: string, passId: string): Promise<void> {
  const currentEmail = auth.currentUser?.email;
  if (!currentEmail || !isEmailAdmin(currentEmail)) {
    throw new Error('Clearing Denied: Administrative authority required to revoke passes.');
  }

  // 1. Update subcollection doc if exists
  try {
    const passRef = doc(db, USERS_COLLECTION, uid, 'passes', passId);
    await setDoc(passRef, { status: 'cancelled', revokedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Subcollection pass update failed:', err);
  }

  // 2. Also update array inside user doc
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (Array.isArray(userData.passes)) {
        const updatedPasses = userData.passes.map((p: any) => 
          (p.id === passId) ? { ...p, status: 'cancelled', revokedAt: new Date().toISOString() } : p
        );
        await updateDoc(userRef, { passes: updatedPasses });
      }
    }
  } catch (err) {
    console.warn('User doc array pass revocation failed:', err);
  }
}
