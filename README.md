# Med-Pal — Intelligent Healthcare Assistant

An AWWARDS-winning, cinematic AI-powered health assessment platform designed to revolutionize the traditional patient intake experience. Med-Pal transforms boring medical forms into a highly engaging, conversational interface that acts like a futuristic, intelligent medical AI gathering health signals in real-time.

---

## ✨ Features Built So Far

### 🌟 Immersive AI Frontend (React + Vite + Tailwind CSS v4 + Framer Motion)

- **Cinematic Conversational Flow**: Focuses on one health parameter at a time. Previous steps smoothly blur and shrink into the background as an interactive "chat memory", replacing the traditional static forms.
- **Smart Input Components**: 
  - Auto-expanding, glowing text areas for tracking symptoms.
  - Large interactive sliders and dynamic numeric inputs for evaluating physical metrics (Age, HR, SpO2, Temp).
  - Modern, animated selection toggles for demographics (Gender, History).
- **Intelligent Loading States**: A multi-phase pulsing interface that immerses the user in phases like *"Connecting to medial network"*, *"Parsing symptom profile"*, and *"Synthesizing AI diagnosis."*
- **🚨 High-Risk Emergency Alert System**: Should the backend AI detect a "High" or "Emergency" level severity based on conditions like extreme vitals or severe chest pains, the application interrupts the entire screen with a pulsating red glowing alert overlay. It also broadcasts a distinct alert sound (`alert.mp3`) advising for immediate medical attention.
- **Persistent Digital Twin**: An elegant, unobtrusive overlay widget fixed in the bottom right corner showing the user's latest recorded physical metrics, evaluated risk score, primary condition, and time of the last scan dynamically stored in `localStorage`.

### ⚙️ Robust Backend Simulation (Node.js + Express)

- **REST API Processing**: Features an asynchronous `POST /analyze` endpoint capable of digesting structured patient profiles efficiently.
- **Algorithmic Medical Sim (Mock LLM Engine)**: Currently evaluating the symptoms and biological vitals using logic to mimic an AI Doctor, responding with:
  - Validated JSON formats.
  - Granular `RiskScores` (0-100).
  - List of `PossibleConditions` and intervention `Recommendations`.
  - Severity gradings (`Safe`, `Warning`, `Emergency`).

---

## 🛠 Tech Stack

**Frontend:**
- [React 19](https://react.dev/) via [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/) (Icons)

**Backend:**
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Cors](https://www.npmjs.com/package/cors) & [Dotenv](https://www.npmjs.com/package/dotenv)

---

## 🚀 How to Run Locally

### 1. Start the Backend API
```bash
cd backend
npm install
node server.js
```
*The server will boot up and listen on `http://localhost:5000`*

### 2. Start the Immersive Web App
```bash
cd frontend
npm install
npm run dev
```
*The React app will serve on `http://localhost:5173` locally.*

---

*This application was built progressively with an emphasis on creating a friction-less, hyper-modern cinematic User Experience without altering the core functional API contracts.*
