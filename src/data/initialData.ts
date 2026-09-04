import { EventItem, TeamMember, Artwork, GazetteArticle, DonationTier } from '../types';
import { KSHESTRA_BLOG_ENTRIES } from './kshestraBlogs';

export const KSHESTRA_MANIFESTO = {
  eyebrow: "FOR THE ARTIST BY THE ARTIST",
  title: "The Kshestra Manifesto",
  ourBelief: "Creativity is not a luxury — It is the oxygen of a free, liberal, and progressive society. No artist should be silenced by money, fear, or lack of opportunity, and we act as a guiding spirit for them.",
  introductoryStatement: "Creativity is not a luxury — It is the oxygen of a free, liberal, and progressive society. No artist should be silenced by money, fear, or lack of opportunity, and we act as a guiding spirit for them.",
  principles: [
    {
      num: "01",
      title: "We Create Relentlessly",
      statement: "Art is not decoration, it’s expression, rebellion, and truth.",
      tangibleMechanism: "Free access to shared video/audio production gear, studio spaces, and subsidized materials so creators never stop producing."
    },
    {
      num: "02",
      title: "We Share Knowledge Freely",
      statement: "Gatekeeping kills creativity. If we know it, we teach it.",
      tangibleMechanism: "Zero-cost, artist-led technical masterclasses on AI workflows, sound engineering, lighting, and distribution."
    },
    {
      num: "03",
      title: "We Leave Ego at the Door",
      statement: "This is a society, not a competition. Collaboration > hierarchy.",
      tangibleMechanism: "Cross-discipline mixers and rapid-crew assembly tables pairing directors, writers, editors, and painters without bureaucratic friction."
    },
    {
      num: "04",
      title: "We Celebrate the Unfinished",
      statement: "Every sketch, draft, demo, or beat is welcome. Perfection is not required.",
      tangibleMechanism: "Regular 'Draft & Demo' open mics and critique circles where raw, evolving ideas receive constructive feedback in a safe space."
    },
    {
      num: "05",
      title: "We Uplift the Marginalized",
      statement: "If you have privilege, you share it. If you have access, you open doors.",
      tangibleMechanism: "Dedicated residency quotas and travel/living micro-stipends specifically reserved for underrepresented and grassroots creators."
    },
    {
      num: "06",
      title: "We Protect Expression",
      statement: "No censorship, no judgment — unless it spreads hate or violence.",
      tangibleMechanism: "Independent editorial control and open curation slots free from corporate sponsors or institutional interference."
    },
    {
      num: "07",
      title: "We Support Each Other",
      statement: "Emotionally, professionally, and financially when we can.",
      tangibleMechanism: "Emergency artist relief micro-grants, legal contract review support, and mental health check-ins for active residents."
    },
    {
      num: "08",
      title: "We Make Art for Society",
      statement: "Creativity is not selfish — it shapes culture, sparks freedom, and drives change.",
      tangibleMechanism: "Public art interventions, open-air cultural confluences, and community-driven storytelling projects addressing real local issues."
    },
    {
      num: "09",
      title: "We Keep It Transparent",
      statement: "No shady dealings. No favouritism. What we do and how we fund it is open.",
      tangibleMechanism: "Published quarterly fund allocations, open residency selection rubrics, and direct accountability to the artistic collective."
    },
    {
      num: "10",
      title: "We Pass It Forward",
      statement: "Every generation of artists empowers the next. That’s how the movement survives.",
      tangibleMechanism: "Mandatory alumni mentorship hours and direct pathways for experienced creators to teach incoming cohorts."
    }
  ],
  ourPromise: [
    "Your art will always have a platform.",
    "Your journey will always have guidance.",
    "Your circumstances will never define your access.",
    "And your work will always be met with dignity."
  ],
  movementBadge: {
    mantra: "Create. Share. Rebel. Uplift. Repeat.",
    declaration: "This is not just a trust — it's a movement.",
    pillars: ["Belong", "Create", "Liberate"]
  },
  closingCallout: "This is not just a trust — it's a movement. Create. Share. Rebel. Uplift. Repeat."
};

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-kshestra-01",
    title: "The Unsaid Has an Address",
    date: "Sunday, September 6, 2026 · 6:30 PM IST",
    isoDate: "2026-09-06",
    time: "6:30 PM IST",
    venue: "Courtyard Amphitheatre · 91/11/1, Tollygunge, Kolkata, West Bengal 700033",
    city: "Tollygunge, Kolkata",
    price: 0,
    category: "Live Performance & Acoustic Poetry",
    capacity: 120,
    availableTickets: 38,
    description: "An unplugged evening exploring unspoken histories, forgotten verses, and personal geography through acoustic poetry and storytelling under the twilight sky.",
    curatorNotes: "91/11/1, Tollygunge, Kolkata, West Bengal 700033. Free entry sponsored by Kshestra Cultural Trust.",
    featuredArtists: ["Regional Acoustic Songwriters", "Classical Sarod Ensembles", "Spoken Word Collectives"],
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    tags: ["Live Performance & Acoustic Poetry", "Tollygunge", "Free Pass", "Acoustic Sarod & Flute"]
  },
  {
    id: "evt-kshestra-02",
    title: "Enter, Unrehearsed",
    date: "Tuesday, September 8, 2026 · 5:30 PM IST",
    isoDate: "2026-09-08",
    time: "5:30 PM IST",
    venue: "Studio Floor · 91/11/1, Tollygunge, Kolkata, West Bengal 700033",
    city: "Tollygunge, Kolkata",
    price: 0,
    category: "Filmmaking & Matchmaking Lab",
    capacity: 80,
    availableTickets: 25,
    description: "An open improvisational theatre and rapid screen-acting workshop where scripts are discarded in favor of raw instinct, spontaneous dialogue, and direct character presence.",
    curatorNotes: "Floor 2, 91/11/1, Tollygunge, Kolkata, West Bengal 700033. Open to actors, dramatists, and aspiring directors. Free Pass.",
    featuredArtists: ["Experimental Theatre Directors", "Improv Ensembles", "Indie Filmmakers"],
    coverImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
    tags: ["Filmmaking & Matchmaking Lab", "Tollygunge Studio", "Free Pass", "Theatre & Screenwriting"]
  },
  {
    id: "evt-kshestra-03",
    title: "Margins & Underlines",
    date: "Thursday, September 10, 2026 · 6:00 PM IST",
    isoDate: "2026-09-10",
    time: "6:00 PM IST",
    venue: "Sanctum Library & Archive · 91/11/1, Tollygunge, Kolkata, West Bengal 700033",
    city: "Tollygunge, Kolkata",
    price: 0,
    category: "Workshop",
    capacity: 60,
    availableTickets: 19,
    description: "A collective zine-making, independent typography, and manuscript commentary gathering celebrating voices created outside commercial mainstream publishing.",
    curatorNotes: "Archive Floor, 91/11/1, Tollygunge, Kolkata, West Bengal 700033. Free Registration supported by Kshestra Cultural Trust.",
    featuredArtists: ["Zine Publishers", "Typography Designers", "Grassroots Essayists"],
    coverImage: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
    tags: ["Workshop", "Tollygunge", "Free Pass / Trust Sponsored", "Zine & Typography"]
  },
  {
    id: "evt-kshestra-04",
    title: "Between Mudra & Memory – When Gesture Speaks",
    date: "Saturday, September 12, 2026 · 6:30 PM IST",
    isoDate: "2026-09-12",
    time: "6:30 PM IST",
    venue: "Open-Air Amphitheatre · 91/11/1, Tollygunge, Kolkata, West Bengal 700033",
    city: "Tollygunge, Kolkata",
    price: 0,
    category: "Live Performance & Acoustic Poetry",
    capacity: 150,
    availableTickets: 42,
    description: "A physical performance confluence unraveling the ancient expressive grammar of classical mudras alongside contemporary narrative movement, spoken verse, and resonant percussion.",
    curatorNotes: "Amphitheatre, 91/11/1, Tollygunge, Kolkata, West Bengal 700033. Unreserved earthen tiered seating under open sky. Free pass.",
    featuredArtists: ["Classical Dance Innovators", "Pakhawaj & Percussion Masters", "Narrative Movement Artists"],
    coverImage: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80",
    tags: ["Live Performance & Acoustic Poetry", "Movement Arts", "Free Pass", "Classical Mudras"]
  },
  {
    id: "evt-kshestra-05",
    title: "Haatey Gora",
    bengaliTitle: "হাতে গড়া",
    date: "Tuesday, September 15, 2026 · 4:00 PM IST",
    isoDate: "2026-09-15",
    time: "4:00 PM IST",
    venue: "Pottery & Sculpture Courtyard · 91/11/1, Tollygunge, Kolkata, West Bengal 700033",
    city: "Tollygunge, Kolkata",
    price: 0,
    category: "Masterclass & Creative Technology",
    capacity: 50,
    availableTickets: 14,
    description: "A tactile clay, terracotta, and natural pigment workshop mentored by generational Kumartuli idol-makers and contemporary experimental ceramic sculptors.",
    curatorNotes: "91/11/1, Tollygunge, Kolkata, West Bengal 700033. Clay, modeling tools, and firings provided at no cost by the Trust.",
    featuredArtists: ["Kumartuli Master Sculptors", "Contemporary Ceramic Artists", "Indigenous Pigment Chemists"],
    coverImage: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
    tags: ["Masterclass & Creative Technology", "Kumartuli Heritage", "Free Pass / Trust Sponsored", "Terracotta & Clay"]
  },
  {
    id: "evt-kshestra-06",
    title: "Pass the Tune",
    date: "Thursday, September 17, 2026 · 6:30 PM IST",
    isoDate: "2026-09-17",
    time: "6:30 PM IST",
    venue: "Rooftop Acoustic Sanctum · 91/11/1, Tollygunge, Kolkata, West Bengal 700033",
    city: "Tollygunge, Kolkata",
    price: 0,
    category: "Baul & Sound",
    capacity: 90,
    availableTickets: 31,
    description: "A participatory folk, Baul, and acoustic jamming circle where melodies, rhythm patterns, and songs are passed around the circle from creator to creator.",
    curatorNotes: "Rooftop Sanctum, 91/11/1, Tollygunge, Kolkata, West Bengal 700033. Bring your acoustic instrument or just your voice. Free pass.",
    featuredArtists: ["Baul Folk Practitioners", "Dotara & Khamak Players", "Acoustic Vocalists"],
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    tags: ["Baul & Sound", "Tollygunge", "Free Community Pass", "Acoustic Jam"]
  }
];

