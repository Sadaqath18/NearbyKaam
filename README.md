# 🚀 NearbyKaam – Hyperlocal Job & Worker Matching Platform

NearbyKaam is a **mobile-first hyperlocal job marketplace** that instantly connects **local employers** with **nearby workers**.

It is designed for **fast, local hiring**, especially for **India-first, low-tech accessibility use cases**, supporting **voice search, distance-based matching**, and **audio resumes**.

---

## 🌐 Live Deployment

🔗 **Live App:** https://nearbykaam.vercel.app  

---

## 🧠 Introduction

**NearbyKaam** bridges the gap between **local employers** and **nearby workers** using:

- GPS-based discovery
- Voice-first job search
- Smart filtering & sorting
- Audio resumes
- WhatsApp & call-based contact

The platform is optimized for **low-end devices**, **fast load times**, and **real-world hiring workflows**.

---

## ✨ Key Features

### 👷 Worker Side Features

<details> <summary><strong>Worker Capabilities</strong></summary>
- Browse jobs by category  
- Distance-based filtering (GPS)  
- Voice search (multi-language)  
- Experience-based filtering  
- Promoted jobs near you  
- Profile & resume upload  
- 🎙 Audio resume support  
- 📞 Call & 💬 WhatsApp contact  
</details>

----

### 🧑‍💼 Employer Side Features

<details> <summary><strong>Employer Capabilities</strong></summary>
- Post jobs with OTP verification  
- Upload shop photo  
- Track calls & WhatsApp clicks  
- Promote jobs with radius targeting  
- View matching workers  
- Play worker audio resumes  
- Persistent employer profile  
</details>

---

### ⚙️ System Features

<details> <summary><strong>Platform Capabilities</strong></summary>
- Mobile-first responsive UI  
- Offline mock data support  
- LocalStorage persistence  
- Multi-language support  
- Smart job sorting  
- Clean, modular architecture  
</details>

---

## 🎙 Voice Search System

<details>
<summary><strong>How Voice Search Works</strong></summary>

### 🔄 Flow
Speech → Text → Gemini API → Filters → UI Update


### 🧠 Explanation

1. **Speech Recognition**
   - Uses the **Web Speech API** to convert user voice into text.

2. **Intent Parsing**
   - The transcribed text is sent to **Google Gemini API**.
   - Gemini extracts:
     - Job category
     - Experience level
     - Keywords

3. **Filter Application**
   - Parsed intent dynamically updates job filters.

4. **UI Refresh**
   - Job list updates instantly without page reload.

### 📁 Key Files

- `geminiService.ts`
- `voiceCategoryMatcher.ts`

</details>

---

## 📢 Promotions System

<details>
<summary><strong>Employer Promotions Flow</strong></summary>

### 👨‍💼 Employer Can

- Buy promotion plans  
- Set targeting radius  
- Define promotion expiry  

### ⚙️ Promotion Logic

```ts
job.isPromoted = true
promotion.radiusKm
promotion.expiresAt
```

### 👷 Worker Sees

Dedicated “Promoted Jobs Near You” section

Jobs shown based on:

- Distance
- Active promotion
- Expiry time

### 📁 Key Files

 promotionPlanService.ts
- EmployerPromoteView.tsx

</details>

---
## 🛠 Tech Stack

| Layer        | Technology |
|-------------|------------|
| Frontend    | React + TypeScript + Vite |
| Styling     | Tailwind CSS |
| State       | React Hooks |
| Voice       | Web Speech API |
| AI Parsing  | Google Gemini API |
| Storage     | LocalStorage |
| Deployment  | Vercel |

---

## 📂 Project Structure

```bash
src/
 ├── components/      # UI components (cards, drawers, grids)
 ├── views/           # WorkerView, EmployerView
 ├── services/        # Gemini, promotions, utilities
 ├── constants/       # Mock data & static configs
 ├── context/         # Language context
 ├── types/           # TypeScript interfaces
 └── utils/           # Helpers & filters
```

__________

## 🚀 Getting Started

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Run Development Server
```bash
npm run dev
```
Open in browser:
```bash
http://localhost:3000
```

### 3️⃣ Build for Production
```bash
npm run build
```

### ⚙️ Environment Variables

Create a .env or .env.local file:
```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

Used For:

- Voice → Job search intent parsing
- Location-based query understanding
  
______

## ⭐ Why This Project Matters

NearbyKaam solves:

✅ Local hiring
✅ Small business staffing
✅ Low-tech accessibility
✅ Voice-first discovery
✅ Hyperlocal job matching

Built for real-world, India-first hiring needs.

_________

## 🛣 Roadmap & Future Enhancements

Planned features and long-term improvements are documented here:

➡️ [View Future Enhancements](./FUTURE_ENHANCEMENTS.md)
____

## 👨‍💻 Author

##  Sadaqath Ulla Qureshi
Full-stack Developer
Focus: React, TypeScript, Product UX
______
