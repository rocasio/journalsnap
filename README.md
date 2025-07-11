# 📝 JournalSnap

**AI‑powered daily note summarizer** built with React, Vite, Tailwind CSS, and OpenAI. Paste your meeting notes, journal entries, or research snippets and get back a concise summary plus action items — instantly.

---

## 🚀 Features

- **Instant Summaries**  
  Converts free‑form notes into a one‑paragraph summary.  
- **Action Item Extraction**  
  Bulleted list of next steps, pulled directly from your text.  
- **Zero‑Config Frontend**  
  Built with React + Vite for a snappy dev experience.  
- **Lightweight Styling**  
  Utility‑first Tailwind CSS plus your own global overrides.  
- **Local Development + Proxy**  
  Express proxy keeps your OpenAI key safe and avoids CORS/rate limits.

---

## 🛠️ Tech Stack

- **Framework:** React  
- **Build Tool:** Vite (with SWC)  
- **Styling:** Tailwind CSS + custom global CSS  
- **Backend Proxy:** Node.js + Express  
- **AI Integration:** OpenAI (gpt‑3.5‑turbo)  
- **Utilities:** concurrently, dotenv, cors  

---

## 📋 Prerequisites

- [Node.js ≥ 16](https://nodejs.org/)  
- An OpenAI account with an API key  
- (Optional) Git & GitHub account for version control

---

## 🔧 Getting Started

1. **Clone the repo**  
   git clone https://github.com/YOUR_USERNAME/journalsnap.git
   cd journalsnap
2. **Install dependencies**
    npm install
3. **Configure Environment**
    cp .env.example .env
  Edit .env and add your keys:
    VITE_OPENAI_API_KEY="sk-…your-frontend-key…"
    OPENAI_API_KEY="sk-…your-backend-key…"
4. **Start development servers**
    npm run dev

  React/Vite frontend will launch on http://localhost:5173
  Express proxy will run on http://localhost:3000
5. **Open your browser and start pasting notes!**

---

## 📂 Project Structure
journalsnap/
- ├─ public/                  **_Static assets & index.html_**
- ├─ src/
- │  ├─ components/
- │  │  ├─ InputArea.jsx     **_Note input & “Summarize” button_**
- │  │  └─ SummaryBox.jsx    **_Displays AI summary + actions_**
- │  ├─ globals.css          **_Your custom global styles_**
- │  ├─ index.css            **_Tailwind directives_**
- │  ├─ App.jsx              **_Main layout & logic_**
- │  └─ main.jsx             **_React entrypoint_**
- ├─ server.js               **_Express proxy for OpenAI calls_**
- ├─ .env.example            **_Sample environment variables_**
- ├─ .gitignore              
- ├─ package.json            
- ├─ tailwind.config.js      
- ├─ postcss.config.js       
- └─ vite.config.js          

---

## 💡 Usage
1. Paste your raw notes into the textarea.

2. Click Summarize.

3. Read your Summary and Action Items.

**Example input:**
> John spoke about the secret project, codenamed "Project Nine". He says we will need funding before this goes ahead. Ted chimed in and noted that Company ABC is willing to fund the project, but our CEO will need to meet with them ASAP.

**Example output:**
> Summary:
> > John announced that “Project Nine” requires funding, and Ted confirmed that Company ABC is willing to provide it.
        
> Action Items:
> > - Secure funding for Project Nine.
> > - Schedule an ASAP meeting between CEO and Company ABC.

---

## 🔮 Future Improvements
✅ Persist summaries in localStorage (Phase 2)

🔲 Add user authentication & multi‑device sync (Supabase/Firebase)

✅ Polish UI/UX & responsive design

🔲 Deploy to Vercel or Netlify with CI/CD

✅ Export summaries to Markdown, email, or PDF

---

## 🤝 Contributing
1. Fork the repo

2. Create a feature branch (git checkout -b feature/…)

3. Commit your changes (git commit -m "feat: …")

4. Push (git push origin feature/…) and open a PR

---

## 📄 License
This project is open‑source under the **MIT License**. See [LICENSE](License.txt) for details.