export const INITIAL_GALLERY_ITEMS: Artwork[] = [
  {
    id: "gal-01",
    title: "Echoes of the Soil",
    artist: "Monsoon Confluence Ensemble",
    year: "2026",
    medium: "Live Acoustic & Ambient Soundscape",
    dimensions: "South Kolkata Courtyard",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    description: "Traditional folk instrumentalists in communion with modern ambient synthesizers at the Monsoon Confluence.",
    provenance: "Gathering #04 · Performing Arts · Kolkata Courtyard",
    category: "Performing Arts",
    patronageStatus: "Permanent Collection",
    eventGallery: {
      eventName: "Monsoon Confluence: Echoes of the Soil (Gathering #04)",
      date: "August 2026",
      venue: "Courtyard Amphitheatre, 91/11/1 Tollygunge, Kolkata",
      description: "A documented live multi-instrumental session uniting folk Dotara, Khamak, Sarod, and ambient drone synthesizers before an intimate circle of 120 listeners.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
          caption: "Live stage setup during twilight performance under open lanterns",
          tag: "Performance"
        },
        {
          url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
          caption: "Sarod and acoustic flute tuning session in the green room courtyard",
          tag: "Backstage"
        },
        {
          url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
          caption: "Audience and resident artists in silent listening circle",
          tag: "Gathering"
        },
        {
          url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
          caption: "Ambient sound console and modular synthesizer patching session",
          tag: "Sound Design"
        }
      ],
      videos: [
        {
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
          title: "Monsoon Confluence · Live Unplugged Improvisation",
          duration: "3:42",
          description: "Archive capture of the raga improvisations and acoustic transitions recorded direct from the sanctuary mixing desk."
        }
      ]
    }
  },
  {
    id: "gal-02",
    title: "Before the First Take",
    artist: "48-Hour Indie Film Collective",
    year: "2026",
    medium: "Cinematography & Scene Blocking",
    dimensions: "Tollygunge Studio Sanctum",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=80",
    description: "Directors and camera operators refining scene blocking during the 48-Hour Indie Film Lab.",
    provenance: "Production Workshop #02 · Cinema · Tollygunge Studio Floor",
    category: "Cinema",
    patronageStatus: "Archived",
    eventGallery: {
      eventName: "48-Hour Indie Filmmaking & Matchmaking Lab #02",
      date: "July 2026",
      venue: "Floor 2 Soundstage, 91/11/1 Tollygunge, Kolkata",
      description: "Documentary documentation from the zero-budget film lab where 6 short narratives were blocked, shot on cinema cameras, and color-graded in 48 hours.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
          caption: "Director of Photography checking aperture on vintage anamorphic glass",
          tag: "Cinematography"
        },
        {
          url: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80",
          caption: "Actors rehearsing emotional confrontation on the studio floor",
          tag: "Rehearsal"
        },
        {
          url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80",
          caption: "Lighting grid setup using warm tungsten lanterns and flags",
          tag: "Lighting"
        },
        {
          url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
          caption: "Color grading suite review and timeline editing session",
          tag: "Post-Production"
        }
      ],
      videos: [
        {
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
          poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
          title: "Behind the Lens · 48-Hour Lab Documentary Reel",
          duration: "2:55",
          description: "Behind-the-scenes cinematography reel capturing the raw rush of shooting indie films without gatekeepers."
        }
      ]
    }
  },
  {
    id: "gal-03",
    title: "Unfinished Terracottas",
    artist: "Grassroots Artisans Collective",
    year: "2026",
    medium: "Hand-molded Clay & Experimental Ceramic",
    dimensions: "Sanctum Gallery Display",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80",
    description: "Fine art residency exhibition showcasing experimental ceramic and canvas work by grassroots artisans.",
    provenance: "Residency Cycle Autumn · Visual Arts · Sanctum Gallery",
    category: "Visual Arts",
    patronageStatus: "Seeking Patronage",
    patronageAmount: 25000,
    eventGallery: {
      eventName: "Living Earth: Terracotta & Ceramic Residency Cycle",
      date: "June 2026",
      venue: "Main Vault Gallery, 91/11/1 Tollygunge, Kolkata",
      description: "A showcase of traditional Bishnupur clay techniques merged with contemporary sculptural forms, fired in the sanctum kiln.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
          caption: "Hand-turned terracotta sculptures cooling after first kiln firing",
          tag: "Ceramics"
        },
        {
          url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80",
          caption: "Artisan engraving intricate geometric motifs on unfired clay pots",
          tag: "Detail"
        },
        {
          url: "https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=1200&q=80",
          caption: "Gallery installation view with spotlights and museum plinths",
          tag: "Exhibition"
        }
      ],
      videos: [
        {
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
          poster: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
          title: "Hands in the Clay · Artisans at Work",
          duration: "2:18",
          description: "Meditative visual footage documenting the spinning wheel and clay kneading process in the open workshop."
        }
      ]
    }
  },
  {
    id: "gal-04",
    title: "The Circle of Voices",
    artist: "Writers & Dramatists Circle",
    year: "2026",
    medium: "Manuscript Reading & Spoken Word",
    dimensions: "Open Amphitheatre Sanctum",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=80",
    description: "Poets and dramatists sharing original manuscripts under lantern light before open critique.",
    provenance: "Confluence #07 · Literature & Theatre · Open Amphitheatre",
    category: "Literature & Theatre",
    patronageStatus: "Permanent Collection",
    eventGallery: {
      eventName: "Confluence #07: Literature, Theatre & Spoken Word",
      date: "May 2026",
      venue: "Open Amphitheatre, 91/11/1 Tollygunge, Kolkata",
      description: "An evocative evening of unreleased plays, dissident poetry in Bengali and English, and improvisational reading circles under the night sky.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
          caption: "Poet reciting verses from handwritten notebook in the illuminated pavilion",
          tag: "Spoken Word"
        },
        {
          url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
          caption: "Manuscript exchange and critical editorial round-table",
          tag: "Critique"
        },
        {
          url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
          caption: "Fellow artists gathered on earthen steps listening in twilight",
          tag: "Community"
        }
      ],
      videos: [
        {
          url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
          poster: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
          title: "The Midnight Recitation · Confluence #07",
          duration: "3:10",
          description: "Live recording of the culminating theatrical dialogue recited without amplification."
        }
      ]
    }
  }
];

