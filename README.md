🚀 NearbyKaam – Hyperlocal Job & Worker Matching Platform

A mobile-first job marketplace that connects local employers and nearby workers instantly.

Employers can post jobs, promote listings, and contact workers, while workers can discover jobs using filters, voice search, distance, and profile matching.

Built with React + TypeScript + Tailwind, optimized for low-end devices + fast local hiring.

✨ Features
👷 Worker Side

Browse jobs by category

Distance-based filtering (GPS)

Voice search (multi-language)

Experience filters

Promoted jobs near you

Profile + resume upload

Audio resume support

Call & WhatsApp contact

🧑‍💼 Employer Side

Post jobs with OTP verification

Add shop photo

Contact tracking (calls/WhatsApp count)

Promote jobs with radius targeting

View matching workers

Audio resume playback

Employer profile persistence

⚙️ System Features

Mobile-first responsive UI

Offline mock data support

LocalStorage persistence

Multi-language support

Smart job sorting (distance + verified + newest)

Clean modular architecture

🛠 Tech Stack
Layer	Tech
Frontend	React + TypeScript + Vite
Styling	Tailwind CSS
State	React Hooks
Voice	Web Speech API
AI Parsing	Google Gemini API
Storage	LocalStorage
Deployment	Vercel
📂 Project Structure
src/
 ├── components/      # UI components (cards, drawers, grids)
 ├── views/           # WorkerView, EmployerView
 ├── services/        # Gemini, promotions, utils
 ├── constants/       # Mock data & static configs
 ├── context/         # Language context
 ├── types/           # TypeScript interfaces
 ├── utils/           # Helpers & filters

🧠 Architecture Overview
User → View (Worker/Employer)
        ↓
    Filters/Voice/Location
        ↓
   Processed Jobs (useMemo)
        ↓
   Cards / Matching / Promotions

🚀 Getting Started
1️⃣ Install
npm install

2️⃣ Run
npm run dev


Open:

http://localhost:3000

3️⃣ Build
npm run build

⚙️ Environment Variables

Create .env:

VITE_GEMINI_API_KEY=your_api_key_here


Used for:

Voice → Job search parsing

Location geocoding

📱 Views Explained
<details> <summary>👷 Worker Flow</summary>
Steps

Select category

Jobs filtered by:

distance

category

experience

keyword

Sort priority:

nearest

verified

latest

Key Files

WorkerView.tsx

JobCard.tsx

CategoryGrid.tsx

</details>
<details> <summary>🧑‍💼 Employer Flow</summary>
Steps

Complete profile

Post job

OTP verify

Job → Pending approval

Promote job

View matching workers

Key Files

EmployerView.tsx

EmployerProfileDrawer.tsx

MatchingWorkersView.tsx

PromoteJobView.tsx

</details>
<details> <summary>🎙 Voice Search System</summary>

Uses:

Web Speech API → speech to text

Gemini API → parse intent

Flow:

speech → text → Gemini → filters → update UI


Files:

geminiService.ts

voiceCategoryMatcher.ts

</details>
<details> <summary>📢 Promotions System</summary>

Employers can:

Buy plan

Set radius

Time-based expiry

Logic:

job.isPromoted = true
promotion.radiusKm
promotion.expiresAt


Workers see:

“Promoted Jobs Near You” section

Files:

promotionPlanService.ts

EmployerPromoteView.tsx

</details>
<details> <summary>📦 Mock Data System (Development)</summary>

No backend required.

Includes:

150 mock workers

Jobs across all categories

Random salary/location

Files:

mockWorkers.ts

mockJobs.ts

</details>
🧩 Core Concepts Used
React

Hooks

useMemo

useEffect

Context API

Browser APIs

Geolocation

SpeechRecognition

Audio playback

Optimization

Memoized job filtering

Lazy rendering

Mobile-first layout

🎯 Key Functional Logic
Job Filtering
jobs
 → approved
 → live
 → category
 → distance
 → experience
 → search
 → sort

Distance Calculation

Haversine formula

Audio Resume
audioRef.current = new Audio(url)
audio.play()

🔥 Recent Improvements

Fixed category filter bug (showing all jobs)

Added WhatsApp contact

Added promoted jobs

Added audio resume playback

Added complete mock workers/jobs

Improved PC scrolling

Fixed typing issues

Cleaned unused variables

Employer/worker flows stabilized

🚀 Deployment
Vercel
npm run build


Upload build or connect repo.

📸 Screens (Mobile-first UI)

Category grid

Job feed

Worker cards

Employer dashboard

Promotions page

👨‍💻 Author

Sadaqath Ulla Qureshi
Full-stack Developer
Focus: React, TypeScript, Product UX

⭐ Why This Project Matters

This app solves:

✅ Local hiring
✅ Small business staffing
✅ Low-tech accessibility
✅ Voice-first search
✅ Hyperlocal discovery

Designed for real-world India-first use cases.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
