/* Site content: pages, links and projects. Edit this file to update the portfolio. */
window.SITE = {
  name: "Digvijay Singh",
  email: "digvijaysingh5360@gmail.com",
  github: "digvijay165",
  leetcode: "DIGVIJAY5360",
  links: {
    github: "https://github.com/digvijay165",
    linkedin: "https://www.linkedin.com/in/digvijay-singh-a188b1382/",
    leetcode: "https://leetcode.com/u/DIGVIJAY5360/",
    instagram: "https://www.instagram.com/digvijay.singh_",
  },

  // Order here is the order of the nav and of the previous / next bridges
  pages: [
    { id: "home", href: "index.html", title: "Home", icon: "home", blurb: "Where it all connects" },
    { id: "about", href: "about.html", title: "About", icon: "user", blurb: "Who I am and what drives me" },
    { id: "journey", href: "journey.html", title: "Journey", icon: "route", blurb: "How each project led to the next" },
    { id: "skills", href: "skills.html", title: "Skills", icon: "layers", blurb: "The stack, linked to real projects" },
    { id: "projects", href: "projects.html", title: "Projects", icon: "grid", blurb: "Everything I've built and shipped" },
    { id: "code", href: "code.html", title: "Code", icon: "code", blurb: "Live stats from GitHub and LeetCode" },
    { id: "contact", href: "contact.html", title: "Contact", icon: "chat", blurb: "Let's build something together" },
  ],

  // category: fullstack | frontend | tool
  projects: [
    {
      slug: "himvoya", title: "Himvoya", kind: "Travel planner", category: "fullstack", color: "#22d3ee", emoji: "🏔️",
      image: "assets/projects/himvoya.webp", featured: true,
      live: "https://himvoya-travel-planner.onrender.com/", code: "https://github.com/digvijay165/himvoya-travel-planner",
      summary: "India-first travel planner with 106 destination guides, maps, live weather and a day-by-day trip planner.",
      points: [
        "106 destination guides, including 30 Himalayan and hill treks",
        "800+ verified photos, maps and live weather for every stop",
        "Accounts and a day-by-day trip planner",
      ],
      tech: ["React", "TypeScript", "Tailwind", "Express", "SQLite"],
    },
    {
      slug: "shelfspace", title: "Shelfspace", kind: "3D book reader", category: "fullstack", color: "#f59e0b", emoji: "📚",
      image: "assets/projects/shelfspace.webp", featured: true,
      live: "https://shelfspace-u4i2.onrender.com", code: "https://github.com/digvijay165/Shelfspace",
      summary: "A cozy book library with a 3D page-turning reader, soft paper sounds and an admin-approved community shelf.",
      points: [
        "Real 3D page turns with paper sounds, built without a framework",
        "Community shelf where readers submit books for admin approval",
        "No build step: the whole front-end is plain JavaScript",
      ],
      tech: ["JavaScript", "Node.js", "PostgreSQL"],
    },
    {
      slug: "little-lantern-cafe", title: "Little Lantern Café", kind: "Café & ordering", category: "fullstack", color: "#fb923c", emoji: "☕",
      image: "assets/projects/little-lantern-cafe.webp", featured: true,
      live: "https://little-lantern-cafe.onrender.com", code: "https://github.com/digvijay165/cafe-website",
      summary: "Café website with menu, hours, map and order-ahead pickup slots, plus a live staff dashboard for orders and sales.",
      points: [
        "Order-ahead pickup with time slots",
        "Staff dashboard for incoming orders and daily sales",
        "Containerised with Docker and backed by PostgreSQL",
      ],
      tech: ["React", "Bootstrap", "Node.js", "PostgreSQL", "Docker"],
    },
    {
      slug: "forgeflow", title: "ForgeFlow", kind: "GST billing", category: "tool", color: "#34d399", emoji: "🧾",
      image: "assets/projects/forgeflow.webp", featured: true,
      live: "https://digvijay165.github.io/ForgeFlow-Workshop-Billing/", code: "https://github.com/digvijay165/ForgeFlow-Workshop-Billing",
      summary: "GST billing, stock, purchases and reports for machine-parts workshops. Type a part number, press Enter, and MRP and GST fill in.",
      points: [
        "Built for a real machine-parts workshop",
        "Local-first storage with IndexedDB, plus Supabase",
        "Invoices, stock, purchases and GST reports in one place",
      ],
      tech: ["JavaScript", "IndexedDB", "Supabase"],
    },
    {
      slug: "bookstore", title: "Online Bookstore & Reader", kind: "Bookstore platform", category: "fullstack", color: "#a78bfa", emoji: "📖",
      image: "assets/projects/bookstore.webp", featured: true,
      live: "https://online-bookstore-and-reader-platform.onrender.com", code: "https://github.com/digvijay165/Online-bookstore-and-reader-platform",
      summary: "A bookstore with 541 titles, 246 free classics in an online reader, community publishing with editor review, and two-step verification.",
      points: [
        "541 titles across textbooks, comics and magazines",
        "Free Reader Zone with 246 public-domain classics",
        "Community publishing with editor review and 2FA security",
      ],
      tech: ["JavaScript", "Node.js", "Express", "SQLite"],
    },
    {
      slug: "terra-trust", title: "Terra Trust", kind: "SIH 2026 · Civic-tech", category: "frontend", color: "#10b981", emoji: "🏛️",
      image: "assets/projects/terra-trust.webp", featured: true,
      live: "https://terra-trust.onrender.com", code: null, // source is private
      summary: "Smart India Hackathon 2026 prototype: AI-verified land records with khasra search, a GIS map pin, an application tracker and EN / हिंदी.",
      points: [
        "Search land records by name, village or khasra number",
        "GIS map pin and scan preview for every record",
        "Live 4-stage application tracker with an English / Hindi toggle",
      ],
      tech: ["React", "JavaScript"],
    },
    {
      slug: "mosaic-market", title: "Mosaic Market", kind: "Storefront", category: "frontend", color: "#f472b6", emoji: "🛍️",
      live: "https://mosaic-market-alpha.vercel.app/", code: "https://github.com/digvijay165/mosaic-market",
      summary: "A responsive React storefront with search, filters, favourites and a cart.",
      points: ["Instant search and category filters", "Favourites and a cart", "Deployed on Vercel"],
      tech: ["React", "JavaScript"],
    },
    {
      slug: "pulse-player", title: "Pulse Player", kind: "Music player", category: "frontend", color: "#c084fc", emoji: "🎧",
      live: "https://pulse-player-0rdw.onrender.com/", code: "https://github.com/digvijay165/pulse-player",
      summary: "Browser music discovery on the iTunes Search API, with a reorderable queue, speed control and favourites.",
      points: ["Reorderable queue, shuffle and repeat", "0.5× to 4× playback speed", "Keyboard shortcuts and on-device favourites"],
      tech: ["JavaScript", "REST API"],
    },
    {
      slug: "rewear", title: "Rewear", kind: "Wardrobe stylist", category: "frontend", color: "#fda4af", emoji: "👗",
      live: "https://digvijay165.github.io/rewear-wardrobe-stylist/", code: "https://github.com/digvijay165/rewear-wardrobe-stylist",
      summary: "Plan outfits and rediscover clothes you already own.",
      points: ["Builds outfits from clothes you already own", "Runs entirely in the browser"],
      tech: ["JavaScript"],
    },
    {
      slug: "calcu", title: "Calcu", kind: "Scientific calculator", category: "tool", color: "#38bdf8", emoji: "🧮",
      live: "https://calculator-7rgb.onrender.com", code: "https://github.com/digvijay165/calculator",
      summary: "Scientific calculator with trig, logs, memory keys, a 40-entry history and light / dark themes.",
      points: ["Trig, logs, factorials and DEG / RAD modes", "Memory keys and a 40-entry history", "Light and dark themes"],
      tech: ["JavaScript"],
    },
    {
      slug: "portfolio", title: "This portfolio", kind: "Portfolio", category: "frontend", color: "#7c5cff", emoji: "✨",
      live: "https://digvijay165.github.io/portfolio/", code: "https://github.com/digvijay165/portfolio",
      summary: "The site you're on: interlinked glass pages, cross-page transitions, live GitHub and LeetCode data. No framework, no build step.",
      points: ["Custom web components for the shared header, footer and menus", "Cross-document view transitions between pages", "Live data from the GitHub and LeetCode APIs"],
      tech: ["JavaScript"],
    },
  ],
};