export const INITIAL_GUARDIANS: TeamMember[] = [
  {
    id: "guard-01",
    name: "Tamohan",
    role: "Founder & Chief Visionary",
    title: "Founder & Chief Visionary",
    portrait: "/assets/Images/tamohan.png",
    portraitImage: "/assets/Images/tamohan.png",
    medium: "Filmmaking, Cultural Strategy, Sanctum Architecture",
    quote: "Art is not a luxury, an afterthought, or an idle hobby. It is the fundamental architecture of human conscience.",
    bio: "A cultural strategist, independent filmmaker, and social entrepreneur committed to dismantling gatekept institutional networks. Tamohan conceived Kshestra as a direct sanctuary response to the systemic economic isolation faced by grassroots makers in South Asia. Under his guidance, the Trust established its physical production residency and open-access amphitheatre in South Kolkata, championing non-extractive patronage where creators retain 100% intellectual ownership of their work.",
    fullBio: "Tamohan has championed decentralized cultural spaces across South Asia. His focus centers on eliminating the middleman between independent makers and real production resources.",
    achievements: [
      "Conceived and established Kshestra Cultural Trust and its South Kolkata Sanctum",
      "Curated over 40 zero-fee independent residency programs and communal gatherings",
      "Pioneered the 'Dignity in Craft' micro-stipend and emergency studio endowment model",
      "Keynote speaker on decentralized creative infrastructure at Asian Cultural Forum"
    ],
    socialLinks: {
      instagram: "https://instagram.com/tamohan",
      x: "https://x.com/tamohan",
      twitter: "https://twitter.com/tamohan",
      linkedin: "https://linkedin.com/in/tamohan",
      website: "https://kshestra.org",
      archive: "https://kshestra.org/archive/tamohan"
    }
  },
  {
    id: "guard-02",
    name: "Oindrila",
    role: "Chairperson & Cultural Curator",
    title: "Chairperson & Cultural Curator",
    portrait: "/assets/Images/oindrila.png",
    portraitImage: "/assets/Images/oindrila.png",
    medium: "Curatorial Direction, Visual Arts & Living Archives",
    quote: "We preserve indigenous memory not by locking it in glass cabinets, but by placing it in the hands of hungry young creators.",
    bio: "Visual artist, cultural anthropologist, and creative director dedicated to the conservation of indigenous heritage arts and avant-garde multidisciplinary experimentation. Oindrila steers Kshestra's curatorial direction, archival documentation, and annual festival gatherings, with specialized emphasis on Bengal's folk traditions, indigenous earth pigments, and oral poetry.",
    fullBio: "Oindrila coordinates our regional research circles, indigenous pigment labs, and seasonal open-air exhibitions.",
    achievements: [
      "Lead Curator of the annual 'Monsoon Confluence' live arts symposium",
      "Established the Kumartuli Heritage Clay & Natural Mineral Pigment Research Lab",
      "Curated 25+ independent visual art showcases highlighting marginalized folk practitioners",
      "Recipient of the National Bengal Heritage Cultural Stewardship Fellowship"
    ],
    socialLinks: {
      instagram: "https://instagram.com/oindrila",
      linkedin: "https://linkedin.com/in/oindrila",
      website: "https://kshestra.org",
      archive: "https://kshestra.org/archive/oindrila"
    }
  },
  {
    id: "guard-03",
    name: "Nayanika",
    role: "Vice Chairperson & Community Director",
    title: "Vice Chairperson & Community Director",
    portrait: "/assets/Images/nayanika.png",
    portraitImage: "/assets/Images/nayanika.png",
    medium: "Literature, Community Organizing, Creative Outreach",
    quote: "Great art is born in communion. When we tear down isolation, the creative impulse becomes unstoppable.",
    bio: "Author, creative organizer, and community architect specializing in grassroots cultural alliances. Nayanika oversees Kshestra's regional outreach, member growth, and nationwide creator matchmaking initiatives. Her programs actively connect rural master craftspersons with urban digital technologists, breaking geographical silos to foster reciprocal artistic partnerships.",
    fullBio: "Nayanika designs our cross-discipline matchmaking circles and manages relationships with regional artist guilds.",
    achievements: [
      "Architect of Kshestra's 2,000+ member cross-discipline Creator Matchmaking Network",
      "Organized 18 cross-state literary symposiums and collaborative writer-in-residence retreats",
      "Established regional grassroots partnerships across 6 eastern Indian states",
      "Author of the critically acclaimed cultural anthology 'Voices from the Courtyard'"
    ],
    socialLinks: {
      instagram: "https://instagram.com/nayanika",
      x: "https://x.com/nayanika",
      twitter: "https://twitter.com/nayanika",
      linkedin: "https://linkedin.com/in/nayanika",
      archive: "https://kshestra.org/archive/nayanika"
    }
  },
  {
    id: "guard-04",
    name: "Shubhadeep",
    role: "General Secretary & Systems Architect",
    title: "General Secretary & Systems Architect",
    portrait: "/assets/Images/shubhadeep.png",
    portraitImage: "/assets/Images/shubhadeep.png",
    medium: "Digital Governance, Media Archiving, Open Platforms",
    quote: "Technology is a tool of liberation. We build systems that automate the tedium so artists can stay in flow.",
    bio: "Technology consultant, media archivist, and open-source advocate. Shubhadeep manages the digital governance, open registries, and real-time community platforms powering Kshestra. His work focuses on cryptographic transparency for charitable donations, decentralized media preservation, and zero-fee artist discovery engines that operate free from corporate algorithmic bias.",
    fullBio: "Shubhadeep builds open-source digital infrastructure for decentralized archiving and zero-fee artist discovery.",
    achievements: [
      "Engineered Kshestra's open-access Digital Ledger and Real-Time Seat Allocation Engine",
      "Built the decentralized Media Preservation Vault for rare folk audio and oral histories",
      "Developed open-source tooling for trust transparency and 100% auditable public ledger",
      "Invited speaker on Decentralized Cultural Archives at FOSS Asia"
    ],
    socialLinks: {
      x: "https://x.com/shubhadeep",
      twitter: "https://twitter.com/shubhadeep",
      linkedin: "https://linkedin.com/in/shubhadeep",
      website: "https://github.com/kshestra",
      archive: "https://kshestra.org/archive/shubhadeep"
    }
  },
  {
    id: "guard-05",
    name: "Vireshwar",
    role: "Treasurer & Financial Custodian",
    title: "Treasurer & Financial Custodian",
    portrait: "/assets/Images/vira.png",
    portraitImage: "/assets/Images/vira.png",
    medium: "Fiscal Stewardship, Non-Profit Governance, Micro-Grants",
    quote: "Dignity in craft begins with economic stability. Every contribution is accounted for down to the last rupee.",
    bio: "Financial strategist, compliance auditor, and advocate for sustainable arts economies. Vireshwar oversees the fiduciary health of the Trust, managing the allocation of public donations, micro-production grants, and institutional financial disclosures. He ensures Kshestra's rigorous zero-leakage policy, guaranteeing that patron contributions go directly to maker resources and sanctuary operations.",
    fullBio: "Vireshwar enforces strict 100% transparent fiscal oversight, micro-stipend disbursements, and trust compliance.",
    achievements: [
      "Maintained 100% clean audit ratings for Kshestra Cultural Trust since inception",
      "Disbursed over ₹18 Lakhs in direct micro-grants and emergency creative stipends",
      "Structured the Trust's Permanent Creative Endowment and fiscal sustainability charter",
      "Architect of Kshestra's publicly accessible real-time donation verification framework"
    ],
    socialLinks: {
      linkedin: "https://linkedin.com/in/vireshwar",
      x: "https://x.com/vireshwar",
      twitter: "https://twitter.com/vireshwar",
      website: "https://kshestra.org",
      archive: "https://kshestra.org/archive/vireshwar"
    }
  },
  {
    id: "guard-06",
    name: "Aryan",
    role: "Head of Artist Relations & Talent Liaison",
    title: "Head of Artist Relations & Talent Liaison",
    portrait: "/assets/Images/Aryan.png",
    portraitImage: "/assets/Images/Aryan.png",
    medium: "Theatre Arts, Talent Coordination, Mentorship Liaison",
    quote: "No passionate creator should ever have to stand outside the door wondering if their voice belongs.",
    bio: "Theatre practitioner, performer, and talent coordinator. Aryan serves as the personal liaison between incoming creators, masterclass mentors, and visiting independent studio directors. His open-door policy at the Kolkata sanctum ensures that aspiring practitioners receive warm guidance, mentorship access, and immediate integration into active community productions.",
    fullBio: "Aryan runs the weekly matchmaking circles and rapid-crew assembly tables at the Kolkata sanctum.",
    achievements: [
      "Facilitated casting and production crew assembly for 30+ independent productions",
      "Curator of the weekly 'Circle of Practice' unscripted theatre and performance jams",
      "Mentored 150+ emergent dramatists and physical performers entering the Kolkata arts scene",
      "Directed critically acclaimed regional stage performance 'Rong o Rekha' (Color & Line)"
    ],
    socialLinks: {
      instagram: "https://instagram.com/aryan",
      x: "https://x.com/aryan",
      twitter: "https://twitter.com/aryan",
      linkedin: "https://linkedin.com/in/aryan",
      archive: "https://kshestra.org/archive/aryan"
    }
  },
  {
    id: "guard-07",
    name: "Sayan",
    role: "Design Lead & Head of Visual Identity",
    title: "Design Lead & Head of Visual Identity",
    portrait: "/assets/Images/Sayan.png",
    portraitImage: "/assets/Images/Sayan.png",
    medium: "Brand Systems, Typography, Spatial Design & Saypollo",
    quote: "Aesthetics are not superficial decoration; they are the physical manifestation of our collective soul.",
    bio: "Multidisciplinary visual designer, typographer, and founder of design studio Saypollo. Sayan architects Kshestra's visual language, spatial signage, print gazettes, and digital touchpoints. His aesthetic philosophy marries traditional Indian printmaking, terracotta textures, and Bengali script aesthetics with contemporary editorial layout and responsive digital craft.",
    fullBio: "Sayan oversees all visual languages, typography pairings, physical sanctum spatial signage, and printed dispatches.",
    achievements: [
      "Creator of Kshestra's distinctive visual identity system, typography pairings, and seals",
      "Founder & Principal Designer at Saypollo Design Studio",
      "Designer of the printed Autumn Gazette and bespoke Sanctum Architectural Signage",
      "Featured in International Design Biennale for indigenous vernacular typography"
    ],
    socialLinks: {
      instagram: "https://instagram.com/sayan",
      x: "https://x.com/sayan",
      twitter: "https://twitter.com/sayan",
      linkedin: "https://linkedin.com/in/sayan",
      website: "https://saypollo.com",
      archive: "https://kshestra.org/archive/sayan"
    }
  }
];

