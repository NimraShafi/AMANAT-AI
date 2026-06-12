# Smart Welfare Management System - Admin Portal

A high-end, production-ready admin dashboard built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## 🎨 Theme: "Emerald Slate" (High-Trust Enterprise)

- **Primary Colors**: Indigo-600 (Action), Emerald-500 (Success), Slate-900 (Deep Background)
- **Feel**: Glassmorphism effects, subtle animations (Framer Motion), dashboard cards with glowing borders
- **Features**: Dark/Light mode support, real-time data sync, responsive design

## 🏗️ Project Structure

```
smart-welfare-admin/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout with sidebar & theme provider
│   ├── page.tsx                 # Dashboard overview (analytics)
│   ├── globals.css              # Global styles & Tailwind
│   ├── dashboard/               # Dashboard route (redirects to home)
│   ├── donations/               # Donation ledger page
│   ├── review-queue/            # Review queue page
│   └── bank-statements/         # Bank statements page
├── components/
│   ├── ui/                      # Atomic UI components (Shadcn style)
│   │   ├── button.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── skeleton.tsx
│   │   └── table.tsx
│   ├── dashboard/               # Feature-specific components
│   │   ├── StatCard.tsx         # Animated stat cards with glassmorphism
│   │   ├── DonationChart.tsx    # Multi-line area chart (Recharts)
│   │   ├── FundAllocationChart.tsx  # Semi-donut pie chart
│   │   ├── RecentActivity.tsx   # Recent donations feed
│   │   ├── DonationTable.tsx    # Advanced data table with sorting/search
│   │   ├── Sidebar.tsx          # Collapsible glassmorphism sidebar
│   │   └── TopBar.tsx           # Sticky top bar with theme toggle
│   └── theme-provider.tsx       # Next-themes provider
├── lib/
│   ├── supabaseClient.ts        # Supabase client with realtime config
│   └── utils.ts                 # Utility functions (cn, formatters)
├── hooks/
│   ├── useDonations.ts          # Realtime donations hook + stats + trends
│   ├── useReviewQueue.ts        # Realtime review queue hook
│   └── useBankStatements.ts     # Realtime bank statements hook
├── types/
│   └── database.ts              # TypeScript interfaces for all tables
├── .env.local                   # Environment variables
├── tailwind.config.ts           # Custom theme config
└── package.json
```

## 🔑 Environment Variables

Create `.env.local` in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://uhzczmlourrefguqwftm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key_here
```

## 📊 Database Schema (Supabase)

### bank_statements
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| transaction_ref | text | NOT NULL |
| bank_name | text | NOT NULL |
| amount | numeric | NOT NULL |
| status | text | DEFAULT 'new' |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### donations
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| sender_number | text | NOT NULL |
| amount | numeric | NOT NULL |
| transaction_ref | text | NOT NULL |
| bank_name | text | NOT NULL |
| purpose | text | NOT NULL |
| status | text | DEFAULT 'Pending' |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

### review_queue
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PRIMARY KEY |
| donation_id | uuid | REFERENCES donations(id) |
| issue | text | NOT NULL |
| status | text | DEFAULT 'OPEN' |
| created_at | timestamptz | DEFAULT now() |
| resolved_at | timestamptz | NULL |

## ⚡ Supabase Realtime Setup

1. Go to Supabase Dashboard → Database → Replication
2. Enable Realtime for tables: `donations`, `bank_statements`, `review_queue`
3. This enables instant dashboard updates without page refresh

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## ✨ Key Features

- **Real-time Sync**: Dashboard updates instantly when n8n bot inserts/updates data
- **Glassmorphism UI**: Frosted glass effects with subtle borders
- **Animated Charts**: Area chart for donation trends, semi-donut for fund allocation
- **Advanced Tables**: Multi-column sorting, global search, pagination, status badges with glow
- **Dark/Light Mode**: Seamless theme switching with next-themes
- **Responsive Design**: Collapsible sidebar, mobile-optimized layout
- **Skeleton Loaders**: Elegant loading states for all data-driven components

## 🛠️ Tech Stack

- Next.js 14 (App Router)
- TypeScript 5.5
- Tailwind CSS 3.4
- Supabase (Realtime)
- Recharts (Visualizations)
- Framer Motion (Animations)
- Lucide React (Icons)
- next-themes (Dark/Light mode)

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard Overview (Stats, Charts, Activity) |
| `/donations` | Full Donation Ledger with search & sort |
| `/review-queue` | Failed auto-verification transactions |
| `/bank-statements` | Imported bank records & processing status |

## 🔔 Real-time Architecture

```
n8n Bot → Supabase (INSERT/UPDATE) → Supabase Realtime → Next.js Dashboard
```

- **Direct Sync**: n8n bot pushes data to Supabase
- **Pull Model**: Dashboard fetches data from Supabase
- **Push Bridge**: Supabase Realtime pushes updates to dashboard instantly
- No page refresh needed for data updates!
