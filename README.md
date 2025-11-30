# ⚽ StatSphere

**StatSphere** is a full-stack football analytics and community platform that lets users explore live and historical match data, analyze team and player performance, and access predictive insights such as Ballon d’Or forecasts and match outcome predictions.

---

## 🚀 Features

- 📊 **Team & Player Stats** — View team information, player details, and performance data.
- 📈 **Interactive Charts** — Data visualized with Recharts for an engaging dashboard experience.
- 🤖 **Predictive Engine** — Rule-based (and later ML-driven) Ballon d’Or and match-outcome predictions.
- 🔐 **User Authentication** — (Planned) Postgres login & registration system.
- 💬 **Community Chatroom** — (Planned) Discussion hub for football fans.
- 🌐 **API Integration** — Future integration with API-Football for live fixtures and statistics.
- 🧱 **Modern Tech Stack** — Clean UI built with React & Tailwind, powered by a Node.js backend and PostgreSQL database.

---

## 🧠 Project Architecture

Frontend (React + Tailwind)
↕
Backend (Node.js + Express)
↕
Database (PostgreSQL)
↕
Predictive Engine (Python / ML)


---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, Tailwind CSS, Axios, Recharts |
| **Backend** | Node.js, Express.js, dotenv, CORS |
| **Database** | PostgreSQL |
| **Authentication** | PostgreSQL Auth (planned) |
| **Data Source** | API-Football |
| **Predictive Engine** | Python (scikit-learn / rule-based model) |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/SwindlerComputer/statsphere.git
cd statsphere

2️⃣ Install Dependencies

cd backend
npm install

Frontend:
cd ../frontend
npm install

3️⃣ Configure Environment Variables

Create a .env file inside the backend/ folder:
DB_USER=postgres
DB_PASS=yourpassword
DB_NAME=statsphere
DB_HOST=localhost
PORT=5000

4️⃣ Run the App

Start Backend:
cd backend
npm start

create another shell
Start Frontend:

cd ../frontend
npm start