export const INITIAL_DISPATCHES: GazetteArticle[] = KSHESTRA_BLOG_ENTRIES.map((blog, idx) => ({
  id: blog.id,
  title: blog.title,
  author: blog.author,
  authorRole: blog.author.includes('Oindrila') ? 'Chairperson, Kshestra' : 'Editorial Collective',
  date: blog.publishDate ? new Date(blog.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Autumn 2026',
  readTime: blog.readTime || '6–8 Min Read',
  issueNumber: `Dispatch #${String(idx + 1).padStart(2, '0')}`,
  category: (blog.tags && blog.tags.length > 0 ? blog.tags[0] : 'Cultural Commentary') as any,
  excerpt: blog.excerpt,
  content: blog.body ? blog.body.split('\n\n').filter(Boolean) : [blog.excerpt],
  body: blog.body,
  markdown: blog.body,
  coverImage: blog.coverImage,
  tags: blog.tags
}));

export const INITIAL_DONATION_TIERS: DonationTier[] = [
  {
    id: "tier-ember",
    name: "Kindle the Flame",
    amount: 500,
    description: "Provides basic raw art supplies (canvases, gouache, clay, microphone cables) for one resident student.",
    benefits: [
      "Name acknowledged in Digital Benefactors Registry",
      "Bi-weekly Dispatches & Field Journals",
      "Immediate 80G Tax Exemption Receipt"
    ]
  },
  {
    id: "tier-studio",
    name: "Sanctum Studio Patron",
    amount: 2500,
    description: "Funds 50 hours of free rehearsal space, audio recording gear, and workshop materials for grassroots creators.",
    benefits: [
      "All previous benefits",
      "VIP Invitation to all intimate Gathering previews",
      "Exclusive seasonal printed Dispatch booklet by Saypollo",
      "Direct meet-and-greet with resident fellowship artists"
    ],
    highlight: true
  },
  {
    id: "tier-fellowship",
    name: "Creator Fellowship Guardian",
    amount: 10000,
    description: "Funds an entire 3-month living stipend and production budget for an emerging independent creator.",
    benefits: [
      "All previous benefits",
      "Dedicated patron credit on one completed indie film/exhibition",
      "Permanent engraved plaque at Kolkata Sanctum",
      "Private annual dinner with Trustees & Guardians"
    ]
  }
];
